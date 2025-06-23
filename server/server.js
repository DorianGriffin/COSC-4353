// server.js

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection
const path = require('path');
const fs = require('fs');

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
  if (err) {
    console.error('Error connecting to DB:', err.message);
    return;
  }
  console.log('Connected to VolunteerDB!');
});

app.get('/', (req, res) => {
    console.log('GET / route hit');
    res.status(200).send('<h1>Backend is running!</h1>');
  });
  
app.get('/users', (req, res) => {
    db.query('SELECT * FROM Users LIMIT 5', (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(results);
    });
  });
// Start server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
  