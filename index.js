// 환경 변수 불러오기
require("dotenv").config();
const cors = require("cors");

// 데이터 베이스 셋업
const mysql = require("mysql2");
const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PWD,
  database: "HNW-User",
});

// 업로드 서비스 준비
const multer = require("multer");
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images/"); // cb 콜백함수를 통해 전송된 파일 저장 디렉토리 설정
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // cb 콜백함수를 통해 전송된 파일 이름 설정
  },
});
var upload = multer({ storage: storage });

// 요청 서비스 준비
const axios = require("axios");
const fs = require("fs");

// 웹 서버 이니셜라이징
const express = require("express");
const favicon = require("serve-favicon");
const app = express();

// 웹 서버 러닝
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(favicon(__dirname + "/favicon.ico"));

// 로그인 서비스
app.post("/login", (req, res) => {
  console.log("Login Request.");

  const sql = "SELECT * FROM userInfo WHERE email = ? AND password = ?";
  const { email, password } = req.body;
  console.log(`Trying to login -> ${email} : ${password}`);

  connection.query(sql, [email, password], (err, rows, fields) => {
    if (rows.length < 1) {
      res.status(404).send("존재하지 않는 사용자입니다");
    } else {
      res.send({ id: rows[0].id });
    }
  });
});

// 회원 가입 서비스
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

// 중요
const FormData = require("form-data");

// 업로드 서비스
app.post("/search", upload.single("image"), async (req, res) => {
  const imageUrl = "http://127.0.0.1:3000/predict"; // 업로드할 서버의 URL
  const imagePath = "./images/image.jpg"; // 업로드할 이미지 파일의 경로

  const formData = new FormData();
  formData.append("file", fs.readFileSync(imagePath), "image.jpg");

  const response = await axios.post(imageUrl, formData, {
    headers: formData.getHeaders(),
  });
  res.send(response.data);
});

// 회사 정보 서비스
app.get("/comp", (req, res) => {
  console.log("Comp List Request.");

  connection.query("SELECT * FROM compInfo", (err, rows, fields) => {
    if (err) {
      console.log(err);
    }
    res.json(rows);
  });
});

// 카태고리 별 회사 반환
app.get("/comp/s/:service", (req, res) => {
  console.log("Comp Catalog Request.");

  console.log(req.params.service);

  connection.query(
    `SELECT * FROM compInfo WHERE service = "${req.params.service}"`,
    (err, rows, fields) => {
      if (err) {
        console.log(err);
      }
      res.json(rows);
    }
  );
});

app.get("/comp/:name", (req, res) => {
  console.log("Comp Catalog Request.");

  console.log(req.params.name);

  connection.query(
    `SELECT * FROM compInfo WHERE name = "${req.params.name}"`,
    (err, rows, fields) => {
      if (err) {
        console.log(err);
      }
      res.json(rows[0]);
    }
  );
});

// 서버 포트 열기
app.listen(process.env.EXPRESS_PORT, () => {
  console.log(`Running on ${process.env.EXPRESS_PORT}`);
});
