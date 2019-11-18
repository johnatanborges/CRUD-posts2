const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')
const bcrypt = require('bcryptjs')

router.get('/registro', (req, res) => {
    res.render('usuarios/registro')
})

router.post('/registro', (req, res) => {
    let errors = []

    if(!req.body.name || req.body.name == undefined || req.body.name == null) {
        errors.push({text: 'Nome inválido!'})
    }

    if(req.body.name.length < 3) {
        errors.push({text: 'Nome muito curto!'})
    }

    if(!req.body.email || req.body.email == undefined || req.body.email == null) {
        errors.push({text: 'Email inválido!'})
    }

    if(!req.body.password || req.body.password == undefined || req.body.password == null) {
        errors.push({text: 'Senha inválida!'})
    }

    if(req.body.password.length < 4) {
        errors.push({text: 'Senha muito curta!'})
    }

    if(req.body.password != req.body.password2) {
        errors.push({text: 'As senhas são diferentes. Tente novamente!'})
    }

    if(errors.length) {
        res.render('usuarios/registro', {errors: errors})
    } else {
        Usuario.findOne({email: req.body.email})
            .then(user => {
                if(user) {
                    req.flash('error_msg', 'Já existe uma conta com este email no nosso sistema!')
                    res.redirect('registro')
                } else {
                    const newUser = new Usuario({
                        name: req.body.name,
                        email: req.body.email,
                        password: req.body.password
                    })

                    bcrypt.genSalt(10, (error, salt) => {
                        bcrypt.hash(newUser.password, salt, (error, hash) => {
                            if(error) {
                                req.flash('error_msg', 'Houve um erro durante a criação do usuario!')
                                res.redirect('/')
                                console.log(error)
                            } else {
                                newUser.password = hash
                                newUser.save()
                                    .then(() => {
                                        req.flash('success_msg', 'Usuário criado com sucesso!')
                                        res.redirect('/')
                                    }).catch(error => {
                                        req.flash('error_msg', 'Houve um erro ao salvar o usuário')
                                        res.redirect('registro')
                                        console.log(error)
                                    })
                            }
                        })
                    })

                }
            }).catch(error => {
                req.flash('error_msg', 'Houve um erro no registro deste usuário.')
                res.redirect('/')
                console.log(error)
            })
    }
})

router.get('/login', (req, res) => {
    res.render('usuarios/login')
})


module.exports = router
