'use strict';

/*
export PORT=3000
export CLIENT_URL='http://localhost:8080'
export DATABASE_URL='postgres://localhost:5432/catchat'
*/

// Dependencies
const express = require('express');
const cors = require('cors');
const pg = require('pg');
const fs = require('fs');
const bodyParser =  require('body-parser').urlencoded({extended: true});

// App Setup
const app = express();
const PORT = process.env.PORT;
const CLIENT_URL = process.env.CLIENT_URL;

// Database Setup
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

// Middleware
app.use(cors());

// API Endpoints

// API Final Endpoints
app.get('*', (req, res) => res.redirect(CLIENT_URL));

app.listen(PORT, () => console.log(`Server started on port ${PORT}!`));

// Database
loadUsersDB();

function loadUsersDB() {
  console.log('users DB');
  client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL,
      username VARCHAR(12) UNIQUE NOT NULL,
      password VARCHAR(16) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      avatar VARCHAR(255),
      name VARCHAR(255),
      birthdate VARCHAR(40),
      description TEXT
    );`
  )
    .then()
    .catch(err => console.error(err))
}
