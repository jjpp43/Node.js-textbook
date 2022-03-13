const http = require('http');
const fs = require('fs');
const { createSecretKey } = require('crypto');

const users = {};

http.createServer(async (req, res) => {
    try {
        console.log(req.method, req.url);
        //GET
        if(req.method === 'GET') {
            if(req.url === '/') {
                const data = await fs.readFile('./restFront.html');
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
                return res.end(data);
            } else if (req.url === '/about') {
                const data = await fs.readFile('./about.html');;
                res.writeHead(200, { 'Content-Type' : 'text/html; charset=utf-8' });
                return res.end(data);
            } else if (req.url === '/users') {
                res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
                return res.end(JSON.stringify(users));
            }

            try {   //주소가 /도 아니고 /about도 아닌 경우
               const data = await fs.readFile(`.${req.url}`);
               return res.end(data);
            } catch(err) {
                //주소에 해당하는 route를 못 찾았다는 404 error 발생
            }
        //POST
        } else if (req.method === 'POST') {
            if(req.url === '/user') {
                let body = '';  //요청의 body를 stream형식으로 받음
                req.on('data', (data) => {
                    body += data;
                });
                //요청의 body를 다 받을 후 실행됨
                return req.on('end', () => {
                    console.log('POST본문(body):', body);
                    const { name } = JSON.parse(body);
                    const id = Date.now();
                    users[id] = name;
                    res.writeHead(201);
                    res.end('등록 성공');
                });
            }
        //PUT
        } else if (req.method === 'PUT') {
            if(req.url.startsWith('/user/')) {
                const key = req.url.split('/')[2];
                let body = '';
                req.on('data', (data) => {
                    body += data;
                });
                return req.on('end', () => {
                    console.log('PUT 본문(Body):', body);
                    users[key] = JSON.parse(body).name;
                    return res.end(JSON.stringify(users));
                });
            }
        ///DELETE
        } else if(req.method === 'DELETE') {
            if(req.url.startsWith('/user/')) {
                const key = req.url.split('/')[2];
                delete users[key];
                return res.end(JSON.stringify(users));
            }
        }
        res.writeHead(404);
        return res.end('Not Found');
    } catch(err) {
        console.error(err);
        res.writeHead(500, { 'Content-Type' : 'text/plain; charset=utf-8' });
        res.end(err.message);
    }
}).listen(8082, () => {
    console.log("8082포트에서 서버 대기중...");
})
