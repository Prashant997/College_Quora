if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const flash = require('connect-flash');
const session = require('express-session');
const mongoSanitize = require('express-mongo-sanitize');
const ExpressError = require('./utils/ExpressError');
const MongoStore = require('connect-mongo');

const QuestionRoutes = require('./routes/question');
const AnswerRoutes = require('./routes/answer');
const UserRoutes = require('./routes/user');
const User = require('./models/user');

const app = express();
const PORT = process.env.PORT || 8080;
const clientID = process.env.CLIENTID;
const clientSecret = process.env.CLIENTSECRET;
const dbUrl = process.env.DB_URL;
const SECRET = process.env.SECRET || 'thisisasecret';

// MongoDB Connection
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
})
    .then(() => {
        console.log('Mongoose connection open');
    })
    .catch((err) => {
        console.error('Mongoose connection error:', err);
    });

// View Engine and Middleware Setup
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());

// Session Configuration
const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret: SECRET,
    touchAfter: 24 * 60 * 60,
});
store.on('error', (e) => {
    console.error('Session store error:', e);
});

const sessionConfig = {
    store,
    name: 'session',
    secret: SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
    },
};
app.use(session(sessionConfig));
app.use(flash());

// Passport Configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

passport.use(new GoogleStrategy({
    clientID: clientID,
    clientSecret: clientSecret,
    callbackURL: "/login/google/redirect"
}, async (accessToken, refreshToken, profile, done) => {
    const { id, displayName, emails } = profile;
    const emailId = emails[0].value;

    try {
        let user = await User.findOne({ googleId: id });
        if (!user) {
            user = new User({
                googleId: id,
                name: displayName,
                emailId: emailId,
                username: emailId,
                qAsked: 0,
                qAnswered: 0,
                upVotes: 0,
                downVotes: 0
            });
            await user.save();
        }
        done(null, user);
    } catch (err) {
        done(err, null);
    }
}));

// Middleware to set local variables
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();
});

// Routes
app.use('/collegeQuora', QuestionRoutes);
app.use('/collegeQuora', AnswerRoutes);
app.use('/', UserRoutes);

app.get('/', (req, res) => {
    res.render('homePage');
});

// Error Handling
app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found!', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something went wrong' } = err;
    console.error('Unhandled error:', err);
    res.status(statusCode).render('error', { err });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
