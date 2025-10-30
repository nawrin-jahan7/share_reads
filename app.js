require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const path = require('path');

const authController = require("./controllers/authController");
const userController = require("./controllers/userController");
const userBooklistController = require('./controllers/userBooklistController');
const dashboardController = require('./controllers/dashboardController');
const sendRequestController = require('./controllers/sendRequestController');
const searchController = require('./controllers/searchController');
const  viewSentRequestController = require('./controllers/viewSentRequestController');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(session({
    secret: "Our little secret",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.DB_CONNECTION);

app.get("/", userController.getWelcome);
app.get("/login", authController.getLogin);
app.post("/login", authController.postLogin);
app.get("/signup", authController.getSignup);
app.post("/signup", authController.postSignup);
app.get("/verifyEmail", authController.getVerifyEmail);
app.post("/verifyEmail", authController.postVerifyEmail);
app.get("/profile", userController.getUser);
app.post("/profile", userController.postUser);
app.get("/profileInfo", userController.getProfileInfo);
app.get("/booklist", userBooklistController.getBooks);
app.get("/dashboard", dashboardController.getDashboard);
app.get("/viewDetails", dashboardController.getView);
app.get("/api/book-details", dashboardController.getBookDetailsAPI);
app.post("/addBook", userBooklistController.addBook);
app.post("/deleteBook", userBooklistController.deleteBook);
app.post("/deletePhoto", userController.deletePhoto);
app.get("/forgotPassword", authController.getforgotPassword);
app.post("/forgotPassword", authController.postforgotPassword);
app.get("/authCode", authController.getauthCode);
app.post("/authCode", authController.postauthCode);
app.get("/resetPassword", authController.getresetPassword);
app.post("/resetPassword", authController.postresetPassword);
app.post("/sendRequest", sendRequestController.sendRequest);
app.get("/notifications", sendRequestController.gethandleRequest);
app.post("/notifications", sendRequestController.posthandleRequest);
app.get("/searchBooks", searchController.getSearch);
app.get("/viewSentRequest", viewSentRequestController.viewSentRequests);
app.post("/cancelRequest", viewSentRequestController.cancelRequest);
app.get("/logout", (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});

app.listen(3000, function () {
    console.log("Server running at port 3000....");
});
