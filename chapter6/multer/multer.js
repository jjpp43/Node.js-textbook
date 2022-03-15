const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

const app = express();
app.set('port', process.env.PORT || 3000);

app.use(
    morgan('dev'),
    express.static('/', path.join(__dirname, 'public')),
    express.json(),
    express.urlencoded({extended: false}),
    cookieParser(process.env.COOKIE_SECRET)
    );

app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false,
    },
    name: 'session-cookie',
}));

const multer = require('multer');
const fs = require('fs');

try {
    fs.readdirSync('uploads');
} catch (error) {
    console.error('upload 폴더가 없어 uploads 폴더를 생성합니다.');
    fs.mkdirSync('uploads');
}

/** multer 함수의 인수로 설정값들을 넣어준다.
 * storage : 어디(destination)에 어떤 이름(filename)으로 저장할지 넣을 수 있음.
 * req : 요청에 대한 정보 
 * file : 업로드한 파일에 대한 정보
 * req나 file의 데이터를 가공해서 done으로 넘기는 형식이다. 
 */
const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, done) {
            done(null, 'uploads/');
        },
        filename(req, file, done) {
            const ext = path.extname(file.originalname);
            done(null, path.basename(file.originalname, ext) + Date.now() + ext);
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
});
/*************여기부터 계속 해 250p ******************/
app.get('/upload', (req, res) => {
    res.sendFile(path.join(__dirname, 'multipart.html'));
});

app.post('/upload',
    upload.fields([{ name: 'img1' }, { name: 'img2' }]),
    (req, res) => {
        console.log(req.files, req.body);
        res.send('ok');
    }
);

app.use((req, res, next) => {
    console.log('모든 요청에 다 실행됩니다.');
    next();
});

app.get('/', (req, res, next) => {
    console.log('GET / 요청에서만 실행됩니다. ');
    next();
}, (req, res) => {
    throw new Error('에러는 에러 처리 미들웨어로 갑니다.');
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send(err.message);
});

app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 서버 대기 중..');
});
