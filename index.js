// index.js
const express = require('express');
const session = require('express-session');
const DiscordOAuth2 = require('discord-oauth2');
const app = express();
const oauth = new DiscordOAuth2();

app.set('view engine', 'ejs');
app.use(session({ secret: 'super-secret-key', resave: false, saveUninitialized: false }));

const CLIENT_ID = '1534614943238979764';
const CLIENT_SECRET = 'FvCa-nSbPLyNO_prruXEaL3PVHDz4lLb';
const REDIRECT_URI = 'https://stronka-production-d6af.up.railway.app/callback';
const ALLOWED_ID = '1496963647162028142';

app.get('/', (req, res) => res.render('login'));

app.get('/login', (req, res) => {
    res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify`);
});

app.get('/callback', async (req, res) => {
    try {
        const code = req.query.code;
        const token = await oauth.tokenRequest({ clientId: CLIENT_ID, clientSecret: CLIENT_SECRET, code, scope: 'identify', grantType: 'authorization_code', redirectUri: REDIRECT_URI });
        const user = await oauth.getUser(token.access_token);
        if (user.id === ALLOWED_ID) {
            req.session.user = user;
            res.redirect('/dashboard');
        } else {
            res.send('Access Denied');
        }
    } catch (e) { res.send('Error'); }
});

app.get('/dashboard', (req, res) => {
    if (!req.session.user) return res.redirect('/');
    res.render('dashboard', { user: req.session.user });
});

app.listen(process.env.PORT || 3000, () => console.log('Ready.'));