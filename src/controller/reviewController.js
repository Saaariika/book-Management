const mongoose = require('mongoose')
const bookModel = require('../models/bookSchema.js')
const reviewModel = require('../models/reviewSchema.js')

const createReview = async function (req, res) {
  try {
    if (mongoose.Types.ObjectId.isValid(req.params.bookId) == false) return res.status(400).send({ staus: false, Error: "book Id is Invalid" })

    if (!req.body.reviewedAt || req.body.reviewedAt == undefined || req.body.reviewedAt == null || req.body.reviewedAt == "") {
      return res.status(400).send({ message: "missing/invalid parameter reviewedAt", status: false })
    }
    if (!req.body.reviewedBy || req.body.reviewedBy == undefined || req.body.reviewedBy == null || req.body.reviewedBy == "") {
      return res.status(400).send({ message: "missing/invalid parameter reviewedBy", status: false })
    }

    if (!req.body.rating || req.body.rating == undefined || req.body.rating == null || req.body.rating == "") {
      return res.status(400).send({ message: "missing/invalid parameter rating", status: false })
    }
    if (!req.body.review || req.body.review == undefined || req.body.review == null || req.body.review == "") {
      return res.status(400).send({ message: "missing/invalid parameter review", status: false })
    }
    const validRating = /^ [1-5]||[5]$/.test(req.body.rating)
    if (!validRating) {
      return res.status(400).send({ message: "provide a valid rating between 1 to 5", status: false })
    }

    const book = await bookModel.findOne({ _id: req.params.bookId, isDeleted: false })
    if (!book) {
      return res.status(404).send({ message: "book not  found", status: false })
    }
    req.body.bookId = req.params.bookId//??
    const reviewCreation = await reviewModel.create(req.body)
    if (!reviewCreation) {

      return res.status(404).send({ message: "no reviews created", status: false })
    }

    let updatedBook = await bookModel.findByIdAndUpdate({ _id: req.params.bookId }, { $inc: { reviews: 1 } }, { new: true }).select({ __v: 0 })
      .lean()
    updatedBook.reviewData = reviewCreation
    if (updatedBook) {
      return res.status(201).send({ message: "review created successfully", status: true, data: updatedBook })
    }

  }
  catch (err) { return res.status(500).send({ Error: "internal server error", message: err.message, status: false }) }
}
const updateReview = async function (req, res) {
  try {
    const bookId = req.params.bookId;

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid bookId" });
    }

    const id = req.params.reviewId.trim();
    console.log(typeof (id));

    if (id && !mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid reviewId" });
    }

    console.log("valid review");

    const book = await bookModel.findOne({ _id: bookId, isDeleted: false });
    if (!book) {
      return res.status(404).send({ message: "book not found", status: false });
    }

    console.log("hello");

    const findReview = await reviewModel.findOne({ _id: id, isDeleted: false });
    console.log("hello0");
    if (!findReview) {
      return res.status(404).send({ message: "review not found", status: false });
    }

    console.log("hello1");

    if (Object.keys(req.body).length === 0) {
      return res.status(400).send({ message: "require some input", status: false });
    }

    const { reviewedBy, review, rating } = req.body;

    const validRating = /^[1-5]$/.test(req.body.rating);
    if (!validRating) {
      return res.status(400).send({ message: "provide a valid rating between 1 to 5", status: false });
    }
    const date = new Date().toISOString()
    const reviewUpdation = await reviewModel.findByIdAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { reviewedAt: date, review, reviewedBy, rating } },
      { new: true }
    ).lean();

    if (!reviewUpdation) {
      return res.status(200).send({ message: "review not updated", status: false });
    }

    book.reviewData = reviewUpdation;
    return res.status(200).send({ status: true, message: "review updated successfully", data: book });
  } catch (err) {
    return res.status(500).send({ Error: "internal server error", message: err.message, status: false });
  }
};

const deleteReview = async function (req, res) {
  try {
    const bookId = req.params.bookId.trim()
    if (bookId)
      if (!mongoose.Types.ObjectId.isValid(bookId)) {
        return res
          .status(400)
          .send({ status: false, message: "Invalid bookId" });
      }


    const book = await bookModel.findOne({ _id: bookId, isDeleted: false });


    if (!book) {
      return res.status(404).send({ message: "book not found", status: false });
    }
     
    if(req.userId!==book.userId.toString()){return res.status(401).send({status:false,message:"user not authorised"})}
    
    const reviewId = req.params.reviewId.trim()
    if (reviewId)
      if (!mongoose.Types.ObjectId.isValid(reviewId)) {
        return res
          .status(400)
          .send({ status: false, message: "Invalid reviewId" });
      }

    const checkReview = await reviewModel.findOne({ _id: reviewId, isDeleted: false });
    if (!checkReview) {
      return res.status(404).send({ message: "review not found", status: false });
    }

    const deletionOfReview = await reviewModel.findByIdAndUpdate({ _id: reviewId }, { isDeleted: true, $inc: { reviews: -1 } }, { new: true }).lean()
    book.reviewData = deletionOfReview
    if (deletionOfReview) {
      return res.status(200).send({ message: "review deleted succcessfully", status: true, data: book })
    }


  }
  catch (err) {
    return res.status(500).send({ Error: "internal server error", message: err.message, status: false });
  }
}
module.exports = { createReview, updateReview, deleteReview }
