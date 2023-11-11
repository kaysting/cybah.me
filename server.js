
const express = require('express');
const logger = require('cyber-express-logger');

const sanitizeStringForUrl = (string) => {
    return string.replace(/ /gi, '-').replace(/[^a-z0-9-]/gi, '').toLowerCase();
};

const port = 8255;
const srv = express();
srv.use(logger({
    getIP: req => req.headers['cf-connecting-ip']
}));

srv.use((req, res, next) => {
    if (req.headers.host == 'simplecyber.org') {
        return res.redirect('https://cybah.me' + req.originalUrl);
    }
    next();
});

srv.use(express.static(`${__dirname}/web`));

const accounts = require('./web/accounts.json');
for (const account of accounts) {
    if (!account.href) continue;
    const slug = sanitizeStringForUrl(account.slug || account.site);
    srv.get(`/${slug}`, (req, res) => {
        res.redirect(account.href);
    });
    console.log(`Account short link: /${slug} -> ${account.href}`);
}

srv.use('/test/*', (req, res) => res.status(404).end());

srv.use((req, res) => res.redirect('/'));

srv.listen(port, () => console.log(`Listening on ${port}`));