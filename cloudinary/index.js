const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary'); // to connect multer and cloudinary

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
})

const storage = new CloudinaryStorage({
    cloudinary,
    params:{
        folder: 'yelpCamp',
        allowedformats: ['jpeg', 'jpg', 'png']
    },
})

module.exports = {
    cloudinary,
    storage
}
//exporting to routes/campgrounds