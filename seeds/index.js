
const mongoose = require('mongoose')
const campground = require('../models/campground')
const cities = require('./cities')
const { descriptors, places } = require('./seedHelpers')

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true

})
const sample = array => array[Math.floor(Math.random() * array.length)]
const seedDB = async () => {
    await campground.deleteMany()
    for (let i = 0; i < 50; i++) {
        const random = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random() * 30) + 10

        const camp = new campground({
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[random].city}, ${cities[random].state}`,
            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eos, exercitationem facilis autem hic quae ipsam quia voluptates placeat, eligendi nobis temporibus possimus nisi necessitatibus Voluptate quidem amet ea id voluptatibuhhf Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eos, exercitationem facilis autem',
            images: [{ url: 'https://source.unsplash.com/collection/483251/1600x900' }],
            price,
            author: '62dec0e25c4762ff5066e046',
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[random].longitude,
                    cities[random].latitude,
                ]
            }
        })
        await camp.save()
    }
}
seedDB().then(() => {
    mongoose.connection.close()
})