const localStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// User Model
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')


module.exports = function(passport){

    passport.use(new localStrategy({ usernameField: 'email', passwordField: 'password'}, (email, password, done) => {
        Usuario.findOne({email: email})
            .then(user => {
                if(!user) {
                    return done(null, false, {message: 'Esta conta não existe!'})
                }

                bcrypt.compare(password, user.password, (error, match) => {
                    if(match) {
                        return done(null, user)
                    } else {
                        return done(null, false, {message: 'Senha incorreta.'})
                    }
                })
            })
    }))

    passport.serializeUser((user, done) => {
        done(null, user.id)
    })

    passport.deserializeUser((id, done) => {
        Usuario.findById(id, (error, user) => {
            done(error, user)
        })
    })
}
