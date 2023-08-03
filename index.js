require("dotenv").config();
const { MYSQL_HOST, MYSQL_USER, MYSQL_PWD, MYSQL_PORT, EXPRESS_PORT } =
  process.env;

const mysql = require("mysql2");
const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PWD,
  database: "HNW-User",
});

const express = require("express");
const favicon = require("serve-favicon");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(favicon(__dirname + "/favicon.ico"));

app.post("/login", (req, res) => {
  console.log("Login Request.");

  const sql = "SELECT * FROM userInfo WHERE email = ? AND password = ?";
  const { email, password } = req.body;
  console.log(`Trying to login -> ${email} : ${password}`);

  connection.query(sql, [email, password], (err, rows, fields) => {
    console.log(rows);
    if (rows.length < 1) {
      res.status(404).send("존재하지 않는 사용자입니다");
    } else {
      res.send({ id: rows[0].id });
    }
  });
});

app.post("/join", (req, res) => {
  console.log("Join Request");

  const { name, email, password } = req.body;
  const sql =
    "INSERT INTO userInfo(`name`, `email`, `password`) VALUES (?, ?, ?)";
  console.log(`Trying to Sign up -> ${name} : ${email} : ${password}`);

  connection.query(sql, [name, email, password], (err, rows, fields) => {
    if (err) {
      console.log(err);
    } else {
      res.send("감사합니다");
    }
  });
});

app.listen(process.env.EXPRESS_PORT, () => {
  console.log(`Running on ${process.env.EXPRESS_PORT}`);
});
