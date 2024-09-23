const express = require('express');
const mysql = require('mysql');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3333;

// Configuração do MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'test'
});
app.set('view engine', 'ejs');
// Conectar ao MySQL
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Conectado ao MySQL...');
});

// Configuração do Multer para upload de imagem
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage
}).single('foto'); // 'foto' deve corresponder ao campo de upload no formulário HTML

// Rota para lidar com o cadastro de usuário
app.get('/cadastro', (req, res) => {
    res.render('form')
})

app.post('/cadastro', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(500).send('Erro ao fazer upload da foto.');
    }

    // Extrair dados do corpo da requisição
    const { nome, email, senha } = req.body;
    const foto = req.file ? req.file.filename : null; // Nome do arquivo da foto

    // Inserir dados na tabela de usuários
    const sql = 'INSERT INTO usuarios (nome, email, senha, foto) VALUES (?, ?, ?, ?)';
    db.query(sql, [nome, email, senha, foto], (err, result) => {
      if (err) {
        return res.status(500).send('Erro ao cadastrar usuário.');
      }
      console.log('Usuário cadastrado com sucesso.');
      res.send('Cadastro realizado com sucesso!');
    });
  });
});


// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});