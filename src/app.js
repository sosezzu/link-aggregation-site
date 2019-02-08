const express = require('express');
const mongoose = require('mongoose');

require('./db');
const session = require('express-session');
const path = require('path');
const auth = require('./auth.js');

const User = mongoose.model('User');
const Article = mongoose.model('Article');

const app = express();

app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'add session secret here!',
    resave: false,
    saveUninitialized: true,
}));

// add req.session.user to every context object for templates
app.use((req, res, next) => {
    // now you can use {{user}} in your template!
    res.locals.user = req.session.user;
    next();
});

app.get('/', (req, res) => {
    Article.find({}, (err, result) => {
        res.render('index', { 'articles': result });
    });
});

app.get('/article/add', (req, res) => {
    if (!req.session.user) {
        res.redirect('/');
    }
    else {
        res.render('article-add');
    }
});

app.post('/article/add', (req, res) => {
    if (!req.session.user) {
        res.redirect('/');
    }
    else {
        User.findOne({ username: req.session.user.username }, (err, result) => {
            const newArticle = new Article({
                    title: req.body.title,
                    url: req.body.url,
                    description: req.body.description,
                    user: result,
                });
            console.log("new art: " + newArticle.user);
            newArticle.save((err) => {
                if (err) {
                    res.render('article-add');
                }
                result.articles.push(newArticle);
                result.save((err) => {
                    if (err) {
                        res.render('article-add');
                    }
                    else {
                        res.redirect('/');
                    }
                });
            });
        });
    }
});

app.get('/article/:slug', (req, res) => {
    Article.findOne({ 'slug': req.params.slug }).exec(function (err, article) {
        User.findOne({ _id: article.user }, (err, result) => {
            article.user.username = result.username;
            res.render('article-detail', { 'article': article });
        });
    });
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {
    auth.register(req.body.username, req.body.email, req.body.password, (message) => {
        res.render('register', message);
    }, (user) => {
            auth.startAuthenticatedSession(req, user, (authenticatedUser) => {
                if (authenticatedUser) {
                    res.redirect('/');
                }
            });
        });
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    auth.login(req.body.username, req.body.password, (message) => {
        res.render('login', message);
    }, (user) => {
            auth.startAuthenticatedSession(req, user, (authenticatedUser) => {
                if (authenticatedUser) {
                    res.redirect('/');
                }
            });
        });
});

app.get('/:username', (req, res) => {
    User.findOne({ username: req.params.username }, (err, result) => {
        Article.find({ user: result }, (err, articleList) => {
            result.articles = articleList;
            res.render('user', { 'aUser': result });
        });
    });
});

app.listen(3000);
