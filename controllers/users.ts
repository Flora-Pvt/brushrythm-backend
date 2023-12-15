import { Request, Response } from 'express'
import { RowDataPacket } from 'mysql2'
const db = require('./../database/connection.ts')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()

exports.getUserById = (req: Request, res: Response) => {
  const { id } = req.params

  if (!id) {
    res.status(400).send({ message: 'user_id is required' })
    return
  }

  const getUserByIdQuery = `SELECT * FROM ${process.env.DB_NAME}.users WHERE id = ?`

  const preparedQuery = db.format(getUserByIdQuery, id)

  db.query(preparedQuery, (err: Error, user: RowDataPacket[]) => {
    if (err) {
      res.status(400).send(err)
      return
    }

    res.status(200).send(user)
  })
}

exports.login = (req: Request, res: Response) => {
  const { username, email, password } = req.body

  if (!username && !email) {
    res.status(400).send({ message: 'username or email is required' })
    return
  }
  if (!password) {
    res.status(400).send({ message: 'password is required' })
    return
  }

  /** TODO: add username to be used */
  const loginQuery = `SELECT * FROM ${process.env.DB_NAME}.users WHERE email = ?;`

  const preparedQuery = db.format(loginQuery, email)

  db.query(preparedQuery, (err: Error, result: RowDataPacket[]) => {
    if (err) {
      res.status(400).send(err)
      return
    }

    const user = result[0]

    /** compare password with hash */
    bcrypt
      .compare(password, user.password)
      .then((valid: Response) => {
        if (!valid) {
          return res.status(401).json({ error: 'Incorrect password' })
        }
        /** create a token */
        res.status(200).json({
          id: user.id,
          token: jwt.sign({ id: user.id }, 'RANDOM_TOKEN_SECRET', {
            expiresIn: '24h',
          }),
        })
      })
      .catch((error: Error) => res.status(500).json({ error }))
  })
}

exports.signup = (req: Request, res: Response) => {
  const { age, name, username, email, password, month } = req.body

  /** TODO: add valid email and strong password requirement */
  if (!username && !email) {
    res.status(400).send({ message: 'username or email is required' })
    return
  }
  if (!password) {
    res.status(400).send({ message: 'password is required' })
    return
  }

  /** password "salted" 10 times */
  bcrypt.hash(password, 10).then((hash: Response) => {
    const table = `INSERT INTO ${process.env.DB_NAME}.users `
    const columns =
      '(`age`, `name`, `username`, `email`, `password`, `streak`, `experience`, `gems`, `breaks`, `morning_bonus`, `evening_bonus`, `bonuses`, `quests_completed`, `month`) '
    const values = `VALUES (?, ?, ?, ?, ?, '0', '0', '0', '0', '0', '0', '0', '0', ?);`

    const signupQuery = table + columns + values

    const inserts = [age, name, username, email, hash, month]

    const preparedQuery = db.format(signupQuery, inserts)

    db.query(preparedQuery, (err: Error, result: RowDataPacket) => {
      if (err) {
        res.status(400).send(err)
        return
      }

      res.status(200).send({
        userId: result.insertId,
        token: jwt.sign({ userId: result.insertId }, 'RANDOM_TOKEN_SECRET', {
          expiresIn: '24h',
        }),
      })
    })
  })
}

exports.updateUser = (req: Request, res: Response) => {
  const { id } = req.params
  if (!id) {
    res.status(400).send({ message: 'user_id is required' })
    return
  }

  const allowedKeys = [
    'name',
    'username',
    'email',
    'streak',
    'experience',
    'gems',
    'breaks',
    'morning_bonus',
    'evening_bonus',
    'bonuses',
    'quests_completed',
    'month',
  ]

  let updates: string[] = []
  for (const [key, value] of Object.entries(req.body)) {
    if (!value) {
      res.status(400).send({ message: 'a value is required' })
      return
    }
    if (!allowedKeys.includes(`${key}`)) {
      res.status(400).send({ message: 'key not allowed' })
      return
    }

    updates.push(`${key} = '${value}'`)
  }
  if (!updates.length) {
    res.status(400).json({ message: 'No updates provided' })
    return
  }

  const updateUser = `UPDATE ${process.env.DB_NAME}.users SET ${updates.join(
    ', '
  )} WHERE id = ?`

  const preparedQuery = db.format(updateUser, id)

  db.query(preparedQuery, (err: Error, user: RowDataPacket[]) => {
    if (err) {
      res.status(400).send(err)
      return
    }

    res.status(200).send(user)
  })
}
