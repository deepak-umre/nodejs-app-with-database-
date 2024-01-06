// app.js
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const User = require('./models/User'); // Added this line to import User model

const app = express();

// Connect to your database
mongoose.connect('mongodb://localhost:27017/nodejs-login-app', { useNewUrlParser: true, useUnifiedTopology: true });

// Set up EJS for templating
app.set('view engine', 'ejs');

// BodyParser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Define routes
app.get('/', (req, res) => res.render('index'));
app.get('/login', (req, res) => res.render('login'));
app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
});

// Register Form
app.get('/register', (req, res) => res.render('register'));

// Register Process
app.post('/register', (req, res) => {
    const newUser = new User({
        username: req.body.username,
        password: req.body.password
    });

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser.save()
                .then(user => {
                    res.redirect('/login');
                })
                .catch(err => {
                    console.log(err);
                    return;
                });
        });
    });
});

// Login Process
app.post('/login',
    passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/');
    }
);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, console.log(`Server started on port ${PORT}`));