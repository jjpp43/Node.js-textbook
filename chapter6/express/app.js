const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

const app = express();
app.set('port', process.env.PORT || 3000);

/* morgan is a Node. js and Express middleware
 *  to log HTTP requests and errors, and simplifies the process
 */
app.use(morgan('dev'));
app.use('/', express.static(path.join(__dirname, 'public')));
app.use(express.json());

/* false -> querystring module을 사용하여 querystring을 해석한다.
 *  true -> qs module을 사용하여 query string을 해석한다. 
 *          qs module은 내장 모듈이 아니라 querystring 모듈의 기능을 확장한 npm 패키지다. 
 */
app.use(express.urlencoded({extended: false}));

/*  요청에 동봉된 쿠키를 해석해 req.cookies객체로 만든다. 
 *  예를 들어 name=johnDoe 쿠키를 보냈다면 req.cookies는 {name: 'johnDoe'}가 됨. 
 *  유효기간이 지난 쿠키들은 알아서 걸러준다. 
 *  서명된 쿠키가 있는 경우 비밀 키를 통해 해당 쿠키가 내 서버가 만든 쿠키임을 검증할 수 있음. 
 *  서명된 쿠키는 req.signedCookies에 객체가 들어있음. 
 *  쿠키를 생성하기 위해서는 res.cookie(key, value, option), 제거하기 위해서는 res.clearCookie(key, value, option)를 사용한다. 
 *  쿠키를 제거하기 위해서는 key, value, option값이 모두 일치해야됨. 
 */
app.use(cookieParser(process.env.COOKIE_SECRET));

/* express-session : 로그인처럼 세션을 구현하거나 특정 사용자를 위한 데이터를 임시적으로 저장해둘 때 유용.
 * 세션은 사용자별로 req.session 객체 안에 유지됨.
 * resave : 요청이 올 때 세션에 수정 사항이 생기지 않더라도 세션을 다시 저장할지 
 * saveUninitialized : 세션에 저장할 내역이 없더라도 처음부터 세션을 생성할지 
 * 여담으로 express-session에서 서명한 쿠키 앞에는 's:'가 붙는다. 이게 encodeURIComponent함수가 실행되어 's%3A'가 됨.
 * 쿠키 값이 s%3A로 시작되면 express-session 미들웨어에 의해 암호화된 것
 */
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


app.use((req, res, next) => {
    console.log('모든 요청에 다 실행됩니다.');
    next();
});

//주소를 넣어주면 해당 요청에서만 미들웨어가 실행됨.
app.get('/', (req, res, next) => {
    console.log('GET / 요청에서만 실행됩니다. ');
    next();
}, (req, res) => {
    throw new Error('에러는 에러 처리 미들웨어로 갑니다.');
});

//에러처리 미들웨어는 매개변수가 4개다. 4개 다 사용하지 않더라도 매개변수는 반드시 4개여야함. 
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send(err.message);
});

app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 서버 대기 중..');
});

/**
 * 미들웨어는 익스프레승의 핵심이다. 요청과 응답의 중간에 위치하여 미들웨어라고 부른다.
 * 미들웨어는 req, res, next를 매개변수로 가지는 함수로써 app.use, app.get, app.post 등과 함께 사용된다.
 * 다음 미들웨어로 넘어가기 위해서는 next를 호출해야 한다. 
 * next를 호출하지 않는 미들웨어는 res.send나 res.sendFile등의 메서드로 응답을 보내야 함. 
 * next도 호출하지 않으면 클라이언트는 응답을 받지 못해 하염없이 기다리게 된다.  
 */