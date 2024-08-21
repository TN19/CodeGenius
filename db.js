const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'TCC_Ting' 
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connection success');
});

module.exports = connection;