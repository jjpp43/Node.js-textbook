const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;
const os = require('os');

if(cluster.isMaster) {
    console.log(os.type(), os.platform());
    console.log(`master process id: ${process.id}`);
    // CPU갯수만큼 worker를 생산
    for(let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    //worker가 종료되었을 때
    cluster.on('exit', (worker, code, signal) => {
        console.log(`${worker.process.pid}번 worker가 종료되었습니다.`);
        console.log('code', code, 'signal', signal);
        cluster.fork();
    });
} else {
    //worker들이 port에서 대기
    http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type' : 'text/html; charset=utf-8' });
        res.write('<h1>hello</h1>');
        res.end('<p>hello</p>');
        setTimeout(() => {//worker가 존재하는지 확인하기위해 1초마다 강제 종료
            process.exit(1);
        }, 1000);
    }).listen(8086);

    console.log(`${process.pid}번 worker실행`);
}

/**
 * cluster에는 마스터 프로세서와 하위에 worker 프로세스가 있다. 마스터 프로세스는 cpu개수만큼 worker 프로세스를 만들고
 * 8086번 포트에서 대기한다. 요청이 들어오면 만들어진 worker프로세스에 요청을 분배함.  
 * 
 */