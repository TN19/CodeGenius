const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const request = require('postman-request');
=======
>>>>>>> 5170cdf (correção de função principal e estilzação de codeGenius)

router.get('/', (req, res) => {
    res.render('codeGenius/Code-home')
});

<<<<<<< HEAD
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
=======
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
>>>>>>> 5170cdf (correção de função principal e estilzação de codeGenius)

module.exports = router;
