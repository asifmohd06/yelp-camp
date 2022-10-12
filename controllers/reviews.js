const Review = require('../models/review')
const campground=require('../models/campground')

module.exports.makeReview = async (req, res) => {
    const { id } = req.params
    const reqCamp = await campground.findById(id)
    const newReview = new Review(req.body.review)
    newReview.author = req.user._id
    reqCamp.reviews.push(newReview)
    await newReview.save()
    await reqCamp.save()
    req.flash('success', 'Successfully created a Review')
    res.redirect(`/campgrounds/${reqCamp._id}`)
}

module.exports.delete = async (req, res) => {
    const { id, reviewId } = req.params
    await campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    req.flash('success', 'Successfully Deleted the Review')
    res.redirect(`/campgrounds/${id}`)
}