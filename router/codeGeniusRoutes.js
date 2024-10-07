const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('codeGenius/Code-home')
});

router.route('/logout')
    .get((req, res) => {
        req.session.destroy();
        res.redirect('/')
    })


router.route('/about')
    .get((req, res) => {
        res.render('codeGenius/Code-about')
    })


router.route('/faq')
    .get((req, res) => {
        res.render('codeGenius/Code-faq')
    })


router.route('/forum')
    .get((req, res) => {
        res.render('codeGenius/Code-forum')
    })
    .post((req, res) => {

    })

router.route('/ask')
    .get((req, res) => {
        res.render('codeGenius/Code-ask')
    })
    .post((req, res) => {

    })

router.route('/support')
    .get((req, res) => {
        res.render('codeGenius/Code-support')
    })
    .post((req, res) => {

    })

router.route('/home')
    .get((req, res) => {
        res.redirect('/')
    })


router.route('/sign-in')
    .get((req, res) => {
        res.render('codeGenius/Code-sign-in')
    })
    .post((req, res) => {

    })

router.route('/sign-up')
    .get((req, res) => {
        res.render('codeGenius/Code-sign-up')
    })
    .post((req, res) => {

    })

module.exports = router;
