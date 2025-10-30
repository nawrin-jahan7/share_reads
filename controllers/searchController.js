const Book = require("../models/userBooklist");

exports.getSearch = async (req, res) => {
    const searchQuery = req.query.query;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;

    try {
        const books = await Book.find({
            $or: [
                { title: { $regex: searchQuery, $options: "i" } },
                { author: { $regex: searchQuery, $options: "i" } }
            ]
        })
        .populate('userId')
        .skip((page - 1) * limit)
        .limit(limit);

        const totalBooks = await Book.countDocuments({
            $or: [
                { title: { $regex: searchQuery, $options: "i" } },
                { author: { $regex: searchQuery, $options: "i" } }
            ]
        });

        res.render('searchBooks', { books, query: searchQuery, currentPage: page, totalPages: Math.ceil(totalBooks / limit) });
    } catch (error) {
        console.log(error);
        res.status(500).send("Server error");
    }
};