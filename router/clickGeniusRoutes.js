const db = require('../db');
const upload = require('../upload');
const express = require('express');
const router = express.Router();
const request = require('postman-request');
const bcrypt = require('bcrypt');
<<<<<<< HEAD
const saltRounds = 10;

=======
const fs = require('fs')
const saltRounds = 10;

function handlePostRequest(url, data) {
    console.log("handlePostRequest");
    return new Promise((resolve, reject) => {
        request.post({ url, formData: data }, (error, response, body) => {
            if (error) {
                console.error('Erro na requisição POST:', error);
                return reject(error); // Rejeita em caso de erro de requisição
            }

            // Verifica se o status da resposta está fora da faixa de sucesso (2xx)
            if (response.statusCode < 200 || response.statusCode >= 300) {
                const postError = new Error(`Erro na requisição POST: Status ${response.statusCode}`);
                console.error(postError.message);
                return reject(postError); // Rejeita em caso de status de erro
            }

            resolve(body); // Retorna o corpo da resposta caso a requisição tenha sido bem-sucedida
        });
    });
}


function handleGetRequest(url) {
    console.log("handleGetRequest");
    return new Promise((resolve, reject) => {
        request.get(url, (error, response, body) => {
            if (error) {
                console.error('Erro na requisição GET:', error);
                return reject(error); // Rejeita em caso de erro de requisição
            }

            if (response.statusCode === 404) {
                const notFoundError = new Error(`URL não encontrado: ${url}`);
                console.error(notFoundError.message);
                return reject(notFoundError); // Rejeita se o status for 404 (não encontrado)
            }

            resolve(body); // Retorna o corpo da resposta caso a requisição tenha sido bem-sucedida
        });
    });
}


>>>>>>> 5170cdf (correção de função principal e estilzação de codeGenius)
router.get('/', (req, res) => {
    res.render('clickGenius/Click-home')
});

<<<<<<< HEAD


=======
>>>>>>> 5170cdf (correção de função principal e estilzação de codeGenius)
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
                req.session.user_email = result[0].email
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
                const clicks_id = row.clicks_id;
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
                    clicks_post.form_value,
                    clicks_post.value_type  -- Adição da coluna value_type
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
                                const valueType = [];  // Armazena o value_type

                                formResults.forEach((row) => {
                                    const form_name = row.form_name;
                                    const form_value = row.form_value;
                                    const form_value_type = row.value_type; // Pega o value_type

                                    name.push(form_name);
                                    value.push(form_value);
                                    valueType.push(form_value_type);  // Adiciona o value_type ao array
                                });

                                console.log(name);
                                console.log(value);
                                console.log(valueType);  // Mostra o value_type no console

                                existingDomain.tests.push({ testUrl, method, name, value, valueType });  // Adiciona valueType ao push
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
<<<<<<< HEAD
        let tests = [];
        let untestedDomains = [];

=======
        const tests = [];
        const formPromises = [];
    
        console.log('Iniciando o POST request...');
    
>>>>>>> 5170cdf (correção de função principal e estilzação de codeGenius)
        const sqlQuery = `
            SELECT 
                domain.domain, 
                domain.id AS domain_id,
<<<<<<< HEAD
                clicks.urls AS testUrl
=======
                clicks.id AS clicks_id,
                clicks.urls AS testUrl,
                clicks.method
>>>>>>> 5170cdf (correção de função principal e estilzação de codeGenius)
            FROM users
            INNER JOIN user_click ON users.id = user_click.id_user
            INNER JOIN clicks ON user_click.id_click = clicks.id
            INNER JOIN domain ON clicks.id_domain = domain.id
<<<<<<< HEAD
            WHERE users.id = ? and domain.id = ?;
        `;

=======
            WHERE users.id = ? AND domain.id = ?;
        `;
    
        console.log("ID usuário:", req.session.user_id);
        console.log("ID domínio:", req.body.domain_id);
    
>>>>>>> 5170cdf (correção de função principal e estilzação de codeGenius)
        db.query(sqlQuery, [req.session.user_id, req.body.domain_id], (error, results) => {
            if (error) {
                console.error('Erro ao executar a consulta SQL:', error);
                res.status(500).send('Erro ao processar a requisição.');
                return;
            }
<<<<<<< HEAD

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
=======
    
            results.forEach((row) => {
                const domain_id = row.domain_id;
                const domain = row.domain;
                const testUrl = row.testUrl;
                const method = row.method;
                const clicks_id = row.clicks_id;
                console.log('methods', method);
    
                let existingDomain = tests.find((item) => item.domain === domain && item.domain_id === domain_id);
    
                if (!existingDomain) {
                    existingDomain = { domain, domain_id, tests: [] };
                    tests.push(existingDomain);
                }
    
                if (method === "get") {
                    existingDomain.tests.push({ testUrl, method, resultImage: [] });
                } else if (method === "post") {
                    const sqlQuery = `
                        SELECT
                            clicks_post.form_name,
                            clicks_post.form_value,
                            clicks_post.value_type
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
                                const valueType = [];
    
                                formResults.forEach((row) => {
                                    name.push(row.form_name);
                                    value.push(row.form_value);
                                    valueType.push(row.value_type);
                                });
    
                                existingDomain.tests.push({ testUrl, method, name, value, valueType, resultImage: [] });
                                resolve();
                            });
                        })
                    );
                }
            });
    
            Promise.all(formPromises).then(() => {
                console.log('Testes preparados:', tests);
    
                const requestData = {};
                const requests = tests.map((test) => {
                    return new Promise((resolve) => {
                        test.tests.forEach((singleTest, index) => {
                            const url = test.domain + singleTest.testUrl;
    
                            if (singleTest.method === 'get') {
                                requestPromise = handleGetRequest(url);
                            } else if (singleTest.method === 'post') {
                                for (let i = 0; i < singleTest.valueType.length; i++) {
                                    if (singleTest.valueType[i] === 'text') {
                                        requestData[singleTest.name[i]] = singleTest.value[i];
                                    } else if (singleTest.valueType[i] === 'file') {
                                        const userFolderPath = `./public/click_genius/images/users/${req.session.user_email}`;
                                        const fileName = singleTest.value[i];
                                        const filePath = `${userFolderPath}/${fileName}`;
                                        requestData[singleTest.name[i]] = fs.createReadStream(filePath);
                                    }
                                }
    
                                requestPromise = handlePostRequest(url, requestData);
                            }
    
                            requestPromise.then(() => {
                                singleTest.resultImage.push('images/bootstrap icons/success.svg');
                                resolve();
                            }).catch((error) => {
                                singleTest.resultImage.push('images/bootstrap icons/error.svg');
                                test_error = true;
                                resolve();
                            });
                        });
                    });
                });
    
                Promise.all(requests).then(() => {
                    // **Segunda consulta SQL: Pegar testes não testados**
                    const sqlQueryNotTested = `
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
                        WHERE users.id = ? AND domain.id != ?;
                    `;
    
                    console.log("ID usuário:", req.session.user_id);
                    console.log("ID domínio:", req.body.domain_id);
    
                    db.query(sqlQueryNotTested, [req.session.user_id, req.body.domain_id], (error, resultsNotTested) => {
                        if (error) {
                            console.error('Erro ao executar a consulta SQL:', error);
                            res.status(500).send('Erro ao processar a requisição.');
                            return;
                        }
                        console.log('resultados não testados:', resultsNotTested);
                        
                        const formPromisesNotTested = [];
    
                        resultsNotTested.forEach((row) => {
                            console.log('not test');
                            const domain_id = row.domain_id;
                            const domain = row.domain;
                            const testUrl = row.testUrl;
                            const method = row.method;
                            const clicks_id = row.clicks_id;
                            let existingDomain = tests.find((item) => item.domain === domain && item.domain_id === domain_id);
    
                            if (!existingDomain) {
                                existingDomain = { domain, domain_id, tests: [] };
                                tests.push(existingDomain);
                            }
                            console.log(method);
                            if (method === "get") {
                                existingDomain.tests.push({ testUrl, method });
                            } else if (method === "post") {
                                const sqlQuery = `
                                    SELECT
                                        clicks_post.form_name,
                                        clicks_post.form_value,
                                        clicks_post.value_type
                                    FROM clicks_post
                                    WHERE clicks_post.id_clicks = ?;
                                `;
    
                                formPromisesNotTested.push(
                                    new Promise((resolve, reject) => {
                                        db.query(sqlQuery, [clicks_id], (error, formResults) => {
                                            if (error) {
                                                console.error('Erro ao executar a consulta SQL:', error);
                                                reject(error);
                                                return;
                                            }
    
                                            const name = [];
                                            const value = [];
                                            const valueType = [];
    
                                            formResults.forEach((row) => {
                                                name.push(row.form_name);
                                                value.push(row.form_value);
                                                valueType.push(row.value_type);
                                            });
    
                                            console.log(name);
                                            console.log(value);
                                            console.log(valueType);
    
                                            existingDomain.tests.push({ testUrl, method, name, value, valueType });
                                            resolve();
                                        });
                                    })
                                );
                            }
                        });
    
                        Promise.all(formPromisesNotTested).then(() => {
                            console.log(tests);
                            res.render('clickGenius/Click-my-click', { tests });
                        }).catch((error) => {
                            console.error('Erro ao processar a requisição:', error);
                            res.status(500).send('Erro ao processar a requisição.');
                        });
                    });
                }).catch((error) => {
                    console.error('Erro ao processar a requisição:', error);
                    res.status(500).send('Erro ao processar a requisição.');
                });
            }).catch((error) => {
                console.error('Erro ao processar a requisição:', error);
>>>>>>> 5170cdf (correção de função principal e estilzação de codeGenius)
                res.status(500).send('Erro ao processar a requisição.');
            });
        });
    });
<<<<<<< HEAD
=======
    


>>>>>>> 5170cdf (correção de função principal e estilzação de codeGenius)


router.route('/add-click')
    .get((req, res) => {
        res.render('clickGenius/Click-add-click');
    })
    .post(upload.any(), (req, res) => {
        console.log(req.files);
        console.log(req.body);

        const { test, methods } = req.body;
        const domain = req.body.domain;
        const userId = req.session.user_id;

        if (!domain || !userId) {
            return res.status(400).send('Dados faltando: domínio ou ID do usuário.');
        }

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
                        db.query('INSERT INTO clicks (id_domain, urls, method) VALUES (?, ?, ?)', [domainId, url, method], (err, result) => {
                            if (err) {
                                console.error('Erro ao inserir URL:', url, err);
                                reject(err);
                                return;
                            }
                            const clickId = result.insertId;

                            db.query('INSERT INTO user_click (id_user, id_click) VALUES (?, ?)', [userId, clickId], (err) => {
                                if (err) {
                                    console.error('Erro ao criar relacionamento id_user e id_click:', userId, clickId, err);
                                    reject(err);
                                    return;
                                }

                                if (method === "post") {
                                    const formNames = Array.isArray(req.body[`name${index + 1}`]) ? req.body[`name${index + 1}`] : [];
                                    const formValues = Array.isArray(req.body[`value${index + 1}`]) ? req.body[`value${index + 1}`] : [];
                                    const formTypes = Object.keys(req.body)
                                        .filter(key => key.startsWith(`type${index + 1}_`))
                                        .map(key => req.body[key]);

                                    console.log(formNames);
                                    console.log(formValues);
                                    console.log(formTypes);

                                    let fileIndex = 0;

                                    const insertFormFields = formTypes.map((formType, i) => {
                                        const formName = formNames[i];
                                        const formValue = formValues[i];

                                        return new Promise((resolve, reject) => {
                                            if (formType === 'text') {
                                                db.query('INSERT INTO clicks_post (id_clicks, form_name, form_value, value_type) VALUES (?, ?, ?, ?)',
                                                    [clickId, formName, formValue, formType], (err) => {
                                                        if (err) {
                                                            console.error('Erro ao inserir dados do post:', method, err);
                                                            reject(err);
                                                        } else {
                                                            console.log('Dados inseridos com sucesso:', formName, formValue);
                                                            resolve();
                                                        }
                                                    });
                                            } else if (formType === 'file') {
                                                const file = req.files[fileIndex];

                                                if (file) {
                                                    const newFilename = file.filename;

                                                    db.query('INSERT INTO clicks_post (id_clicks, form_name, form_value, value_type) VALUES (?, ?, ?, ?)',
                                                        [clickId, formName, newFilename, formType], (err) => {
                                                            if (err) {
                                                                console.error('Erro ao inserir dados do post:', method, err);
                                                                reject(err);
                                                            } else {
                                                                console.log('Arquivo armazenado e dados inseridos com sucesso:', formName, newFilename);
                                                                resolve();
                                                            }
                                                        });

                                                    fileIndex++;
                                                } else {
                                                    console.error('Arquivo não encontrado para o campo:', formName);
                                                    reject(new Error('Arquivo não encontrado.'));
                                                }
                                            }
                                        });
                                    });

                                    Promise.all(insertFormFields).then(() => {
                                        resolve();  // Aqui resolvemos a promise se todos os inserts forem bem-sucedidos
                                    }).catch((error) => {
                                        console.error('Erro ao processar os campos de formulário:', error);
                                        reject(error);  // Rejeitamos a promise caso algum insert falhe
                                    });

                                } else {
                                    console.log('Relacionamento id_user e id_click criado com sucesso:', userId, clickId);
                                    resolve();  // Resolver diretamente para métodos que não sejam POST
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
                db.query('INSERT INTO clicks (id_domain, urls, method) VALUES (?, ?, ?)', [domainId, test, methods], (err, result) => {
                    if (err) {
                        console.error('Erro ao inserir URL:', test, err);
                        res.status(500).send('Erro ao processar a requisição.');
                        return;
                    }
                    const clickId = result.insertId;
                    db.query('INSERT INTO user_click (id_user, id_click) VALUES (?, ?)', [userId, clickId], (err) => {
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
