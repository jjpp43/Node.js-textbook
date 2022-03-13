const http = require('http');
const fs = require('fs');
const url = require('url');
const qs = require('qs');

//쿠키는 문자열이기 때문에 이를 쉽게 사용하기 위해 자바스크립트 객체 형식으로 바꾸어 주는 함수
//이 함수를 거치면 mycookie=test -> { mycookie: 'test }로 바뀜.
const parseCookies = (cookie = ' ') => cookie.split(';')
    .map(v => v.split('='))
    .reduce(([acc, k,v]) => {
        acc[k.trim()] = decodeURIComponent(v);
        return acc;
    }, {});

//주소가 /login으로 시작할 경우 url과 querystring모듈로 각각 주소와 주소에 딸려오는 query를 분석함.
//302응답코드와 함께 리다이레긑 주소도 함께 쿠키를 header에 넣는다. 
//Set-Cookie값에는 줄바꿈이 들어가면 안됨. 
//또한 header에는 한글을 설정할 수 없으므로 name변수를 encodeURIComponent 메서드로 인코딩 함.
http.createServer((req, res) => {
    const cookies = parseCookies(req.headers.cookie);

    //주소가 /login으로 시작하는 경우
    if(req.url.startsWith('/login')) {
        const { query } = url.parse(req.url);
        const { name } = qs.parse(query);
        const expires = new Date();
        //쿠키 유효 시간을 현재시간 + 5분으로 설정
        expires.setMinutes(expires.getMinutes() + 5);
        res.writeHead(302, {
            Location: '/',
            'Set-Cookie': `name=${encodeURIComponent(name)}; 
            Expires=${expires.toGMTString()}; HttpOnly; Path=/`,
        });
        res.end();

    //name이라는 cookie가 있는 경우
    //쿠키가 없다면 로그인 페이지를 보낸다. 처음 방문한 경우엔 쿠키가 없으므로 cookie2.html을 보낸다.
    //쿠키가 있다면 로그인한 상태로 간주하여 인사말을 보낸다. 
    } else if(cookies.name) {
        res.writeHead(200, {'Content-Type':'text/plain; charset=utf-8'});
        res.end(`${cookies.name}님 안녕하세요`);
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

}).listen(8084, () => {
    console.log("8084포트에서 서버 대기 중");
    });

/*
    <Cookie Options>
    1. cookieName=cookieValue : 기본적인 쿠키 값
    2. Expires=date : 만료기한. 기본값은 클라이언트가 종료될 떄까지
    3. Max-age=seconds : Expires와 비슷하지만 초를 입력할 수 있다. Expires보다 우선시 됨. 
    4. Domain=domainName : 쿠키가 전송될 도메인을 특정할 수 있음. 기본값은 현재 도메인.
    5. Path=Url : 쿠키가 전송될 url을 특정할 수 있음. 기본값은 '/'
    6. Secure : https인 경우에만 쿠키가 전송됨.
    7. HttpOnly : 설정시 자바스크립트에서 쿠키에 접근할 수 없음. 쿠키 조작을 방지하기위해 설정하는 것이 좋음.
*/