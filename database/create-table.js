const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'TCC_Ting'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Conectado ao MySQL');

  connection.query('CREATE DATABASE IF NOT EXISTS TCC_Ting', (err) => {
    if (err) throw err;
    console.log('Base de dados TCC_Ting criada ou já existente');

    connection.query('USE TCC_Ting', (err) => {
      if (err) throw err;
      console.log('Usando a base de dados TCC_Ting');

      const createTablesQueries = [
        `CREATE TABLE IF NOT EXISTS users (
          id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          password VARCHAR(255) NOT NULL,
          register_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS forum (
          id INT PRIMARY KEY AUTO_INCREMENT,
          id_user INT NOT NULL,
          title VARCHAR(255) NOT NULL,
          content TEXT,
          register_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (id_user) REFERENCES users(id)
        )`,
        `CREATE TABLE IF NOT EXISTS forum_answer (
          id INT PRIMARY KEY AUTO_INCREMENT,
          id_user INT NOT NULL,
          id_forum INT,
          message TEXT,
          FOREIGN KEY (id_user) REFERENCES users(id),
          FOREIGN KEY (id_forum) REFERENCES forum(id)
        )`,
        `CREATE TABLE IF NOT EXISTS domain (
          id INT PRIMARY KEY AUTO_INCREMENT,
          domain VARCHAR(255) NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS clicks (
          id INT PRIMARY KEY AUTO_INCREMENT,
          id_domain INT NOT NULL,
          urls TEXT,
          method VARCHAR(255),
          register_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (id_domain) REFERENCES domain(id)
        )`,
        `CREATE TABLE IF NOT EXISTS clicks_post (
          id INT PRIMARY KEY AUTO_INCREMENT,
          id_clicks INT NOT NULL,
          form_name TEXT,
          form_value TEXT,
          value_type TEXT,
          register_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (id_clicks) REFERENCES clicks(id)
        )`,
        `CREATE TABLE IF NOT EXISTS user_click (
          id INT PRIMARY KEY AUTO_INCREMENT,
          id_user INT NOT NULL,
<<<<<<< HEAD
          id_click INT NOT NULL,
          FOREIGN KEY (id_user) REFERENCES users(id),
          FOREIGN KEY (id_click) REFERENCES clicks(id)
=======
<<<<<<< HEAD
          id_clicks INT NOT NULL,
          FOREIGN KEY (id_user) REFERENCES users(id),
          FOREIGN KEY (id_clicks) REFERENCES clicks(id)
=======
          id_click INT NOT NULL,
          FOREIGN KEY (id_user) REFERENCES users(id),
          FOREIGN KEY (id_click) REFERENCES clicks(id)
>>>>>>> 5170cdf (correção de função principal e estilzação de codeGenius)
>>>>>>> 971d626bfe664499af6426e1b173ffe82586d8df
        )`,
        `CREATE TABLE IF NOT EXISTS administrator (
          id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          password VARCHAR(255) NOT NULL,
          register_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS support (
          id INT PRIMARY KEY AUTO_INCREMENT,
          id_user INT NOT NULL,
          title VARCHAR(255) NOT NULL,
          content TEXT,
          resolve BOOLEAN DEFAULT FALSE,
          id_administrator INT,
          FOREIGN KEY (id_user) REFERENCES users(id),
          FOREIGN KEY (id_administrator) REFERENCES administrator(id)
        )`,
        `CREATE TABLE IF NOT EXISTS support_answer (
          id INT PRIMARY KEY AUTO_INCREMENT,
          id_support INT,
          content TEXT,
          id_administrator INT,
          FOREIGN KEY (id_support) REFERENCES support(id),
          FOREIGN KEY (id_administrator) REFERENCES administrator(id)
        )`
    ];
    
      createTablesQueries.forEach((query) => {
        connection.query(query, (err) => {
          if (err) throw err;
          console.log('Tabela criada ou já existente');
        });
      });
      connection.end();
    });
  });
});