const mongoose = require("mongoose");
const User = require("../models/user");

const userBooklist = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    title: String,
    author: String,
    review: String,
    rating: String,
    bookImage: String
});

const UserBooklist = mongoose.model("UserBooklist", userBooklist);

module.exports = UserBooklist;
