const express=require('express')
const mongoose=require('mongoose')
const router=express.Router()
const userController=require('../controller/userController.js')
const middleware=require('../middleware/middleware.js')
const bookController=require('../controller/bookController.js')
const reviewController=require('../controller/reviewController.js')

router.post('/registerUser',userController.createUser)
router.post('/loginUser',userController.loginUser)
router.get('/getProfile/:userId',userController.getProfile)
router.post('/createBook',middleware.authentication,bookController.createBook)
router.get('/filterBook',middleware.authentication,bookController.filterBook)
router.post("/books/:bookId/review",reviewController.createReview)
router.get('/getBook/:bookId',bookController.getBook)
router.put('/updateBook/:bookId',middleware.authentication,bookController.updateBook)





module.exports=router