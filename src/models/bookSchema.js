const mongoose = require('mongoose')
const objectId = mongoose.Schema.Types.ObjectId
const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    excerpt: {
        type: String,
        trim: true
    },

    userId: {
        type: objectId,
        required: true,
        ref: 'user',
        trim: true
    },

    ISBN: {
        type: String,
        required: true,
        trim: true
    },
    category:
    {
        type: String,
        trim: true
    },
    subCategory: [{
        type: String,
        trim: true

    }],
    reviews: {
        type: Number,
        default: 0,
        trim: true
    },

    deletedAt: {
        type: String,
        trim: true
    },
    releasedAt: {
        type: String,
        trim: true
    },
    isDeleted: {
        type: Boolean,
        default: false,
        trim: true
    }
},

    { timestamps: true }
)
module.exports = mongoose.model("book", bookSchema)