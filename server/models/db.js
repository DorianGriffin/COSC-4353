const mysql = require('mysql2');
const fs = require('fs');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: 3306,
  ssl: {
    ca: fs.readFileSync('/Users/erinsebastian/Downloads/DigiCertGlobalRootCA.crt.pem')
  }
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to VolunteerDB!');
});

module.exports = db;