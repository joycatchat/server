'use strict';

/*
export PORT=3000
export CLIENT_URL='http://localhost:8080'
export DATABASE_URL='postgres://localhost:5432/catchat'
*/

// Dependencies
const app = require('express')();
// const http = require('http').Server(app); //eslint-disable-line
// const io = require('socket.io')(http); //eslint-disable-line
const cors = require('cors');
const pg = require('pg');
const fs = require('fs'); //eslint-disable-line
const bodyParser =  require('body-parser').urlencoded({extended: true});

// App Setup
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
    SELECT username, password FROM users WHERE username='${req.query.username}';`)
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

// Load Profile
app.get('/loadprofile', (req, res) => {
  console.log('load profile: ', req.query);
  client.query(`
    SELECT * FROM users WHERE username='${req.query.username}';`)
    .then(result => res.send(result.rows[0]))
    .catch(err => console.error(err));
});

// Update Profile
app.put('/updateprofile', bodyParser, (req, res) =>{
  console.log('profile: ', req.body);

  client.query(`
    UPDATE users
    SET avatar='${req.body.avatar}',
    name='${req.body.name}', birthdate='${req.body.birthdate}', description='${req.body.description}'
    WHERE username='${req.body.username}';
    `)
    .then(res.send('profile edited'))
    .catch(err => console.error(err));
});

// Show Other Profiles
app.get('/showotherprofile', (req, res) => {
  console.log('load other profile: ', req.query);
  client.query(`
    SELECT * FROM users WHERE username='${req.query.username}';`)
    .then(result => res.send(result.rows[0]))
    .catch(err => console.error(err));
});

// Load Chat
app.get('/loadchat', (req, res) => {
  console.log('load chat');
  client.query(`SELECT messages FROM chat;`)
    .then(result => {
      res.send(result.rows);
    })
    .catch(err => {
      console.error(err);
      res.send('usererror');
    });
});

// Update Chat
app.put('/updatechat', bodyParser, (req, res) => {
  console.log('chat updated');

  client.query(`
    UPDATE chat
    SET messages='${JSON.stringify(req.body.messages)}'
    WHERE title='chat';
    `)
    .then(res.send('chat updated'))
    .catch(err => console.error(err));
});

// Send Message
app.post('/sendmessage', bodyParser, (req, res) => {
  client.query(`
    SELECT * FROM users WHERE username='${req.body.msgto}';`)
    .then((data) => {
      if (data.rows[0]) {
        client.query(`
        INSERT INTO messages (msgfrom, msgto, date, message)
        VALUES ('${req.body.msgfrom}', '${req.body.msgto}', '${req.body.date}', '${req.body.message}');
        `)
          .then(() => {
            res.send('message sent');
            console.log('message sent: ', req.body.msgto)
          })
          .catch(err => console.error(err));
      }
      else {
        res.send('no user');
        console.log('no user: ', req.body.msgto);
      }
    })
    .catch(err => console.error(err));
});

// API Final Endpoints
app.get('*', (req, res) => res.redirect(CLIENT_URL));

// io.on('connection', function(socket){
//   console.log('a user connected');
// });

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
      avatar VARCHAR(255) DEFAULT 'http://via.placeholder.com/150x150',
      name VARCHAR(255),
      birthdate VARCHAR(40),
      description TEXT
    );`
  )
    .then(loadChatDB)
    .catch(err => console.error(err))
}

function loadChatDB() {
  console.log('chat DB');
  client.query(`
    CREATE TABLE IF NOT EXISTS chat (
      title TEXT UNIQUE,
      messages TEXT
    );

    INSERT INTO chat (title)
    VALUES ('chat')
    ON CONFLICT DO NOTHING;
  `)
    .then(loadMessagesDB)
    .catch(console.log('load chat'));
}

function loadMessagesDB() {
  console.log('messages DB');
  client.query(`
    CREATE TABLE IF NOT EXISTS messages (
      msgfrom TEXT,
      msgto TEXT,
      date TEXT,
      message TEXT
    );
  `)
    .then()
    .catch(err => console.error(err));
}
