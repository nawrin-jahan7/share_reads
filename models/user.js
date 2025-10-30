const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const passport = require("passport");
const Book = require("../models/userBooklist");

const userInfoSchema = new mongoose.Schema({
    name: String,
    gender: String,
    email: String,
    division: String,
    address: String,
    phone: String,
    profileImage: String,
    profileComplete: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: String,
    resetPasswordExpires: String,
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    notifications: [
        {
            fromUser: {
                 type: mongoose.Schema.Types.ObjectId, ref: 'User' 
            },

            toUser: {
                type: mongoose.Schema.Types.ObjectId, ref: 'User' 
            },

            book: { 
                type: mongoose.Schema.Types.ObjectId, ref: 'UserBooklist' 
            },

            status: {
                 type: String, enum: ['pending', 'accepted', 'ignored'], default: 'pending' 
            },

            createdAt: {
                 type: Date, default: Date.now 
            },

            unread: { 
                type: Boolean, default: true 
            }
        }
    ],

    sentRequests: [
        {
        toUser: { 
            type: mongoose.Schema.Types.ObjectId, ref: 'User'
         },
        book: { 
            type: mongoose.Schema.Types.ObjectId, ref: 'UserBooklist'
        },
        status: {
             type: String, default: 'pending' 
        },
        createdAt: {
             type: Date, default: Date.now
         }
       }
    ]
});

userInfoSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userInfoSchema);

passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id).then(function (user) {
        done(null, user);
    }).catch(function (err) {
        done(err);
    });
});

module.exports = User;
