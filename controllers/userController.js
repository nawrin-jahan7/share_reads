const User = require("../models/user");
const passport = require("passport");
const multer = require('multer');
const path = require('path');
const { bucket } = require('../firebase');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

exports.getUser = (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect("/login");
    }

    User.findById(req.user._id).then(function (foundUser) {
        if (foundUser) {
            res.render("profile", { 
                userName: foundUser.name, 
                userImage: foundUser.profileImage, 
                userDivision: foundUser.division, 
                userAddress: foundUser.address, 
                userPhone: foundUser.phone, 
                userGender: foundUser.gender
            });
        } else {
            res.status(404).send("User not found");
        }
    }).catch(function (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    });
};


exports.postUser = [
    upload.single('profileImage'),
    async (req, res) => {
        if (!req.isAuthenticated()) {
            return res.redirect("/login");
        }

        const { address, phone, division, gender } = req.body;

        try {
            let profileImageUrl;
            if (req.file) {
                const fileName = Date.now() + path.extname(req.file.originalname);
                const file = bucket.file(fileName);

                await file.save(req.file.buffer, {
                    metadata: { contentType: req.file.mimetype },
                    public: true,
                });

                profileImageUrl = file.publicUrl(); 
            }

            const user = await User.findById(req.user._id);
            if (user) {
                user.address = address;
                user.phone = phone;
                user.division = division;
                user.gender = gender;
                if (profileImageUrl) {
                    user.profileImage = profileImageUrl; 
                }
                user.profileComplete = true;
                await user.save();
                res.redirect("/profileInfo");
            } else {
                res.status(404).send("User not found");
            }
        } catch (err) {
            console.log(err);
            res.redirect("/profile");
        }
    }
];

exports.getProfileInfo = (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect("/login");
    }

    User.findById(req.user._id).then((user) => {
        if (user) {
            const unreadCount = user.notifications.filter(notification => notification.unread).length;
            res.render("profileInfo", {
                userName: user.name,
                userGender: user.gender,
                userEmail: user.username,
                userDivision: user.division,
                userAddress: user.address,
                userPhone: user.phone,
                userImage: user.profileImage,
                unreadCount: unreadCount
            });
        }
    }).catch((err) => {
        console.log(err);
        res.redirect("/login");
    });
};

exports.deletePhoto = async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            return res.redirect('/login');
        }

        const user = await User.findById(req.user._id);
        if (user) {
            user.profileImage = undefined;
            await user.save();
            res.redirect('/profile');
        } else {
            res.status(404).send('User not found');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

exports.getWelcome = (req, res) => {
    // Public page - no authentication required
    res.render("welcome");
}