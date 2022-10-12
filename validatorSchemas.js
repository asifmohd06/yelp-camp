const BaseJoi = require('joi')
const sanitizeHtml = require('sanitize-html')
const campground = require('./models/campground')
const review=require('./models/review')


const extension=(joi)=>({
    type:'string',
    base:joi.string(),
    messages:{
        'string.escapeHTML':'{{#label}} must not include html !'
    },
    rules:{
        escapeHTML:{
            validate(value,helpers){
                const clean=sanitizeHtml(value,{
                    allowedTags:[],//option 1
                    allowedAttributes:{}//option 2
                })
                if(clean!==value) return helpers.error('string.escapeHTML',{value})
                return clean
            }
        }
    }
})

const Joi=BaseJoi.extend(extension)

module.exports.campSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        description: Joi.string().required().escapeHTML(),
        // image: Joi.string().required(),
        location: Joi.string().required().escapeHTML()
    }).required(),
    deleteImages:Joi.array()
})
module.exports.reviewSchema=Joi.object({
    review:Joi.object({
        body:Joi.string().required().escapeHTML(),
        rating:Joi.number().required().max(5).min(1)
    }).required()
})