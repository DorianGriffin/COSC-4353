// server/models/userModel.js
const db = require("./db")

const findUserByUsername = (username, callback) => {
  db.query("SELECT * FROM users WHERE username = ?", [username], callback)
}

const createUser = (username, password, callback) => {
  // Updated to use password_hash column but store plain password
  db.query("INSERT INTO users (username, password_hash) VALUES (?, ?)", [username, password], callback)
}

module.exports = {
  findUserByUsername,
  createUser,
}
