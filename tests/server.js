const express = require('express');
const mysql = require('mysql');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3333;

// Configuração do MySQL
const db = mysql.createConnection({
<<<<<<< HEAD
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'test'
=======
<<<<<<< HEAD
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'test'
>>>>>>> 971d626bfe664499af6426e1b173ffe82586d8df
});

app.set('view engine', 'ejs');

// Middleware para processar dados do corpo da requisição
app.use(express.urlencoded({ extended: true })); // Para processar dados do formulário
app.use(express.json()); // Para processar JSON, se necessário

// Configuração do Multer para upload de imagem
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage }).single('file'); // Para upload de um único arquivo

// Rota para exibir o formulário
app.get('/cadastro', (req, res) => {
    res.render('form');
});

// Rota para lidar com o cadastro de usuário
app.post('/cadastro', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(500).send('Erro ao fazer upload da foto.');
        }

        // Extrair dados do corpo da requisição
        const { nome, email, senha } = req.body;
        const foto = req.file ? req.file.filename : null; // Nome do arquivo da foto

        // Verificação se os dados estão sendo recebidos corretamente
        console.log('Dados recebidos:', { nome, email, senha });
        console.log('Arquivo recebido:', req.file);

        // Caso os dados estejam vazios, envie uma resposta de erro
        if (!nome || !email || !senha) {
            return res.status(400).send('Nome, email ou senha estão faltando.');
        }

        // Inserir dados na tabela de usuários
        const sql = 'INSERT INTO usuarios (nome, email, senha, foto) VALUES (?, ?, ?, ?)';
        db.query(sql, [nome, email, senha, foto], (err, result) => {
            if (err) {
                console.error('Erro ao inserir dados no banco:', err);
                return res.status(500).send('Erro ao cadastrar usuário.');
            }
            console.log('Usuário cadastrado com sucesso:', result);
            res.send('Cadastro realizado com sucesso!');
        });
    });
});

// Iniciar servidor
app.listen(port, () => {
<<<<<<< HEAD
    console.log(`Servidor rodando em http://localhost:${port}`);
});
=======
  console.log(`Servidor rodando em http://localhost:${port}`);
});
=======
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'test'
});

app.set('view engine', 'ejs');

// Middleware para processar dados do corpo da requisição
app.use(express.urlencoded({ extended: true })); // Para processar dados do formulário
app.use(express.json()); // Para processar JSON, se necessário

// Configuração do Multer para upload de imagem
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage }).single('file'); // Para upload de um único arquivo

// Rota para exibir o formulário
app.get('/cadastro', (req, res) => {
    res.render('form');
});

// Rota para lidar com o cadastro de usuário
app.post('/cadastro', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(500).send('Erro ao fazer upload da foto.');
        }

        // Extrair dados do corpo da requisição
        const { nome, email, senha } = req.body;
        const foto = req.file ? req.file.filename : null; // Nome do arquivo da foto

        // Verificação se os dados estão sendo recebidos corretamente
        console.log('Dados recebidos:', { nome, email, senha });
        console.log('Arquivo recebido:', req.file);

        // Caso os dados estejam vazios, envie uma resposta de erro
        if (!nome || !email || !senha) {
            return res.status(400).send('Nome, email ou senha estão faltando.');
        }

        // Inserir dados na tabela de usuários
        const sql = 'INSERT INTO usuarios (nome, email, senha, foto) VALUES (?, ?, ?, ?)';
        db.query(sql, [nome, email, senha, foto], (err, result) => {
            if (err) {
                console.error('Erro ao inserir dados no banco:', err);
                return res.status(500).send('Erro ao cadastrar usuário.');
            }
            console.log('Usuário cadastrado com sucesso:', result);
            res.send('Cadastro realizado com sucesso!');
        });
    });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
>>>>>>> 5170cdf (correção de função principal e estilzação de codeGenius)
>>>>>>> 971d626bfe664499af6426e1b173ffe82586d8df
