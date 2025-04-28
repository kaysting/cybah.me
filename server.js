const path = require('path');
const express = require('express');
const dayjs = require('dayjs');
const index = require('/home/kayla/node/express-file-index');

const port = 8255;
const app = express();

app.use((req, res, next) => {
    const forwardHosts = [
        'simplecyber.org',
        'www.simplecyber.org',
        'cybah.me',
        'www.cybah.me'
    ];
    if (forwardHosts.includes(req.headers.host)) {
        return res.redirect('https://kaysting.dev' + req.originalUrl);
    }
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    console.log(`[${dayjs().format('YYYY-MM-DD HH:mm:ss')}] [${ip}] ${req.method} ${req.originalUrl}`);
    next();
});

app.use(index({
    rootDir: path.join(__dirname, 'web')
}));

app.listen(port, () => console.log(`Listening on ${port}`));