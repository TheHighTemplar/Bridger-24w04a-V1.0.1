const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3000 });

wss.on('connection', function connection(ws) {
    console.log('Client connected');

    // 每秒向客户端发送CPU负载和FPS数据
    setInterval(() => {
        const cpuLoad = Math.random().toFixed(2); // 模拟CPU负载数据
        const fps = Math.floor(Math.random() * 100) + 30; // 模拟FPS数据
        const data = JSON.stringify({ cpuLoad, fps });

        ws.send(data);
    }, 1000); // 每秒发送一次数据

    ws.on('close', function close() {
        console.log('Client disconnected');
    });
});
