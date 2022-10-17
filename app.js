if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const expressError = require('./utils/expressError') //custom error handler
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')
const userRoutes = require('./routes/users')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const localStrategy = require('passport-local')
const User = require('./models/user')
const mongoSanitize = require('express-mongo-sanitize')// to sanitize querries and req from passing symbols to mongodb
const helmet = require('helmet') // a node package containing a group of middlewares for security
const mongoDbStore = require('connect-mongo')
const dburl =   process.env.DB_URL  || 'mongodb://localhost:27017/yelp-camp' /* process.env.DB_URL || */
const secret = process.env.SECRET || 'itsasecret'
const port = process.env.PORT || 3000

// process.env.DB_URL  || 





app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.engine('ejs', ejsMate)

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(flash())
app.use(mongoSanitize())
app.use(helmet())


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/js/bootstrap.bundle.min.js"
]

const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/css/bootstrap.min.css"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet
        .contentSecurityPolicy({
            directives: {
                defaultSrc: [],
                connectSrc: ["'self'", ...connectSrcUrls],
                scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
                styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
                workerSrc: ["'self'", "blob:"],
                objectSrc: [],
                imgSrc: [
                    "'self'",
                    "blob:",
                    "data:",
                    "https://res.cloudinary.com/fakename/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                    "https://images.unsplash.com/",
                    "https://source.unsplash.com/"
                ],
                fontSrc: ["'self'", ...fontSrcUrls],
            },
        }),
    helmet.crossOriginEmbedderPolicy({ policy: "credentialless" })



)

const store = mongoDbStore.create({
    mongoUrl: dburl,
    touchAfter: 24 * 3600, //time period in seconds,telling mongo to not resave session everytime user refreshes the page
    crypto: {
        secret
    }
})



const sessionConfig = {
    store,
    name: 'session',
    secret,
    // secret:true,
    resave: true,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
// passport only after session

// 'mongodb://localhost:27017/yelp-camp'
mongoose.connect(dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true

})

app.use(passport.initialize())
app.use(passport.session())
passport.use(new localStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())// method to store user in session
passport.deserializeUser(User.deserializeUser())// method to unstore user in session



app.use((req, res, next) => {
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    res.locals.currentUser = req.user// used in navbar to hide/unhide register,login,logout
    next()
})

app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)
app.use('/', userRoutes)




app.listen(port, () => {
    console.log(`SERVING PORt ${port}`)
})

app.get('/', (req, res) => {
    res.render('home')
})


app.all('*', (req, res, next) => { // used to throw an error on all routes other than the ones described above
    next(new expressError('Page Not Found', 404)) // expressError - custom error handler
})

app.use((err, req, res, next) => { // if app throws an error this middleware kicks in
    const { statusCode = 500 } = err
    if (!err.message) err.message = 'Oh no, Something went wrong' // default error message
    res.status(statusCode).render('error', { err })
})