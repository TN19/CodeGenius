const db = require('../db');
const upload = require('../upload');
const express = require('express');
const router = express.Router();
const request = require('postman-request');
const bcrypt = require('bcrypt');
const saltRounds = 10;

function handleGetRequest(url) {
    return new Promise((resolve) => {
        request.get(url, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                console.log('Successful GET request for:', url);
                resolve('images/bootstrap icons/success.svg');
            } else {
                console.error('GET request error for:', url);
                resolve('images/bootstrap icons/error.svg');
            }
        });
    });
}

function handlePostRequest(url, formData) {
    return new Promise((resolve) => {
        request.post({ url: url, form: formData }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                console.log('Successful POST request for:', url);
                resolve('images/bootstrap icons/success.svg');
            } else {
                console.error('POST request error for:', url);
                resolve('images/bootstrap icons/error.svg');
            }
        });
    });
}

router.get('/', (req, res) => {
    res.render('clickGenius/Click-home')
});



router.route('/sign-up')
    .get((req, res) => {
        res.render('clickGenius/Click-sign-up');
    })
    .post(async (req, res) => {
        const { name, email, password } = req.body;
        try {
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
            db.query(sql, [name, email, hashedPassword], (err, result) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Error');
                    return;
                }

                console.log('Success');
                res.redirect('/clickGenius/sign-in');
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error');
        }
    });

router.route('/sign-in')
    .get((req, res) => {
        res.render('clickGenius/Click-sign-in');
    })
    .post(async (req, res) => {
        const { email, password } = req.body;
        console.log(req.body);
        const sql = 'SELECT * FROM users WHERE email = ?';
        db.query(sql, [email], async (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error');
                return;
            }

            if (result.length === 0) {
                res.status(401).send('Invalid credentials');
                return;
            }

            const hashedPassword = result[0].password;
            const login_success = await bcrypt.compare(password, hashedPassword);

            if (login_success) {
                req.session.name = result[0].name
                req.session.loggedin = true
                req.session.user_id = result[0].id
                console.log('Login successful');
                console.log(result[0]);
                res.redirect('/clickGenius');
            } else {
                res.status(401).send('Invalid credentials');
            }
        });
    });

router.route('/logout')
    .get((req, res) => {
        req.session.destroy();
        res.redirect('/clickGenius')
    })

router.route('/my-click')
    .get((req, res) => {
        const sqlQuery = `
      SELECT 
        domain.domain, 
        domain.id AS domain_id,
        clicks.id AS clicks_id,
        clicks.urls AS testUrl,
        clicks.method
      FROM users
      INNER JOIN user_click ON users.id = user_click.id_user
      INNER JOIN clicks ON user_click.id_click = clicks.id
      INNER JOIN domain ON clicks.id_domain = domain.id
      WHERE users.id = ?;
    `;

        db.query(sqlQuery, [req.session.user_id], (error, results) => {
            if (error) {
                console.error('Erro ao executar a consulta SQL:', error);
                res.status(500).send('Erro ao processar a requisição.');
                return;
            }

            const tests = [];
            const formPromises = [];

            results.forEach((row) => {
                const domain_id = row.domain_id;
                const domain = row.domain;
                const testUrl = row.testUrl;
                const method = row.method;
                const clicks_id = row.clicks_id; // Correção do nome da coluna
                let existingDomain = tests.find((item) => item.domain === domain && item.domain_id === domain_id);

                if (!existingDomain) {
                    existingDomain = { domain, domain_id, tests: [] };
                    tests.push(existingDomain);
                }

                if (method === "get") {
                    existingDomain.tests.push({ testUrl, method });
                } else if (method === "post") {
                    const sqlQuery = `
                    SELECT
                        clicks_post.form_name,
                        clicks_post.form_value
                    FROM clicks_post
                    WHERE clicks_post.id_clicks = ?;
                `;

                    formPromises.push(
                        new Promise((resolve, reject) => {
                            db.query(sqlQuery, [clicks_id], (error, formResults) => {
                                if (error) {
                                    console.error('Erro ao executar a consulta SQL:', error);
                                    reject(error);
                                    return;
                                }

                                const name = [];
                                const value = [];
                                formResults.forEach((row) => {
                                    const form_name = row.form_name;
                                    const form_value = row.form_value;
                                    name.push(form_name);
                                    value.push(form_value);
                                });
                                console.log(name)
                                console.log(value)
                                existingDomain.tests.push({ testUrl, method, name, value });
                                resolve();
                            });
                        })
                    );
                }
            });

            Promise.all(formPromises).then(() => {
                console.log(tests);
                res.render('clickGenius/Click-my-click', { tests });
            }).catch((error) => {
                console.error('Erro ao processar a requisição:', error);
                res.status(500).send('Erro ao processar a requisição.');
            });
        });
    })
    .post((req, res) => {
        let test_error = false;
        let tests = [];
        let untestedDomains = [];

        const sqlQuery = `
            SELECT 
                domain.domain, 
                domain.id AS domain_id,
                clicks.urls AS testUrl
            FROM users
            INNER JOIN user_click ON users.id = user_click.id_user
            INNER JOIN clicks ON user_click.id_click = clicks.id
            INNER JOIN domain ON clicks.id_domain = domain.id
            WHERE users.id = ? and domain.id = ?;
        `;

        db.query(sqlQuery, [req.session.user_id, req.body.domain_id], (error, results) => {
            if (error) {
                console.error('Erro ao executar a consulta SQL:', error);
                res.status(500).send('Erro ao processar a requisição.');
                return;
            }

            results.forEach((row) => {
                const domain = row.domain;
                const domain_id = row.domain_id;
                const testUrl = row.testUrl;
                let resultImage = '';
                let existingDomain = tests.find((item) => item.domain === domain);

                if (!existingDomain) {
                    existingDomain = { domain, domain_id, tests: [], resultImages: [] };
                    tests.push(existingDomain);
                }

                existingDomain.tests.push({ testUrl });
                existingDomain.resultImages.push({ resultImage });
            });

            console.log('Tests:', tests);

            const requests = tests.map((test) => {
                return new Promise((resolve) => {
                    test.tests.forEach((singleTest, index) => {
                        const url = test.domain + singleTest.testUrl;
                        const method = req.body.methods[index]; // Assuming `methods` is passed in the same order as `tests`

                        console.log('URL:', url, 'Method:', method);

                        const requestPromise = method === 'post' ? handlePostRequest(url, formData) : handleGetRequest(url);

                        requestPromise.then((resultImage) => {
                            singleTest.resultImage = resultImage;
                            resolve();
                        }).catch((error) => {
                            console.error('Request error:', error);
                            singleTest.resultImage = 'images/bootstrap icons/error.svg';
                            test_error = true;
                            resolve();
                        });
                    });
                });
            });

            Promise.all(requests).then(() => {
                const sqlQueryUntested = `
                    SELECT 
                        domain.domain, 
                        domain.id AS domain_id,
                        clicks.urls AS testUrl
                    FROM users
                    INNER JOIN user_click ON users.id = user_click.id_user
                    INNER JOIN clicks ON user_click.id_click = clicks.id
                    INNER JOIN domain ON clicks.id_domain = domain.id
                    WHERE users.id = ? and domain.id != ?;
                `;

                db.query(sqlQueryUntested, [req.session.user_id, req.body.domain_id], (error, resultsUntested) => {
                    if (error) {
                        console.error('Erro ao executar a segunda consulta SQL:', error);
                        res.status(500).send('Erro ao processar a requisição.');
                        return;
                    }

                    resultsUntested.forEach((row) => {
                        const domain_id = row.domain_id;
                        const domain = row.domain;
                        const testUrl = row.testUrl;

                        let existingDomain = tests.find((item) => item.domain === domain && item.domain_id === domain_id);

                        if (!existingDomain) {
                            existingDomain = { domain, domain_id, tests: [] };
                            tests.push(existingDomain);
                        }

                        existingDomain.tests.push({ testUrl });
                    });

                    console.log('Untested Domains:', untestedDomains);

                    console.log('Test Error:', test_error);
                    console.log(tests)
                    if (test_error) {
                        res.render('clickGenius/Click-my-click', { error: 'Test error...', tests });
                    } else {
                        res.render('clickGenius/Click-my-click', { success: 'Test completed successfully!!!', tests });
                    }
                });
            }).catch((error) => {
                console.error(error);
                res.status(500).send('Erro ao processar a requisição.');
            });
        });
    });


router.route('/add-click')
    .get((req, res) => {
        res.render('clickGenius/Click-add-click')
    })
    .post((req, res) => {
        console.log(req.body);
        const { test, methods } = req.body;
        const domain = req.body.domain;
        const userId = req.session.user_id;

        db.query('INSERT INTO domain (domain) VALUES (?)', [domain], (error, results) => {
            if (error) {
                console.error('Erro ao inserir domínio:', error);
                res.status(500).send('Erro ao processar a requisição.');
                return;
            }

            const domainId = results.insertId;

            if (Array.isArray(test) && Array.isArray(methods) && test.length === methods.length) {
                const insertClicks = test.map((url, index) => {
                    const method = methods[index];
                    return new Promise((resolve, reject) => {
                        db.query('INSERT INTO clicks (id_domain, urls, method) VALUES (?, ?, ?)', [domainId, url, method], (err, res) => {
                            if (err) {
                                console.error('Erro ao inserir URL:', url, err);
                                reject(err);
                                return;
                            }
                            const clickId = res.insertId;
                            db.query('INSERT INTO user_click (id_user, id_click) VALUES (?, ?)', [userId, clickId], (err, res) => {
                                if (err) {
                                    console.error('Erro ao criar relacionamento id_user e id_click:', userId, clickId, err);
                                    reject(err);
                                    return;
                                }
                                console.log(method)
                                if (method === "post") {
                                    console.log('index:' + index)
                                    const formNames = req.body[`name${index + 1}`] || [];
                                    const formValues = req.body[`value${index + 1}`] || [];
                                    if (Array.isArray(formNames) && Array.isArray(formValues) && formNames.length === formValues.length) {
                                        const insertFormFields = formNames.map((formName, i) => {
                                            const formValue = formValues[i];
                                            return new Promise((resolve, reject) => {
                                                db.query('INSERT INTO clicks_post (id_clicks, form_name, form_value) VALUES (?, ?, ?)', [clickId, formName, formValue], (err, res) => {
                                                    if (err) {
                                                        console.error('Erro ao inserir dados do post:', method, err);
                                                        reject(err);
                                                        return;
                                                    }
                                                    resolve();
                                                });
                                            });
                                        });

                                        Promise.all(insertFormFields).then(() => {
                                            console.log('Dados do post inseridos com sucesso:', clickId);
                                            resolve();
                                        }).catch((error) => {
                                            console.error('Erro ao processar a inserção de dados do post:', error);
                                            reject(error);
                                        });
                                    } else {
                                        console.error('Os arrays de form_name e form_value não têm o mesmo comprimento ou são inválidos.');
                                        reject(new Error('Requisição inválida.'));
                                    }
                                } else {
                                    console.log('Relacionamento id_user e id_click criado com sucesso:', userId, clickId);
                                    resolve();
                                }
                            });
                        });
                    });
                });

                Promise.all(insertClicks).then(() => {
                    res.render('clickGenius/Click-add-click');
                }).catch((error) => {
                    console.error('Erro ao processar a inserção de URLs:', error);
                    res.status(500).send('Erro ao processar a requisição.');
                });

            } else if (typeof test === 'string' && typeof methods === 'string') {
                db.query('INSERT INTO clicks (id_domain, urls, method) VALUES (?, ?, ?)', [domainId, test, methods], (err, res) => {
                    if (err) {
                        console.error('Erro ao inserir URL:', test, err);
                        res.status(500).send('Erro ao processar a requisição.');
                        return;
                    }
                    const clickId = res.insertId;
                    db.query('INSERT INTO user_click (id_user, id_click) VALUES (?, ?)', [userId, clickId], (err, res) => {
                        if (err) {
                            console.error('Erro ao criar relacionamento id_user e id_click:', userId, clickId, err);
                            res.status(500).send('Erro ao processar a requisição.');
                            return;
                        }
                        console.log('Relacionamento id_user e id_click criado com sucesso:', userId, clickId);
                        res.render('clickGenius/Click-add-click');
                    });
                });

            } else {
                console.error('Os arrays de testes e métodos não têm o mesmo comprimento ou são inválidos.');
                res.status(400).send('Requisição inválida.');
            }
        });
    });


module.exports = router;
