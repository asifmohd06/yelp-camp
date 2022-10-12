const { string, number } = require('joi');
const mongoose = require('mongoose')
const review = require('./review')

const schema = mongoose.Schema;
const imageSchema = new schema({
    url: String,
    fileName: String
})

const opts= {toJSON:{virtuals:true}} //by default JSON.stringify wont pass virtual methods 
const campgroundSchema = new schema({
    title: String,
    price: Number,
    description: String,
    geometry:{
        type:{
            type:String,
            enum:['Point'],
            required:true
        },
        coordinates:{
            type:[Number],
            required:true
        }
    },
    location: String,
    images: [imageSchema],
    author: {
        type: schema.Types.ObjectId,
        ref: 'user'
    },
    reviews: [
        {
            type: schema.Types.ObjectId,
            ref: 'review'
        }
    ]
},opts)

imageSchema.virtual('thumbnail').get(function(){// virtual properties are defined on the schema and doesnot uses space in dB
    return this.url.replace('/upload','/upload/w_300')
})
campgroundSchema.virtual('properties.popupMarkup').get(function(){ 
return `<strong><a href=/campgrounds/${this._id}>${this.title}</a><strong><br>Price: ₹ ${this.price}`
//this method wont be availabe in the Js
 //By default, Mongoose does not include virtuals when you convert a  document to JSON
 // so we need to tell mongoose to include virtuals (look opts)
})

campgroundSchema.post('findOneAndDelete', async (doc) => {
    if (doc) {
        await review.deleteMany({
            _id: { $in: doc.reviews }
        })
    }
})
module.exports = new mongoose.model('campground', campgroundSchema)