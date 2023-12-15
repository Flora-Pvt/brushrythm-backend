import { Request, Response, NextFunction } from 'express'
const express = require('express')
const app = express()
const PORT = 8080

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`)
})

/** database connection */
require('./database/connection.ts')

/* -- configure request headers -- */
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
  )
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  )
  next()
})

app.use(express.json())

/** routes path configuration */
const usersRoutes = require('./routes/users.ts')
app.use('/api/users', usersRoutes)

module.exports = app
