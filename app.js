// Modules
    const express = require('express')
    const handlebars = require('express-handlebars')
    const mongoose = require('mongoose')
    const admin = require('./routes/admin')
    const path = require('path')
    const session = require('express-session')
    const flash = require('connect-flash')
    require('./models/Postagem')
    const Postagem = mongoose.model('postagens')
    const app = express()

// Config
    app.use(express.urlencoded({extended: true}))
    app.use(express.json())

    // Session
        app.use(session({
            secret: 'cursodenode',
            resave: true,
            saveUninitialized: true
        }))
        app.use(flash())

    // Middleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash('success_msg')
            res.locals.error_msg = req.flash('error_msg')
            next()
        })

// Handlebars
    app.engine('handlebars', handlebars({defaultLayout: 'main'}))
    app.set('view engine', 'handlebars')

// Mongoose
    mongoose.Promise = global.Promise
    mongoose.connect('mongodb://localhost/blog', { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            console.log('Conectado ao mongo!')
        }).catch((error) => {
            console.log('Erro ao se conectar ao mongo: ', error)
        })

// Public
    app.use(express.static(path.join(__dirname, 'public')))

// Routes
    app.get('/', (req, res) => {
        Postagem.find().populate('category').sort({date: 'desc'})
            .then(posts => {
                res.render('index', {posts: posts})
            }).catch(error => {
                req.flash('error_msg', 'Houve um erro na pagina inicial em: Postagens recentes')
                res.redirect('/404')
                console.log(error)
            })
    })

    app.get('/postagem/:slug', (req, res) => {
        Postagem.findOne({slug: req.params.slug})
            .then(post => {
                if (post) {
                    res.render('postagem/index', {post: post})
                } else {
                    req.flash('error_msg', 'Esta postagem não existe!')
                    res.redirect('/')
                }
            }).catch(error => {
                req.flash('error_msg', 'Houve um erro ao acessar a postagem!')
                res.redirect('/')
                console.log(error)
            })
    })

    app.get('/404', (req, res) => {
        res.send('Erro 404!')
    })

    app.use('/admin', admin)

// Others
    const port = 8081
    app.listen(port, () => {
        console.log('Servidor rodando!')
    })
