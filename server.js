const path = require('path');
const express = require('express');
const logger = require('cyber-express-logger');
const index = require('/home/kayla/node/express-file-index');

const sanitizeStringForUrl = (string) => {
    return string.replace(/ /gi, '-').replace(/[^a-z0-9-]/gi, '').toLowerCase();
};

const port = 8255;
const app = express();

app.use(logger({
    getIP: req => req.headers['cf-connecting-ip']
}));

app.use((req, res, next) => {
    if (req.headers.host == 'simplecyber.org') {
        return res.redirect('https://cybah.me' + req.originalUrl);
    }
    next();
});

app.use(index({
    rootDir: path.join(__dirname, 'web'),
    serverName: 'Cybah.me'
}));

app.get(`/repo/:name`, (req, res) => {
    res.redirect(`https://github.com/CyberGen49/${req.params.name}`);
});

const accounts = require('./web/accounts.json');
for (const account of accounts) {
    if (!account.href) continue;
    if (!account.href.startsWith('http')) continue;
    const slug = sanitizeStringForUrl(account.slug || account.site);
    app.get(`/${slug}`, (req, res) => {
        res.redirect(account.href);
    });
    console.log(`Account short link: /${slug} -> ${account.href}`);
}

app.listen(port, () => console.log(`Listening on ${port}`));