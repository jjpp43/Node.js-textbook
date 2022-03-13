const http = require('http');

http.createServer((req, res) => {
    console.log(req.url, req.headers.cookie);
    res.writeHead(200, { 'Set-Cookie': 'mycookie=test'});
    res.end('Hello Cookie');
}).listen(8083, () => {
    console.log('8083번 포트에서 서버 대기 중...');
});

//쿠키는 req.headers.cookie에 들어있음. 
//쿠키는 요청과 응답의 헤더를 통해 오고가기 떄문에 응답의 헤더에 쿠키를 기록하기 위해서 res.writeHead메서드를 사용함.
//Set-Cookie : tells the browser to store the cookie (in this case : mycookie=test)