const express = require('express')
const app = express()
const users=require('../controllers/users')
const router = express.Router()
const passport = require('passport')
const { isAlreadyLoggedIn } = require('../middleware')
const catchAsync = require('../utils/catchAsync')



router.route('/register')
    .get( isAlreadyLoggedIn,users.registerForm)
    .post( isAlreadyLoggedIn, catchAsync(users.registerUser))

router.route('/login')
    .get( isAlreadyLoggedIn,users.loginForm)
    .post( isAlreadyLoggedIn, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login', keepSessionInfo:true }),users.loginUser)

router.get('/logout',users.logoutUser)

router.get('/users/:id',users.showUser)


module.exports = router
