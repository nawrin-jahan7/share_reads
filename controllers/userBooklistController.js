const Book = require("../models/userBooklist");
const User = require("../models/user");
const multer = require('multer');
const path = require('path');
const { bucket } = require('../firebase');


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

exports.getBooks = async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            const books = await Book.find({ userId: req.user._id });
            const user = await User.findById(req.user._id)
            const unreadCount = user.notifications.filter(notification => notification.unread).length;
            res.render("booklist", { books, unreadCount: unreadCount });
        } catch (err) {
            console.log(err);
            res.redirect("/login");
        }
    } else {
        res.redirect("/login");
    }
};

exports.addBook = [
    upload.single('bookImage'),
    async (req, res) => {
        if (!req.isAuthenticated()) {
            return res.redirect("/login");
        }

        try {
            let bookImageUrl;
            if (req.file) {
                const fileName = Date.now() + path.extname(req.file.originalname);
                const file = bucket.file(fileName);

                await file.save(req.file.buffer, {
                    metadata: { contentType: req.file.mimetype },
                    public: true,
                });

                // Generate the public URL
                bookImageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
            } else {
                throw new Error('Book image is required');
            }

            const newBook = new Book({
                userId: req.user._id,
                title: req.body.title,
                author: req.body.author,
                review: req.body.review,
                rating: req.body.rating,
                bookImage: bookImageUrl
            });

            await newBook.save();
            console.log('Book saved successfully:', newBook.title);
            res.redirect("/booklist");
            
        } catch (err) {
            console.error('Error adding book:', err);
            console.error('Error details:', {
                message: err.message,
                stack: err.stack,
                file: req.file ? 'File uploaded' : 'No file',
                body: req.body
            });
            res.redirect("/booklist");
        }
    }
];

exports.deleteBook = async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            const bookId = req.body.bookId;
            if (!bookId) {
                console.log("No book ID provided");
                return res.redirect("/booklist");
            }

            await Book.deleteOne({ _id: bookId, userId: req.user._id });
            res.redirect("/booklist");
        } catch (err) {
            console.log(err);
            res.redirect("/booklist");
        }
    } else {
        res.redirect("/login");
    }
};