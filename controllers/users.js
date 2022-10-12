const User = require('../models/user')



module.exports.registerForm = (req, res) => {
    res.render('users/register')
}

module.exports.registerUser = async (req, res, next) => {
    try {
        const { username, password, email } = req.body
        const newUser = new User({ email, username }) // creating a mongoose database using the User schema
        const regUser = await User.register(newUser, password)//regitering, ie adding the password field with hashed password from passport
        req.logIn(regUser, err => {// req.login to login the registered user
            if (err) return next(err)// req.login requires a callback as it is asynchrounous, but cant be awaited
            req.flash('success', 'Successfully Registered')
            res.redirect('/campgrounds')
        })
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/register')
    }
}

module.exports.loginForm = (req, res) => {
    res.render('users/login')
}

module.exports.loginUser = (req, res) => {// passport has a default authentication to login.'local' is the strategy used.
    const redirecturl = req.session.returnTo || '/campgrounds' //returnTo only available if keepsessioninfo set to true
    delete req.session.returnTo // deleting returnTo
    req.flash('success', "Welcome Back")
    res.redirect(redirecturl)
}

module.exports.logoutUser = (req, res, next) => {
    req.logOut(err => {
        if (err) next(err)
        req.flash('success', 'Successfully Logged Out')
        res.redirect('/campgrounds')
    })

}

module.exports.showUser = async (req, res) => {
    const userId = req.params.id
    const reqUser = await User.findById(userId).populate('campgrounds', 'title')
    const posts = reqUser.campgrounds
    res.render('users/posts', { posts })
}