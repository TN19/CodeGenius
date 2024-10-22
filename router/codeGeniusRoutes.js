const express = require('express');
const db = require('../db');
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;

router.route('/home')
    .get((req, res) => {
        res.redirect('/')
    })

router.get('/', (req, res) => {
    res.render('codeGenius/Code-home')
});

router.route('/sign-up')
    .get((req, res) => {
        res.render('codeGenius/Code-sign-up')
    })
    .post(async (req, res) => {
        const { name, email, password } = req.body;
        try {
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
            db.query(sql, [name, email, hashedPassword], (err, result) => {
                if (err) {
                    console.error(err);
                    res.render('codeGenius/Code-sign-up', {msgError: "server error"});
                }

                console.log('Success');

                res.redirect('/sign-in');
            });
        } catch (err) {
            console.error(err);
            res.render('codeGenius/Code-sign-up', {msgError: "server error"});
        }
    });

router.route('/sign-in')
    .get((req, res) => {
        res.render('codeGenius/Code-sign-in')
    })
    .post(async (req, res) => {
        const { email, password } = req.body;
        console.log(req.body);
        const sql = 'SELECT * FROM users WHERE email = ?';
        db.query(sql, [email], async (err, result) => {
            if (err) {
                console.error(err);
                return res.render('codeGenius/Code-sign-in', {msgError: "server error"});
            }

            if (result.length == 0) {
                return res.render('codeGenius/Code-sign-in', {msgError: "no register found"});
            }

            const hashedPassword = result[0].password;
            const login_success = await bcrypt.compare(password, hashedPassword);

            if (login_success) {
                req.session.name = result[0].name
                req.session.loggedin = true
                req.session.user_id = result[0].id
                req.session.user_email = result[0].email
                console.log('Login successful');
                console.log(result[0]);
                res.redirect('/home');
            } else {
                res.render('codeGenius/Code-sign-in', {msgError: "email or password invalid"});
            }
        });
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

router.route('/forum/:id')
    .get((req, res) => {
        res.render('codeGenius/Code-forum-details')
    })
    .post((req, res) => {

    })

router.route('/ask')
    .get((req, res) => {
        res.render('codeGenius/Code-ask')
    })
    .post((req, res) => {
        const { title, content } = req.body
        try {
            const sql = 'INSERT INTO forum (id_user, title, content) VALUES (?, ?, ?)';
            db.query(sql, [req.session.user_id, title, content], (err, result) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Error');
                    return;
                }
                console.log(result)
                console.log('Success');
                res.redirect('/forum');
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error');
        }
    })

router.route('/support')
    .get((req, res) => {
        res.render('codeGenius/Code-support')
    })
    .post((req, res) => {
        const { title, content } = req.body
        try {
            const sql = 'INSERT INTO support (id_user, title, content) VALUES (?, ?, ?)';
            db.query(sql, [req.session.user_id, title, content], (err, result) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Error');
                    return;
                }
                console.log(result)
                console.log('Success');
                res.redirect('/support');
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error');
        }

    })

module.exports = router;
