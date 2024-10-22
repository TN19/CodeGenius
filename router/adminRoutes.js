const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const saltRounds = 10;

router.get('/', (req, res) => {
    const sql = 'SELECT * FROM support WHERE resolve = 0';
    db.query(sql, async (err, result) => {
        if (err) {
            console.error(err);
            return res.render('admin/Admin-home', { msgError: "server error" });
        }
        if (result.length === 0) {
            return res.render('admin/Admin-home', { msgError: "No support found" });
        }
        res.render('admin/Admin-home', { support: result });
    });
});

router.route('/logout')
    .get((req, res) => {
        req.session.destroy();
        res.redirect('/')
    })

router.route('/sign-in')
    .get((req, res) => {
        res.render('admin/Admin-sign-in')
    })
    .post(async (req, res) => {

        const { email, password } = req.body;
        console.log(req.body);
        const sql = 'SELECT * FROM administrator WHERE email = ?';
        db.query(sql, [email], async (err, result) => {
            if (err) {
                console.error(err);
                return res.render('admin/Admin-sign-in', { msgError: "server error" });
            }
            if (result.length === 0) {
                return res.render('admin/Admin-sign-in', { msgError: "no register found" });
            }

            const hashedPassword = result[0].password;
            const login_success = await bcrypt.compare(password, hashedPassword);

            if (login_success) {
                req.session.adminName = result[0].name
                req.session.adminLoggedin = true
                req.session.admin_id = result[0].id
                req.session.admin_email = result[0].email
                console.log('Login successful');
                console.log(result[0]);
                res.redirect('/admin');
            } else {
                res.render('admin/Admin-sign-in', { msgError: "email or password invalid" });
            }
        });
    });

router.route('/sign-up')
    .get((req, res) => {
        res.render('admin/Admin-sign-up')
    })
    .post(async (req, res) => {
        const { name, email, password } = req.body;
        try {
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const sql = 'INSERT INTO administrator (name, email, password) VALUES (?, ?, ?)';
            db.query(sql, [name, email, hashedPassword], (err, result) => {
                if (err) {
                    console.error(err);
                    res.render('admin/Admin-sign-up', { msgError: "server error" });
                }

                console.log('Success');

                res.redirect('/admin/sign-in');
            });
        } catch (err) {
            console.error(err);
            res.render('admin/Admin-sign-up', { msgError: "server error" });
        }
    });

    router.route('/support/:id')
    .get((req, res) => {
        res.render('admin/Admin-support',{id: req.params.id});
    })
    .post(async (req, res) => {
        const { content } = req.body;
        const supportId = req.params.id;

        try {
            // Insere a resposta na tabela support_answer
            const insertSql = 'INSERT INTO support_answer (id_support, content, id_administrator) VALUES (?, ?, ?)';
            await new Promise((resolve, reject) => {
                db.query(insertSql, [supportId, content, req.session.admin_id], (err, result) => {
                    if (err) {
                        console.error(err);
                        return reject(err);
                    }
                    console.log(result);
                    console.log('Resposta inserida com sucesso');
                    resolve();
                });
            });

            // Atualiza o campo "resolve" e "id_administrator" na tabela support
            const updateSql = 'UPDATE support SET resolve = ?, id_administrator = ? WHERE id = ?';
            await new Promise((resolve, reject) => {
                db.query(updateSql, [true, req.session.admin_id, supportId], (err, result) => {
                    if (err) {
                        console.error(err);
                        return reject(err);
                    }
                    console.log(result);
                    console.log('Status de suporte atualizado com sucesso');
                    resolve();
                });
            });

            res.redirect('/admin');
        } catch (err) {
            console.error(err);
            res.status(500).send('Error');
        }
    });

module.exports = router;
