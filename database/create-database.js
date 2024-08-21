const mysql = require('mysql');

// Configurações para conexão com o banco de dados MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: ''
});

// Conecta ao servidor MySQL
connection.connect((err) => {
  if (err) throw err;
  console.log('Conectado ao MySQL');

  // Criação da base de dados TCC-Ting se não existir
  connection.query('CREATE DATABASE IF NOT EXISTS TCC_Ting', (err) => {
    if (err) throw err;
    console.log('Base de dados TCC_Ting criada ou já existente');

    // Fecha a conexão com o servidor MySQL
    connection.end();
  });
});