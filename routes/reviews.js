const express = require('express')
const router = express.Router({mergeParams:true})// mergeParams:- to get id as it isnt in the req.params as its in the prefix part in app.js
const catchAsync = require('../utils/catchAsync') // try and catch 
const campground = require('../models/campground')
const expressError = require('../utils/expressError') //custom error handler
const review = require('../controllers/reviews')
const { isLoggedIn,reviewValidator,isAuthor, isReviewAuthor } = require('../middleware') // a middlewares






router.post('/', isLoggedIn, reviewValidator, catchAsync(review.makeReview))

router.delete('/:reviewId',isLoggedIn,isReviewAuthor, catchAsync(review.delete))

module.exports=router