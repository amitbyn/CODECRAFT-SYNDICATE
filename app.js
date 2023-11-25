const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 5000; 

// User data - In-memory storage (not persistent)
let users = [
    { id: 1, username: 'user1', password: 'password1' },
];

// Configure passport
passport.use(new LocalStrategy(
    (username, password, done) => {
        let user = users.find(user => user.username === username && user.password === password);
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
    let user = users.find(user => user.id === id);
    done(null, user);
});

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'my secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Authentication check middleware
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

// Routes
app.get('/', (req, res) => {
    res.render('index', { user: req.user });
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' }));

app.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) {
            // Handle error
            console.error('Logout error:', err);
            return res.status(500).send('Error while logging out');
        }
        res.redirect('/');
    });
});


app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (users.find(user => user.username === username)) {
        return res.redirect('/register'); // Username exists
    }
    const newUser = { id: users.length + 1, username, password };
    users.push(newUser);
    res.redirect('/login');
});

// Protected routes example
app.get('/protected', isAuthenticated, (req, res) => {
    res.send('This is a protected route.');
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

app.use(express.static(path.join(__dirname, 'public')));