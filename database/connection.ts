require('dotenv').config()
const mysql = require('mysql2')

const database = mysql.createConnection({
  host: process.env.DB_HOST,
  user: 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
})
database.connect((err) => {
  if (err) throw err
  console.log('Connection to database successful!')
})

module.exports = database
