const express = require('express');
const User = require('../models/user');
const moment = require('moment');


exports.viewSentRequests = async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            const user = await User.findById(req.user._id)
                .populate('sentRequests.toUser')
                .populate('sentRequests.book');

                const sortedRequests = user.sentRequests.sort((a, b) => b.createdAt - a.createdAt);

                const formattedRequests = sortedRequests.map(request => {
                    return {
                        ...request._doc,
                        formattedTime: moment(request.createdAt).fromNow(),
                    };
                });
                
            res.render('viewSentRequest', { requests: formattedRequests });
        } catch (error) {
            console.log(error);
            return res.status(500).send('Server error');
        }
    } else {
        res.redirect('/login');
    }
};

exports.cancelRequest = async (req, res) => {
    const { requestId } = req.body;

    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).send('User not found');
        }

        const sentRequest = user.sentRequests.id(requestId);

        if (!sentRequest) {
            return res.status(404).send('Request not found');
        }

        const { toUser, book } = sentRequest;
        user.sentRequests = user.sentRequests.filter(request => !request._id.equals(requestId));
        await user.save();

        const recipientUser = await User.findById(toUser); 

        if (recipientUser) {
            recipientUser.notifications = recipientUser.notifications.filter(notif => 
                !(notif.fromUser.equals(req.user._id) && notif.book.equals(book))
            );
            await recipientUser.save();
        }

        res.redirect('/viewSentRequest');
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    }
};




