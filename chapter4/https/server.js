const https = require('https');
const fs = require('fs');
const { runInNewContext } = require('vm');

https.createServer({
    cert: fs.readFileSync('도메인 인증서 경로'),
    key: fs.readFileSync('도메인 비밀키 경로'),
    ca: [
        fs.readFileSync('상위 인증서 경로'),
        fs.readFileSync('상위 인증서 경로'),
    ],
}, (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html charset=utf-8' });
    res.write('<h1>hello</h1>');
    res.end('<p>hello server</p>');
}).listen(443, () => {
    console.log('443번 포트에서 서버 대기 중...');
});;

/*
    createServer 메서드는 인수 두개 받음. 
    첫번째 인수 : 인증서 관련 옵션 객체
    두번째 인수 : 서버 로직

    인증서를 구입하게되면 pem, crt, key확장자를 가진 파일들을 제고한다.
    파일들을 fs.readFileSync로 읽어서 옵션에 알맞게 넣으면 된다.
*/