const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const bodyParser = require('body-parser');
const LocalStrategy = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');
const User = require('./models/user');

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect('mongodb://localhost:27017/auth_demo_app', { useNewUrlParser: true });

app.use(require('express-session')({
    secret: "Very Good",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
};

app.get('/',(req,res)=>{
    res.render('home');
});

app.get('/secret',isLoggedIn,(req,res)=>{
    res.render('secret');
});

app.get('/register',(req,res)=>{
    res.render('register');
});

// user registration
app.post('/register',(req,res)=>{
    User.register(new User({username: req.body.username}),req.body.password,(err, user) => {
        if(err){
            console.log(err);
            return res.render('register');
        }
        // this code will only run if use in registerd successfully
        passport.authenticate('local')(req,res,() => {
            res.redirect('/secret');
        });

    });
});

// login routes
app.get('/login', (req, res) => {
    res.render('login');
});

//login logic
app.post('/login',passport.authenticate('local',{
    successRedirect: "/secret",
    failureRedirect: '/login'
}),(req,res)=>{

});

app.get('/logout',(req,res)=>{
    req.logout();
    res.redirect('/');
});



app.listen(3000,()=>{
    console.log('server started');
});
