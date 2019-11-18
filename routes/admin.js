const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Categoria')
const Categoria = mongoose.model('categorias')
require('../models/Postagem')
const Postagem = mongoose.model('postagens')
const { eAdmin } = require('../helpers/eAdmin')

router.get('/', eAdmin, (req, res) => {
    res.render('admin/index')
})

// Categories
router.get('/categorias', eAdmin, (req, res) => {
    Categoria.find()
        .sort({date: 'desc'})
        .then((categorias) => {
            res.render('admin/categorias', {categorias: categorias})
        }).catch(error => {
            req.flash('error_msg', 'Houve um erro ao listar as categorias!')
            res.redirect('/admin')
            console.log(error)
        })
})

router.get('/categorias/add', eAdmin, (req, res) => {
    res.render('admin/addcategorias')
})

router.post('/categorias/nova', eAdmin, (req, res) => {

    let errors = []

    if(!req.body.name || req.body.name == undefined || req.body.name == null) {
        errors.push({ text: "Nome inválido"})
    }

    if(!req.body.slug || req.body.slug == undefined || req.body.slug == null) {
        errors.push({ text: "Slug inválido"})
    }

    if(req.body.name.length < 2) {
        errors.push({ text: "Nome de categoria muito pequeno"})
    }

    if(errors.length) {
        res.render('admin/addcategorias', { errors: errors })
    } else {
        const novaCategoria = {
            name: req.body.name,
            slug: req.body.slug
        }

        new Categoria(novaCategoria).save()
            .then(() => {
                req.flash('success_msg', 'Categoria criada com sucesso!')
                res.redirect('/admin/categorias')
            }).catch(error => {
                req.flash('error_msg', 'Houve um erro ao salvar a categoria!')
                res.redirect('/admin')
                console.log(error)
            })
    }
})

router.get('/categorias/edit/:id', eAdmin, (req, res) => {
    Categoria.findOne({_id: req.params.id})
        .then((categoria) => {
            res.render('admin/editcategoria', {categoria: categoria})
        }).catch(error => {
            req.flash('error_msg', 'Houve um erro na edição!')
            res.redirect('/admin/categorias')
            console.log(error)
        })
})

router.post('/categorias/edit', eAdmin, (req, res) => {
    Categoria.findOne({_id: req.body.id})
        .then((categoria) => {
            categoria.name = req.body.name
            categoria.slug = req.body.slug

            categoria.save()
                .then(() => {
                    req.flash('success_msg', 'Categoria editada com sucesso!')
                    res.redirect('/admin/categorias')
                }).catch(error => {
                    req.flash('error_msg', 'Houve um erro no salvamento da edição!')
                    res.redirect('/admin/categorias')
                    console.log(error)
                })
        }).catch(error => {
            req.flash('error_msg', 'Houve um erro ao editar a categoria!')
            res.redirect('/admin/categorias')
            console.log(error)
        })
})

router.post('/categorias/delete', eAdmin, (req, res) => {
    Categoria.remove({_id: req.body.id})
        .then(() => {
            req.flash('success_msg', 'Categoria deletada com sucesso!')
            res.redirect('/admin/categorias')
        }).catch(error => {
            req.flash('error_msg', 'Houve um erro ao deletar a categoria!')
            res.redirect('/admin/categorias')
        })
})

// Posts
router.get('/postagens', eAdmin, (req, res) => {
    Postagem.find().populate('category').sort({ date: 'desc' })
        .then(posts => {
            res.render('admin/postagens', { posts: posts})
        }).catch(error => {
            req.flash('error_msg', 'Houve um erro ao listar as postagens!')
            res.redirect('/admin')
            console.log(error)
        })
})

router.get('/postagens/add', eAdmin, (req, res) => {
    Categoria.find()
        .then((categories) => {
            res.render('admin/addpostagem', {categories: categories})
        }).catch(error => {
            req.flash('error_msg', 'Houve um erro ao carregar o formulário!')
            res.redirect('/admin')
            console.log(error)
        })
})

router.post('/postagens/nova', eAdmin, (req, res) => {

    let errors = []

    if(req.body.category == 0) {
        errors.push({ text: 'Categoria inválida, registe uma categoria' })
    }

    if(errors.length) {
        res.render('admin/addpostagem', { errors: errors })
    } else {
        const novaPostagem = {
            title: req.body.title,
            slug: req.body.slug,
            description: req.body.description,
            content: req.body.content,
            category: req.body.category
        }

        new Postagem(novaPostagem).save()
            .then(() => {
                req.flash('success_msg', 'Postagem criada com sucesso!')
                res.redirect('/admin/postagens')
            }).catch(error => {
                req.flash('error_msg', 'Houve um erro na criação da postagem!')
                res.redirect('/admin/postagens')
                console.log(error)
            })
    }
})

router.get('/postagens/edit/:id', eAdmin, (req, res) => {
    Postagem.findOne({_id: req.params.id})
        .then(post => {
            Categoria.find().then(categories => {
                res.render('admin/editpostagem', {post: post, categories: categories})
            }).catch(error => {
                req.flash('error_msg', 'Houve um erro ao listar as categorias!')
                res.redirect('/admin/postagens')
            })
        }).catch(error => {
            req.flash('error_msg', 'Houve um erro ao carregar o formulário de edição!')
            res.redirect('/admin/postagens')
            console.log(error)
        })
})

router.post('/postagem/edit', eAdmin, (req, res) => {
    Postagem.findOne({_id: req.body.id})
        .then((post) => {
            post.title = req.body.title
            post.slug = req.body.slug
            post.description = req.body.description
            post.content = req.body.content
            post.category = req.body.category

            post.save()
                .then(() => {
                    req.flash('success_msg', 'Postagem editada com sucesso!')
                    res.redirect('/admin/postagens')
                }).catch(error => {
                    req.flash('error_msg','Houve um erro ao salvar as alteraçãoes!')
                    res.redirect('/admin/postagens')
                    console.log(error)
                })
        }).catch(error => {
            req.flash('error_msg', 'Houve um erro ao salvar a edição!')
            res.redirect('/admin/postagens')
            console.log(error)
        })
})

router.get('/postagens/delete/:id', eAdmin, (req, res) => {
    Postagem.deleteOne({_id: req.params.id})
        .then(() => {
            req.flash('success_msg', 'Postagem deletada com sucesso!')
            res.redirect('/admin/postagens')
        }).catch(error => {
            req.flash('error_msg', 'Houve um erro ao tentar deletar a postagem!')
            res.redirect('/admin/postagens')
            console.log(error)
        })
})

module.exports = router
