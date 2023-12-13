const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const db = require('./../database/connection.ts')

exports.getUserById = (req, res) => {
  const { id } = req.params

  if (!id) {
    res.status(418).send({ message: 'user_id is required' })
    return
  }

  const getUserByIdQuery = `SELECT * FROM brushrythm_development.users WHERE id = ${id};`

  db.query(getUserByIdQuery, (err, user) => {
    if (err) {
      res.status(400).send(err)
      return
    }

    res.status(200).send(user)
  })
}

exports.login = (req, res) => {
  const { username, email, password } = req.body

  if (!username && !email) {
    res.status(418).send({ message: 'username or email is required' })
    return
  }
  if (!password) {
    res.status(418).send({ message: 'password is required' })
    return
  }

  /** TODO: add username to be used */
  const getUserByIdQuery = `SELECT * FROM brushrythm_development.users WHERE email = '${email}';`

  db.query(getUserByIdQuery, (err, result) => {
    if (err) {
      res.status(400).send(err)
      return
    }

    const user = result[0]

    /** compare password with hash */
    bcrypt
      .compare(password, user.password)
      .then((valid) => {
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
      .catch((error) => res.status(500).json({ error }))
  })
}

exports.signup = (req, res) => {
  const { age, name, username, email, password, month } = req.body

  /** TODO: add valid email and strong password requirement */
  if (!username && !email) {
    res.status(418).send({ message: 'username or email is required' })
    return
  }
  if (!password) {
    res.status(418).send({ message: 'password is required' })
    return
  }

  /** password "salted" 10 times */
  bcrypt.hash(password, 10).then((hash) => {
    const addUserQuery =
      'INSERT INTO `brushrythm_development`.`users` (`age`, `name`, `username`, `email`, `password`, `streak`, `experience`, `gems`, `breaks`, `morning_bonus`, `evening_bonus`, `bonuses`, `quests_completed`, `month`) ' +
      `VALUES ('${age}', '${name}', '${username}', '${email}', '${hash}', '0', '0', '0', '0', '0', '0', '0', '0', '${month}');`

    db.query(addUserQuery, (err, result) => {
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

// TODO: add update user
