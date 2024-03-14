if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const passport = require('passport');
const localStrategy = require('passport-local');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const flash = require('connect-flash');
const session = require('express-session');
const mongoSanitize = require('express-mongo-sanitize');
const ExpressError = require('./utils/ExpressError');

const QuestionRoutes = require('./routes/question');
const AnswerRoutes = require('./routes/answer');
const UserRoutes = require('./routes/user');
const User = require('./models/user');
const MongoStore = require('connect-mongo');
const Darkmode = require('darkmode-js');


const PORT = process.env.PORT || 8080;

const clientID = process.env.CLIENTID;
const clientSecret = process.env.CLIENTSECRET;
// const dbUrl =  'mongodb://localhost:27017/collegeQuora';
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/collegeQuora'
const SECRET = process.env.SECRET || 'thisisasecret';

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
})
    .then(() => {
        console.log('MONGOOSE CONNECTION OPEN');
    })
    .catch((err) => {
        console.log('IN MONGOOSE SOMETHING WENT WRONG', err);
    })
 


app.engine('ejs', ejsMate); // for ejs-mate 
app.set('view engine', 'ejs'); // setting up view engine
app.set('views', path.join(__dirname, 'views')); // setting up the views dir
app.use(express.urlencoded({extended: true})) // to parse the req.post body
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public'))); //serving public directory

const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret: SECRET,
    touchAfter: 24 * 60 * 60
})

store.on('error', function (e) {
    console.log("SESSION STORE ERROR", e);
})


const sessionConfig = {
    store,
    name: 'session',
    secret: SECRET,
    resave: false,
    saveUninitialized: true,
    cookie : {
        expires: Date.now() + 1000*60*60*24*7,
        maxAge : 1000*60*60*24*7,
        httpOnly: true,
    }
}

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser((id, done) => {
    User.findById(id).then(user => {
      done(null, user);
    });
});


passport.use(
    new GoogleStrategy(
        {
            clientID: clientID,
            clientSecret: clientSecret,
            callbackURL: "/login/google/redirect"
        }, (accessToken, refreshToken, profile, done) => {
            // console.log(profile);
            const displayName = profile.displayName
            const emailId = profile.emails[0].value;
            // passport callback function
            //check if user already exists in our db with the given profile ID
            User.findOne({ googleId: profile.id }).then(async (currentUser) => {
                if (currentUser) {
                    //if we already have a record with the given profile ID
                    done(null, currentUser);
                } else {
                    //if not, create a new user 
                    const registeredUser = new User({
                        googleId: profile.id,
                        name: displayName,
                        emailId: emailId,
                        username: emailId,
                        qAsked: 0, 
                        qAnswered: 0, 
                        upVotes: 0, 
                        downVotes: 0
                    });
                    await registeredUser.save();
                    await done(null, registeredUser);
                }
            })
        })
);


app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();
})


app.use(mongoSanitize());
app.use('/collegeQuora', QuestionRoutes);
app.use('/collegeQuora', AnswerRoutes);
app.use('/', UserRoutes);

app.get('/', (req, res) => {
    res.render('homePage');
})


app.all('*', (req, res, next) => {
    next(new ExpressError("Page not found !", 404));
})

app.use((err, req, res, next) => {
    const {statusCode = 500, message = "Something went wrong"} = err;
    res.status(statusCode).render('error', {err});
    res.send();
})

app.listen(PORT, ()=> {
    console.log(`LISTENNG ON PORT ${PORT}`);
})