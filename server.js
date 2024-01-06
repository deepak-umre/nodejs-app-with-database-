const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const path = require('path');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost/test');

// Define User schema and model (Make sure to define this part)
const UserSchema = new mongoose.Schema({
  email: String,
  password: String
});
const User = mongoose.model('User', UserSchema);

// Passport configuration
passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
  try {
    const user = await User.findOne({ email: email }).exec();
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return done(null, false);
    }
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views', 'home.html')));

app.all('/login', (req, res) => {
  if (req.method === 'GET') {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
  } else if (req.method === 'POST') {
    passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' })(req, res);
  }
});

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/login');
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'signup.html'));
});

app.post('/signup', (req, res) => {
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  new User({ email: req.body.email, password: hashedPassword }).save();
  res.redirect('/login');
});

// Start the server
app.listen(3000, () => console.log('Server started on port 3000'));

