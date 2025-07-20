// server/models/db.js
const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: 3306,
  ssl: {
    ca: fs.readFileSync('/Users/erinsebastian/Downloads/DigiCertGlobalRootCA.crt.pem'),
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = db;