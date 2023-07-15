const mongoose = require('mongoose')
const bookModel = require('../models/bookSchema.js')
const userModel = require('../models/userSchema.js')
const reviewModel = require('../models/reviewSchema.js')
const createBook = async function (req, res) {
  try {
    if (req.body.title == undefined || req.body.title == null || req.body.title == "" || !req.body.title) {
      return res.status(400).send({ message: "title is required ", status: false })
    }
    if (req.body.excerpt == undefined || req.body.excerpt == null || req.body.excerpt == "" || !req.body.excerpt) {
      return res.status(400).send({ message: "excerpt is required ", status: false })
    }
    if (req.body.userId == undefined || req.body.userId == null || req.body.userId == "" || !req.body.userId) {
      return res.status(400).send({ message: "userId is required ", status: false })
    }
    if (req.body.ISBN == undefined || req.body.ISBN == null || req.body.ISBN == "" || !req.body.ISBN) {
      return res.status(400).send({ message: "ISBN is required ", status: false })
    }
    if (req.body.category == undefined || req.body.category == null || req.body.category == "" || !req.body.category) {
      return res.status(400).send({ message: "category is required ", status: false })
    }
    if (req.body.subCategory == undefined || req.body.subCategory == null || req.body.subCategory == "" || !req.body.subCategory) {
      return res.status(400).send({ message: "subCategory is required ", status: false })
    }
    if (req.body.releasedAt == undefined || req.body.releasedAt == null || req.body.releasedAt == "" || !req.body.releasedAt) {
      return res.status(400).send({ message: "releasedAt is required ", status: false })
    }
    if (mongoose.Types.ObjectId.isValid(req.body.userId) == false) return res.status(400).send({ staus: false, Error: "user Id is Invalid" })
    //Date format("YYYY-MM-DD") validation
    const dateRgx = /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/.test(
      req.body.releasedAt);
    if (!dateRgx) {
      return res.status(400).send({
        status: false,
        message: "Please provide valid date in this formate YYYY-MM-DD",
      });
    }

    const ISBNRgx = /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/.test(req.body.ISBN);
    if (!ISBNRgx) {
      return res
        .status(400)
        .send({ status: false, message: "Please provide valid ISBN format" });
    }

    const checkTitle = await bookModel.findOne({ title: req.body.title })
    if (checkTitle) {
      return res.status(400).send({ message: "book with same title already exist .provide a new one", status: false })
    }
    const checkISBN = await bookModel.findOne({ ISBN: req.body.ISBN })
    if (checkISBN) {
      return res.status(400).send({ message: "book with same isbn no already exist .provide a new one", status: false })
    }
    //  const bookDetails={
    //   title:req.body.title,
    //   excerpt


    const checkUserId = await userModel.findOne({ _id: req.body.userId })
    if (!checkUserId) {
      return res.status(404).send({ message: "user doesn't exist", status: false })
    }
    // else{
    //   return res.status(302).send({message:"author found",status:true})
    // }
    if (checkUserId) {
      // console.log(req.userId)
      // console.log(req.body.userId)
      if (req.userId == req.body.userId) {
        const bookData = await bookModel.create(req.body)
        if (bookData) {
          return res.status(201).send({ message: "book created successfully", status: true, data: bookData })
        }
      }
      if (req.userId != req.body.userId) {
        return res.status(401).send({ message: "not authorized", status: false })
      }
    }



  }
  catch (err) { return res.status(500).send({ Error: "internal server error", message: err.message, status: false }) }
}

const filterBook = async function (req, res) {
  try {
    let query = req.query

    let { userId, category, subcategory } = query
    if (userId != req.userId) {
      return res.status(401).send({ message: "userId is not authorised", status: false })
    }
    let arr = Object.keys(query)
    if (mongoose.Types.ObjectId.isValid(req.userId) == false) {
      return res.status(400).send({ message: "userId is not valid", status: false })
    }
    if (arr.length == 0) {
      let findBook = await bookModel.find({ isDeleted: false }).select({
        _id: 1,
        title: 1,
        userId: 1,
        excerpt: 1,
        category: 1,
        subcategory: 1,
        releasedAt: 1,
        reviews: 1
      }).select({ __v: 0 }).collation({ locale: "en", strength: 2 }).sort({ title: 1 })
      return res.status(200).send({ message: "books", status: true, data: findBook })


    }

    if (arr.length != 0) {
      let filterData = await bookModel.find({ $and: [{ isDeleted: false }, query] }).select({
        _id: 1,
        title: 1,
        userId: 1,
        excerpt: 1,
        category: 1,
        subcategory: 1,
        releasedAt: 1,
        reviews: 1
      }).select({ __v: 0 }).collation({ locale: "en", strength: 2 }).sort({ title: 1 })


      if (filterData.length == 0) {
        return res.status(404).send({ message: "no book found with this filter", status: false })
      }
      else {
        return res.status(200).send({ message: "filtered books", status: true, data: filterData })
      }
    }

  }
  catch (err) { return res.status(500).send({ Error: "internal server error", message: err.message, status: false }) }
}

const getBook = async function (req, res) {
  try {
    const bookId = req.params.bookId
    console.log(bookId)
    if (bookId) {
      if (mongoose.Types.ObjectId.isValid(bookId) == false) {
        return res
          .status(400)
          .send({ status: false, message: "Invalid bookId" });
      }
    }
    const book = await bookModel.findOne({ _id: bookId, isDeleted: false })
      .select({ __v: 0 }).lean()
    if (!book) {
      return res
        .status(404)
        .send({ status: false, message: "no book found" });
    }
    const review = await reviewModel.find({ bookId: bookId, isDeleted: false })
    console.log(review)
    if (review.length == 0) {
      return res
        .status(404)
        .send({ status: false, message: "no review found" });
    }

    book.reviewData = review

    return res
      .status(200)
      .send({ status: true, data: book });
  }
  catch (err) { return res.status(500).send({ Error: "internal server error", message: err.message, status: false }) }
}

const updateBook = async function (req, res) {
  try {
    const bookId = req.params.bookId
    if (bookId) {
      if (mongoose.Types.ObjectId.isValid(bookId) == false) {
        return res
          .status(400)
          .send({ status: false, message: "Invalid bookId" });
      }
    }
    const book = await bookModel.findOne({ _id: bookId, isDeleted: false })
    if (!book) {
      return res.status(404).send({ message: "book not found", status: false })
    }
    if (req.userId != book.userId.toString()) {
      return res.status(401).send({ message: "user not authorised to update book", status: false })
    }
    //console.log(book)
    if (req.body.ISBN) {
      const ISBNRgx = /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/.test(req.body.ISBN);
      if (!ISBNRgx) {
        return res
          .status(400)
          .send({ status: false, message: "Please provide valid ISBN format" });
      }
    }
    if (req.body.ISBN != undefined || req.body.ISBN != null || req.body.ISBN != "") {
      const findISBN = await bookModel.findOne({ ISBN: req.body.ISBN, isDeleted: false })
      if (findISBN) {
        return res.status(409).send({ message: `${req.body.ISBN} already exist`, status: false })
      }

    }
    if (req.body.title != undefined || req.body.title != null || req.body.title != "") {
      const findTitle = await bookModel.findOne({ title: req.body.title, isDeleted: false })
      if (findTitle) {
        return res.status(409).send({ message: `${req.body.title} already exist`, status: false })
      }

    }

    const updatedBook = await bookModel.findByIdAndUpdate({ _id: bookId, isDeleted: false }, { $set: req.body }, { new: true })
    if (updatedBook) {
      return res.status(200).send({ message: "book is updated", status: true, data: updatedBook })
    }

  }


  catch (err) { return res.status(500).send({ Error: "internal server error", message: err.message, status: false }) }
}

module.exports = { createBook, filterBook, getBook, updateBook }
