const express = require('express');
const { exec } = require('child_process');
const app = express();
const port = 3001;

app.use(express.static('public'));

app.get('/scan', (req, res) => {
    const target = req.query.target;
    if (!target) {
        return res.status(400).send('No target specified');
    }

    exec(`nmap ${target}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).send(stderr);
        }
        res.send(`<pre>${stdout}</pre>`);
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
