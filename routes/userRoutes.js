const express = require('express');
const user_route = express();
const userController = require('../controller/userController');
const bodyParser = require('body-parser');
const session = require('express-session')
const config = require('../config/config');
const auth = require('../middleware/auth')


//middleware to no-caching 
user_route.use(auth.nocache)

//Middlewre to session
user_route.use(
    session({
        secret : config.sessionSecret,
        resave : false,
        saveUninitialized: false,
        cookie: {secure: false}

    }))

// Middleware to parse incoming request bodies
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({ extended: true }));


// Set EJS as the template engine
user_route.set('view engine', 'ejs');
user_route.set('views', './view/user');

// Routes
user_route.get('/register', auth.isLogout,  userController.loadRegister);
user_route.post('/register', userController.insertUser);

user_route.get('/', (req, res) => {
    res.redirect('/login');
});

user_route.get('/login', auth.isLogout, userController.loginLoad);
user_route.post('/login', userController.verifyUser);
user_route.get('/home', auth.isLogin, userController.loadHome);

user_route.get('/edit', auth.isLogin, userController.editUser)
user_route.post('/edit', auth.isLogin, userController.modifyUser)

user_route.get('/logout',auth.isLogin, userController.userLogout)

user_route.get('*', userController.urlError)

module.exports = user_route;