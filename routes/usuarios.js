const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')

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
                    req.flash('error_msg', 'Já existe uma conta com este email"')
                    res.redirect('/registro')
                } else {

                }
            }).catch(error => {
                req.flash('error_msg', 'Houve um erro no registro deste usuário.')
                res.redirect('/registro')
                console.log(error)
            })
    }

})


module.exports = router
