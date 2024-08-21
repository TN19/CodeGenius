const express = require('express');
const router = express.Router();
const request = require('postman-request');

router.get('/', (req, res) => {
    res.render('codeGenius/Code-home')
});

router.get('/about', (req, res) => {
    res.render('codeGenius/Code-about')
});

router.get('/faq', (req, res) => {
    res.render('codeGenius/Code-faq')
});

router.get('/forum', (req, res) => {
    res.render('codeGenius/Code-forum')
});

router.get('/support', (req, res) => {
    res.render('codeGenius/Code-support')
});

router.get('/home', (req, res) => {
    res.redirect('/')
});

router.get('/sign-in', (req, res) => {
    res.render('codeGenius/Click-sign-in')
});

router.get('/sign-up', (req, res) => {
    res.render('codeGenius/Click-sign-up')
});

module.exports = router;
