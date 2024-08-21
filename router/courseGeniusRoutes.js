const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('courseGenius/Course-home')
});

router.get('/forum', (req, res) => {
    res.render('courseGenius/Course-forum')
});

router.get('/sign-in', (req, res) => {
    res.render('courseGenius/Course-sign-in')
});

router.get('/sign-up', (req, res) => {
    res.render('courseGenius/Course-sign-up')
});


module.exports = router;
