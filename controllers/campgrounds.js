const campground = require('../models/campground')
const User = require('../models/user')
const { cloudinary } = require('../cloudinary/index')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken = process.env.MAPBOX_TOKEN

const geoCoder = mbxGeocoding({ accessToken: mapBoxToken })

let searchedCamp = []

module.exports.index = async (req, res) => { // catchAsync is used instead of try and catch on every async functions
    const order = req.query.order
    if (!order) {
        const campgrounds = await campground.find()
        searchedCamp = []
        return res.render('campgrounds/index', { campgrounds })
    }
    const sortfn=(campgrounds)=>{ 
        const compareNumbers = (a, b) => {
            if(order==1){
                return a.price - b.price;
            }else{
                return b.price - a.price
            }
    }
    campgrounds.sort(compareNumbers)
    return res.render('campgrounds/index', { campgrounds })
    }
    const callSortfn=async ()=>{
        if (searchedCamp.length === 0) {
            const camp = await campground.find()
            sortfn(camp)
        } else {
            const camp = [...searchedCamp]
            sortfn(camp)
        }
    }
    if (order == 1) {
        callSortfn()
    }
    if (order == 2) {
        callSortfn()
    }
}

module.exports.createForm = (req, res) => {
    res.render('campgrounds/new')
}

module.exports.renderShow = async (req, res) => {
    const camp = await campground.findById(req.params.id)
        .populate({ path: 'reviews', populate: { path: 'author' } })// populating nested things
        .populate('author')
    if (!camp) {
        req.flash('error', 'Cant find that')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { camp })
}

module.exports.searchCamp = async (req, res) => {
    const query = req.query.searchQuery
    if (!query) {
        return res.redirect('/campgrounds')
    }

    const campgrounds = await campground.find({ $or: [{ "title": { "$regex": query, "$options": "i" } }, { "location": { "$regex": query, "$options": "i" } }] })
    searchedCamp = [...campgrounds]

    if (campgrounds.length === 0) {
        req.flash('error', 'No such Campgrounds')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/index', { campgrounds, query })

}

module.exports.createCampground = async (req, res) => { // campValidator acts as a middleware
    const geoData = await geoCoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const camp = new campground(req.body.campground)
    camp.geometry = geoData.body.features[0].geometry
    camp.images = req.files.map(f => ({ url: f.path, fileName: f.filename }))
    const userId = req.user._id
    camp.author = userId
    const reqUser = await User.findById(userId)
    reqUser.campgrounds.push(camp)
    await camp.save()
    await reqUser.save()
    req.flash('success', 'Succesfully created a Campground')
    res.redirect(`/campgrounds/${camp._id}`)
}

module.exports.editForm = async (req, res) => {
    const camp = await campground.findById(req.params.id)
    if (!camp) {
        req.flash('error', 'Cant find that')
        return res.redirect('/')
    }
    res.render('campgrounds/edit', { camp })
}

module.exports.makeUpdate = async (req, res) => {
    const geoData = await geoCoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const { id } = req.params
    const camp = await campground.findByIdAndUpdate(id, { ...req.body.campground })
    camp.geometry = geoData.body.features[0].geometry
    if (req.body.deleteImages) {
        for (fileName of req.body.deleteImages) {
            await cloudinary.uploader.destroy(fileName)
        }
        await camp.updateOne({ $pull: { images: { fileName: { $in: req.body.deleteImages } } } })
    }
    newImg = req.files.map(img => ({ url: img.path, fileName: img.filename }))
    camp.images.push(...newImg)
    await camp.save()
    req.flash('success', 'Updated Successfully')
    res.redirect(`/campgrounds/${camp._id}`)
}

module.exports.delete = async (req, res) => {
    const { id } = req.params
    const camp = await campground.findById(id)
    camp.images.forEach(async (image) => {
        await cloudinary.uploader.destroy(image.fileName)
    });
    await campground.findByIdAndDelete(id)
    req.flash('success', 'Successfully Deleted the Campground')
    res.redirect('/campgrounds')
}