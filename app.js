const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// User data - this should be in a database in a real app
const users = [
    { id: 1, username: 'user1', password: 'password1' },
    // Add more users here
];

// Configure passport
passport.use(new LocalStrategy(
    (username, password, done) => {
        let user = users.find((user) => user.username === username && user.password === password);
        if (user) {
            return done(null, user);
        } else {
            return done(null, false, { message: 'Incorrect credentials.' });
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    let user = users.find((user) => user.id === id);
    done(null, user);
});

// Set view engine
app.set('view engine', 'ejs');

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'my secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get('/', (req, res) => {
    res.render('index', { user: req.user });
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', 
    passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' })
);

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
