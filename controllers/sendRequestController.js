const User = require('../models/user');
const nodemailer = require("nodemailer");
const moment = require('moment');

exports.sendRequest = async (req, res) => {
    const { toUserId, bookId } = req.body;
    const fromUserId = req.user._id; 

    try {
        const user = await User.findById(toUserId);
        if (!user) {
            return res.status(404).send('User not found');
        }

        const existingRequest = user.notifications.find(notification => 
            notification.fromUser.equals(fromUserId) && 
            notification.book.equals(bookId)
        );

        if (existingRequest) {
           
            user.notifications = user.notifications.filter(notification =>
                !(notification.fromUser.equals(fromUserId) && notification.book.equals(bookId))
            );
            await user.save();
        } else {
           
            user.notifications.push({
                fromUser: fromUserId,
                toUser: toUserId,
                book: bookId,
                status: 'pending',
                unread: true
            });
            await user.save();
        }

        const requestingUser = await User.findById(fromUserId);

        requestingUser.sentRequests.push({
            toUser: toUserId,
            book: bookId,
            status: 'pending',
            createdAt: Date.now()
        });

        await requestingUser.save();

        res.redirect("/viewSentRequest");
    } catch (error) {
        console.log(error);
        return res.status(500).send('Server error');
    }
};



exports.gethandleRequest  = async (req, res) => {
    
    if (req.isAuthenticated()) {
        const user = await User.findById(req.user._id).populate("notifications.fromUser").populate("notifications.book");

        await User.updateMany(
            { _id: req.user._id, 'notifications.unread': true },
            { $set: { 'notifications.$[].unread': false } }
        );

        const sortedNotifications = user.notifications
            .sort((a, b) => b.createdAt - a.createdAt)

        const notifications = sortedNotifications.map(notification => {
            return {
                ...notification._doc, 
                formattedTime: moment(notification.createdAt).fromNow(),
            };
        });

        const unreadCount = user.notifications.filter(notification => notification.unread).length;
        
        res.render('notifications', { notifications: notifications, unreadCount: unreadCount});
    } else {
        res.redirect('/login');
    }

};

exports.posthandleRequest = async (req, res) => {
    const { notificationId, action } = req.body;

    try {
        const user = await User.findById(req.user._id).populate('notifications.fromUser');
        if (!user) {
            return res.status(404).send('User not found');
        }

        const notification = user.notifications.id(notificationId);
        if (!notification) {
            return res.status(404).send('Notification not found');
        }

        if (action === 'accept') {
            notification.status = 'accepted';
            await user.save();

            const requestingUser = await User.findById(notification.fromUser._id);
            if (!requestingUser) {
                return res.status(404).send('Requesting user not found');
            }

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
                to: requestingUser.username,
                subject: 'Your Request has been Accepted!',
                text: `Congratulations! Your book request has been accepted by ${user.name} (${user.username}). You can now coordinate for the book exchange.`,
            };

            await transporter.sendMail(mailOptions);

            requestingUser.notifications.push({
                fromUser: req.user._id, 
                book: notification.book,
                status: 'accepted',
                createdAt: Date.now(),
                unread: true
            });

            await requestingUser.save();

            await User.findByIdAndUpdate(req.user._id, {
                $pull: { notifications: { _id: notificationId } }
            });

        } else if (action === 'cancel') {

            const requestingUser = await User.findById(notification.fromUser);
            if (requestingUser) {
              
                requestingUser.notifications = requestingUser.notifications.filter(notif => 
                    !(notif.fromUser.equals(req.user._id) && notif.book.equals(notification.book))
                );
                await requestingUser.save();
            }

            
            await User.findByIdAndUpdate(req.user._id, {
                $pull: { notifications: { _id: notificationId } }
            });
        }

    
        await User.findByIdAndUpdate(
            notification.fromUser,
            { $pull: { sentRequests: { book: notification.book, toUser: req.user._id } } }
        );

        res.redirect('/notifications');

    } catch (error) {
        console.log(error);
        return res.status(500).send('Server error');
    }
};