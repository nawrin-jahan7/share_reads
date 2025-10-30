const passport = require("passport");
const User = require("../models/user");
const nodemailer = require('nodemailer');
const crypto = require('crypto');

exports.getLogin = (req, res) => {
    res.render("login");
};

exports.postLogin = async (req, res, next) => {
    
    passport.authenticate("local", async function(err, user, info) {
        if (err) { 
            console.log(err); 
            return next(err); 
        }
        if (!user) { 
            return res.render("login", { errorMessage: "Invalid email or password" }); 
        }
        if (!user.isVerified) {

            const verificationToken = crypto.randomInt(10000, 100000); 
            user.emailVerificationToken = verificationToken;
            user.emailVerificationExpires = Date.now() + 5 * 60 * 1000;

            await user.save();

            const transporter = nodemailer.createTransport({
                host: "smtp.example.com",
                port: 587,
                secure: false,
                service: "gmail",
                auth: {
                    user: process.env.GMAIL,
                    pass: process.env.APP_PASSWORD,
                },
            });

            const mailOptions = {
                from: {
                    name: "Share Reads",
                    address: process.env.GMAIL
                },
                to: user.username,
                subject: 'Email Verification',
                text: `Please verify your email address by using the following token:\n\n
                ${verificationToken}\n\n
                This token is valid for 5 minutes.`,
            };

            await transporter.sendMail(mailOptions);

            return res.render("verifyEmail", { errorMessage: "Please verify your email before logging in." });
        }
        req.logIn(user, async function(err) {
            if (err) { 
                console.log(err); 
                return res.render("login", { errorMessage: "Login failed. Please try again." });
            }

            // Check if profile is complete
            if (!user.profileComplete) {
                return res.redirect("/profile");
            }
            
            res.redirect("/dashboard");
        });
    })(req, res, next);
};

exports.getSignup = (req, res) => {
    res.render("signup");
};

exports.postSignup = (req, res) => {
    const name = req.body.name;
    const username = req.body.username;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    if(password !== confirmPassword){
        return res.render("signup", { errorMessage: "Passwords doesn't match" });
    }

     if (password.length < 8) {
        return res.render("signup", { errorMessage: "Password must be at least 8 characters long" });
    }

    const user = new User({ name: name, username: username, isVerified: false});


    User.register(user, password, async (err, user) => {
        if (err) {
            console.log(err);
            return res.render("signup", { errorMessage: "This email already have an account. Please try another." });
        }

        try {
            const verificationToken = crypto.randomInt(10000, 100000); 
            user.emailVerificationToken = verificationToken;
            user.emailVerificationExpires = Date.now() + 5 * 60 * 1000;

            await user.save();

            const transporter = nodemailer.createTransport({
                host: "smtp.example.com",
                port: 587,
                secure: false,
                service: "gmail",
                auth: {
                    user: process.env.GMAIL,
                    pass: process.env.APP_PASSWORD,
                },
            });

            const mailOptions = {
                from: {
                    name: "Share Reads",
                    address: process.env.GMAIL
                },
                to: user.username,
                subject: 'Email Verification',
                text: `Please verify your email address by using the following token:\n\n
                ${verificationToken}\n\n
                This token is valid for 5 minutes.`,
            };

            await transporter.sendMail(mailOptions);

            res.render("verifyEmail");

        } catch (error) {
            console.log(error);
            res.render("signup", { errorMessage: "Failed to send verification email. Please try again." });
        }
    });
};

exports.getVerifyEmail = (req, res) => {
    res.render("verifyEmail");
};

exports.postVerifyEmail = async (req, res) => {
    const token = req.body.code;

    try {
        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.render("verifyEmail", { errorMessage: "Verification token is invalid or has expired." });
        }

        user.isVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;

        await user.save();

        res.render("login", { errorMessage: "Your email has been verified! You can now log in." });

    } catch (error) {
        console.log(error);
        res.render("verifyEmail", { errorMessage: "Failed to verify email. Please try again." });
    }
};

exports.getforgotPassword = (req, res) => {
    res.render("forgotPassword");
};

exports.postforgotPassword = async (req, res) => {
    const email = req.body.email;

    try {
        const user = await User.findOne({username: email});

        if(!user) {
            return res.render("forgotPassword", { errorMessage: "User not found." });
        }

        const token = crypto.randomInt(10000, 100000);

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 5 * 60 * 1000;

        await user.save();

        const transporter = nodemailer.createTransport({
            host: "smtp.example.com",
            port: 587,
            secure: false,
            service: "gmail",
            auth: {
                user: process.env.GMAIL,
                pass: process.env.APP_PASSWORD,
            },
        })

        const mailOptions = {
            from: {
                name: "Share Reads",
                address: process.env.GMAIL
            },
            to: user.username,
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) have requested to reset the password for your account.\n\n
            Your password reset token is:\n\n
            ${token}\n\n
            This token is valid for 5 minutes. If you did not request this, please ignore this email and your password will remain unchanged.\n`,
        };

        await transporter.sendMail(mailOptions);

        res.redirect("/authCode");

    } catch (err) {
        console.log(err);
        res.redirect("/forgotPassword");
    }
};

exports.getauthCode = (req, res) => {
    res.render("authCode");
};

exports.postauthCode = async (req, res) => {
    const token = req.body.code;

    try {

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() } 
        });

        if(!user) {
            return res.render("authCode", { errorMessage: "Token is invalid or expired." });
        }

        res.render("resetPassword", {token});

    } catch (err) {
        console.log(err);
        res.redirect("/forgotPassword");
    }
};


exports.getresetPassword = (req, res) => {
    res.render("resetPassword");
};

exports.postresetPassword = async (req, res) => {
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const token = req.body.token;

    if(password !== confirmPassword){
        return res.render("resetPassword", { errorMessage: "Passwords doesn't match", token});
    }

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.render("resetPassword", { errorMessage: "Token is invalid or expired.", token});
        }

        user.setPassword(password, async (err) => {
            if (err) {
                console.log(err);
                return res.render("resetPassword", { errorMessage: "Failed to reset password", token});
            }

            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            await user.save();

            res.redirect("/login");
        });

    } catch (err) {
            console.log(err);
            res.redirect("/forgotPassword");
        }
};
