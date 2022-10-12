
const mongoose=require('mongoose')
const schema=mongoose.Schema

reviewSchema=new schema({
    body:String,
    rating:Number,
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user' //model
    }
})

module.exports=new mongoose.model('review',reviewSchema)