const Book = require("../models/userBooklist");
const User = require("../models/user");

exports.getDashboard = async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            const page = parseInt(req.query.page) || 1; 
            const limit = 8; 
            const skip = (page - 1) * limit;
            const user = await User.findOne({ username: req.user.username });

            const books = await Book.find({ userId: { $ne: user._id } })
            .populate('userId')
            .skip(skip)
            .limit(limit)
            
            const count = await Book.countDocuments({ userId: { $ne: user._id } });

            const unreadCount = user.notifications.filter(notification => notification.unread).length;

            res.render('dashboard', {
                books,
                currentPage: page,
                totalPages: Math.ceil(count / limit),
                unreadCount: unreadCount
            });
        } catch (err) {
            console.log(err);
            res.redirect('/login');
        }
    } else {
        res.redirect('/login');
    }
};

exports.getView = async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            const username = req.query.username;
            const bookId = req.query.bookId;

            const user = await User.findOne({ username: username });

            if (user) {
                const book = await Book.findOne({ _id: bookId, userId: user._id });
                
                const requestExists = user.notifications.some(notification => 
                    notification.fromUser.equals(req.user._id) && 
                    notification.book.equals(bookId)
                );
        
                res.render('viewDetails', { 
                    user, 
                    book, 
                    requestExists 
                });

            } else {
                res.redirect('/dashboard');
            }
        } catch (err) {
            console.log(err);
            res.redirect('/login');
        }
    } else {
        res.redirect('/login');
    }
};

// API endpoint for modal book details
exports.getBookDetailsAPI = async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            const username = req.query.username;
            const bookId = req.query.bookId;

            const user = await User.findOne({ username: username });

            if (user) {
                const book = await Book.findOne({ _id: bookId, userId: user._id });
                
                const requestExists = user.notifications.some(notification => 
                    notification.fromUser.equals(req.user._id) && 
                    notification.book.equals(bookId)
                );
        
                res.json({ 
                    success: true,
                    user: {
                        _id: user._id,
                        name: user.name,
                        username: user.username,
                        email: user.email,
                        division: user.division,
                        address: user.address,
                        phone: user.phone,
                        profileImage: user.profileImage
                    }, 
                    book: {
                        _id: book._id,
                        title: book.title,
                        author: book.author,
                        bookImage: book.bookImage,
                        review: book.review,
                        rating: book.rating
                    }, 
                    requestExists 
                });

            } else {
                res.json({ success: false, message: 'User not found' });
            }
        } catch (err) {
            console.log(err);
            res.json({ success: false, message: 'Error loading book details' });
        }
    } else {
        res.json({ success: false, message: 'Not authenticated' });
    }
};
