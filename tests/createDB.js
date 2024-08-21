const mysql = require('mysql');

// Configurações do MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: ''
});

// Conectar ao MySQL
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Conectado ao MySQL...');

  // Criar banco de dados 'test'
  db.query('CREATE DATABASE IF NOT EXISTS test', (err, result) => {
    if (err) {
      throw err;
    }
    console.log('Banco de dados `test` criado ou já existente.');

    // Usar o banco de dados 'test'
    db.query('USE test', (err, result) => {
      if (err) {
        throw err;
      }
      console.log('Usando o banco de dados `test`.');

      // Criar tabela 'usuarios'
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS usuarios (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nome VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          senha VARCHAR(255) NOT NULL,
          foto VARCHAR(255) NOT NULL
        )
      `;
      db.query(createTableQuery, (err, result) => {
        if (err) {
          throw err;
        }
        console.log('Tabela `usuarios` criada ou já existente.');

        // Encerrar conexão com o MySQL
        db.end((err) => {
          if (err) {
            throw err;
          }
          console.log('Conexão ao MySQL encerrada.');
        });
      });
    });
  });
});