//THIS CODE IS SECURE!
//The cookies value is hidden within the session.
const http = require('http');
const fs = require('fs');
const url = require('url');
const qs = require('querystring');

//쿠키는 문자열이기 때문에 이를 쉽게 사용하기 위해 자바스크립트 객체 형식으로 바꾸어 주는 함수
//이 함수를 거치면 mycookie=test -> { mycookie: 'test }로 바뀜.
const parseCookies = (cookie = ' ') => cookie.split(';')
    .map(v => v.split('='))
    .reduce(([acc, k,v]) => {
        acc[k.trim()] = decodeURIComponent(v);
        return acc;
    }, {});

const session = {};
//
http.createServer((req, res) => {
    const cookies = parseCookies(req.headers.cookie);

    //주소가 /login으로 시작하는 경우
    if(req.url.startsWith('/login')) {
        const { query } = url.parse(req.url);
        const { name } = qs.parse(query);
        const expires = new Date();
        expires.setMinutes(expires.getMinutes() + 5);
        //session
        const uniqueInt = Date.now();
        session[uniqueInt] = {
            name, 
            expires,
        };
        res.writeHead(302, {
            Location: '/',
            'Set-Cookie': `name=${encodeURIComponent(name)}; 
            Expires=${expires.toGMTString()}; HttpOnly; Path=/`,
        });
        res.end();

    //session.cookie가 존재하고 민료 기간이 지나지 않았다면 session 변수에서 사용자 정보를 가져와 사용하게 됨.  
    } else if(cookies.session && session[cookies.session].expires > new Date()) {
        res.writeHead(200, {'Content-Type':'text/plain; charset=utf-8'});
        res.end(`${session[cookies.session].name}님 안녕하세요`);
    } else {
        try {
            const data = await fs.readFile('./cookie2.html');
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(data);
        } catch(err) {
            res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end(err.message);
        }
    }

}).listen(8085, () => {
    console.log("8085포트에서 서버 대기 중");
    });

/*
    서버에 사용자 정보를 저장하고 클라이언트와는 세션 아이디로만 소통함.
    세션 아이디는 꼭 쿠키를 사용해서 주고받지 않아도 되지만 많은 사이트들이 쿠키를 사용함. 제일 간단하기 때문..
    그러나 실제 배포용 서버에서는 세션을 변수에 저장하지 않는다. 서버가 멈추거나 재시작되면 메모리에 저장된 변수가 초기화되기 때문이다.
    또한 서버의 메모리가 부족하면 세션을 ㅓ장하지 못하는 문제도 생길 수가 있다. 그래서 보통은
    Redis나 memcached같은 db에 저장한다. 
*/