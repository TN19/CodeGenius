const mysql = require('mysql');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
};

const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');

    const dbName = 'TCC_Ting';
    const dropDbSql = `DROP DATABASE IF EXISTS ${dbName}`;
    connection.query(dropDbSql, (err) => {
        if (err) {
            console.error('Error dropping the database:', err);
            connection.end(); 
            return;
        }
        console.log(`Database ${dbName} dropped successfully`);

        connection.end((err) => {
            if (err) {
                console.error('Error closing the connection:', err);
                return;
            }
            console.log('Connection closed');
        });
    });
});