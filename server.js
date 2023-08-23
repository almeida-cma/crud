const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

let db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Conectado ao banco de dados.');
});

db.run(`CREATE TABLE IF NOT EXISTS user (
    name text NOT NULL,
    email text NOT NULL,
	celular text
);`);

app.post('/dados', (req, res) => {
    let sql = `INSERT INTO user (name, email, celular) VALUES (?, ?, ?)`;
    let values = [req.body.name, req.body.email, req.body.celular];

    db.run(sql, values, function(err) {
        if (err) {
            return console.error(err.message);
        }
        console.log(`Rows inserted ${this.changes}`);
    });

    res.redirect('/return.html');
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname+'/public/index.html'));
});

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.get('/users', (req, res) => {
    let sql = "SELECT rowid as id, name, email FROM user";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.put('/users/:id', (req, res) => {
    const userId = req.params.id;
    const { name, email } = req.body;
    let sql = `UPDATE user SET name = ?, email = ? WHERE rowid = ?`;
    db.run(sql, [name, email, userId], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: "User updated", changes: this.changes });
    });
});

app.delete('/users/:id', (req, res) => {
    const userId = req.params.id;
    let sql = `DELETE FROM user WHERE rowid = ?`;
    db.run(sql, userId, function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: "User deleted", changes: this.changes });
    });
});