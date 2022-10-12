const express = require('express')
const router = express.Router()
const catchAsync = require('../utils/catchAsync') // try and catch 
const campgrounds = require('../controllers/campgrounds')
const expressError = require('../utils/expressError') //custom error handler
const { campSchema } = require('../validatorSchemas') // joi validator schema
const { isLoggedIn, campValidator, isAuthor } = require('../middleware') // a middleware to check if logged in
const multer = require('multer')// to handle image uploads , requires multipart/form-data encryption
const { storage } = require('../cloudinary')


//const upload=multer({dest:'uploads/'}) // executing multer and assigning a destination for the images
const upload = multer({ storage }) // executing multer and assigning a destination for the images


router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn,upload.array('image'), campValidator, catchAsync(campgrounds.createCampground))
   
router.get('/new', isLoggedIn, campgrounds.createForm)// order matters

router.route('/:id')
    .get(catchAsync(campgrounds.renderShow))
    .put(isLoggedIn, isAuthor, upload.array('image'),campValidator, catchAsync(campgrounds.makeUpdate))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.delete))



router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.editForm))

module.exports = router