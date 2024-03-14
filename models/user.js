const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: String,
    googleId: String,
    qAsked: Number,
    qAnswered: Number,
    upVotes: Number,
    downVotes: Number,
    emailId: {
        type: String,
        required: true,
        unique: true,
    }
})

UserSchema.plugin(passportLocalMongoose, {
    usernameUnique: false,
});


UserSchema.plugin(passportLocalMongoose);
const User = mongoose.model('User', UserSchema);
module.exports = User;