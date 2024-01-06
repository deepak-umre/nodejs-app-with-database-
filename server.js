const express = require('express');
const mariadb = require('mariadb');
const bcrypt = require('bcrypt');
const passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const path = require('path');

const app = express();

// Install required modules if not exist
const installRequiredModules = () => {
  const requiredModules = ['express', 'mariadb', 'bcrypt', 'passport', 'express-session', 'passport-local', 'path'];
  requiredModules.forEach(module => {
    try {
      require.resolve(module);
    } catch (err) {
      console.log(`Module ${module} not found. Installing...`);
      const { exec } = require('child_process');
      exec(`npm install ${module}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error installing ${module}: ${error}`);
          return;
        }
        console.log(`Module ${module} installed successfully`);
      });
    }
  });
};

installRequiredModules();

// Connect to MariaDB
mariadb.createConnection({host: 'localhost', user: 'root', password: '12345', database: 'test'})
.then(conn => {
  global.conn = conn;
})
.catch(err => {
  console.log('Unable to connect to MariaDB:', err);
});

// Define User schema and model (Make sure to define this part)
const User = { email: String, password: String };

// Passport configuration
passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
  try {
    const user = await global.conn.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!user || !bcrypt.compareSync(password, user[0].password)) {
      return done(null, false);
    }
    return done(null, user[0]);
  } catch (error) {
    return done(error);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await global.conn.query('SELECT * FROM users WHERE id = ?', [id]);
  done(null, user[0]);
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
    passport.authenticate('local', {
      successRedirect: '/dashboard', // Redirect to the new page
      failureRedirect: '/login'
    })(req, res);
  }
});

// Route for the new page (example)
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});


// Start the server
app.listen(3000, () => console.log('Server started on port 3000'));
