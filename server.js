const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session')
const bodyParser = require('body-parser')
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//session
app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: false,
    saveUninitialized: true
}));
//middleware to pass session variables to views
app.use(function (req, res, next) {
    res.locals.success = req.session.success;
    res.locals.error = req.session.error;
    res.locals.successImage = req.session.successImage;
    res.locals.resultImage = req.session.resultImage;
    res.locals.name = req.session.name;
    res.locals.loggedin = req.session.loggedin;
    
    next();
})
//views
app.set('view engine', 'ejs');
//public
app.use('/clickgenius', express.static(path.join(__dirname, "/public/click_genius")));
app.use('/', express.static(path.join(__dirname, "/public/code_genius")));
//routes
app.use('/', require('./router/codeGeniusRoutes'));
app.use('/clickgenius', require('./router/clickGeniusRoutes'));
//port
app.listen(3000, () => {
    console.log("Server running on port 3000");
});