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

// Login
app.get('/login', (req, res) => {
  console.log('login: ', req.query);
  client.query(`
    SELECT * FROM users WHERE username='${req.query.username}';`)
    .then(result => {
      if (result.rows[0].password === req.query.password) res.send(result.rows[0]);
      else res.send('passworderror');
    })
    .catch(err => {
      console.error(err);
      res.send('usererror');
    });
});

// Register
app.post('/register', bodyParser, (req, res) => {
  console.log('register: ', req.body);
  client.query(`
    INSERT INTO users (username, password)
    VALUES ('${req.body.username}', '${req.body.password}');
    `)
    .then(() => res.send('registered'))
    .catch(() => res.send('userexists'));
});

// Update Profile
app.put('/updateprofile', bodyParser, (req, res) =>{
  console.log('profile: ', req.body);
  client.query(`
    UPDATE users
    SET name='${req.body.username}', birthdate='${req.body.username}', description='${req.body.username}', avatar='${req.body.username}'
    WHERE username='${req.body.username}'
    `)
    .then(res.send('profile edited'))
    .catch(err => console.error(err));
});

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
      avatar VARCHAR(255),
      name VARCHAR(255),
      birthdate VARCHAR(40),
      description TEXT
    );`
  )
    .then()
    .catch(err => console.error(err))
}
