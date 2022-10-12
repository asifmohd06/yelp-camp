const campground = require('./models/campground')
const review = require('./models/review')
const { campSchema } = require('./validatorSchemas') // joi validator schema
const { reviewSchema } = require('./validatorSchemas') // joi validator schema
const expressError=require('./utils/expressError')



module.exports.reviewValidator = (req, res, next) => { //this is also a middleware
    const { error } = reviewSchema.validate(req.body)//validating req.body with reviewSchema
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new expressError(msg, 400)

    } else {
        next()
    }
}


module.exports.isLoggedIn = (req, res, next) => {// middleware to prevent a non logged in user from making changes
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl // for redirecting to previous link
        req.flash('error', 'You Are Not Logged In')
        return res.redirect('/login')
    }
    next()
}


module.exports.isAlreadyLoggedIn = (req, res, next) => {//middleware to prevent a logged in user from accessing the login page
    if (req.isAuthenticated()) {
        req.flash('success', 'You are already Logged in')
        return res.redirect('/campgrounds')
    }
    next()
}


module.exports.campValidator = (req, res, next) => {   //this is a middleware to validate new campground data
    const { error } = campSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new expressError(msg, 400)
    } else {
        next()
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const camp1 = await campground.findById(req.params.id)
    if (!camp1.author.equals(req.user._id)) {
        req.flash('error', 'you dont have that PERMISSION')
        return res.redirect(`/campgrounds/${camp1._id}`)
    }
    next()
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const {id, reviewId } = req.params
    const reqReview = await review.findById(reviewId)
    if(!reqReview.author.equals(req.user._id)){
        req.flash('error','you dont have that PERMISSION')
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}