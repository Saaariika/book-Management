const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const userModel = require('../models/userSchema.js')


const createUser = async function (req, res) {
    try {
        if (req.body.title == undefined || req.body.title == null || req.body.title == "" || !req.body.title) {
            return res.status(400).send({ message: "Invalid/Missing parameter title", status: false })
        }
        if (req.body.userName == undefined || req.body.userName == null || req.body.userName == "" || !req.body.userName) {
            return res.status(400).send({ message: "Invalid/Missing parameter user name", status: false })
        }
        if (req.body.emailId == undefined || req.body.emailId == null || req.body.emailId == "" || !req.body.emailId) {
            return res.status(400).send({ message: "Invalid/Missing parameter emailId", status: false })
        }
        if (req.body.password == undefined || req.body.password == null || req.body.password == "" || !req.body.password) {
            return res.status(400).send({ message: "Invalid/Missing parameter password", status: false })
        }
        if (req.body.phoneNo == undefined || req.body.phoneNo == null || req.body.phoneNo == "" || !req.body.phoneNo) {
            return res.status(400).send({ message: "Invalid/Missing parameter phone no", status: false })
        }
        let emailId = /^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,4}$/.test(req.body.emailId);
        let password =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/.test(
                req.body.password
            );
        if (!emailId) {
            return res
                .status(400)
                .send({ status: false, message: "Please provide a valid emailId " });
        }
        if (!password) {
            return res.status(400).send({
                status: false,
                message:
                    "Please provide a valid password - Password should include atleast one special character, one uppercase, one lowercase, one number and should be mimimum 8 character long",
            });
        }
        let phone = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/.test(req.body.phoneNo)
        if (!phone) {
            return res.status(400).send({ message: " phone no is not valid", status: false })
        }

        let pcode = /^[1-9][0-9]{5}$/.test(req.body.address.pinCode)
        if (!pcode) {
            return res.status(400).send({ message: "invalid pin code", status: false })
        }
        if (req.body.address == undefined || req.body.address == null || req.body.address == "" || !req.body.address) {
            return res.status(400).send({ message: "Invalid/Missing parameter address", status: false })
        }
        if (req.body.address.country == undefined || req.body.address.country == null || req.body.address.country == "" || !req.body.address.country) {
            return res.status(400).send({ message: "Invalid/Missing parameter country", status: false })
        }
        if (req.body.address.state == undefined || req.body.address.state == null || req.body.address.state == "" || !req.body.address.state) {
            return res.status(400).send({ message: "Invalid/Missing parameter state", status: false })
        }
        if (req.body.address.city == undefined || req.body.address.city == null || req.body.address.city == "" || !req.body.address.city) {
            return res.status(400).send({ message: "Invalid/Missing parameter city", status: false })
        }
        if (req.body.address.street == undefined || req.body.address.street == null || req.body.address.street == "" || !req.body.address.street) {
            return res.status(400).send({ message: "Invalid/Missing parameter street", status: false })
        }
        if (req.body.address.pinCode == undefined || req.body.address.pinCode == null || req.body.address.pinCode == "" || !req.body.address.pinCode) {
            return res.status(400).send({ message: "Invalid/Missing parameter pincode", status: false })
        }

        const checkPhone = await userModel.findOne({ phoneNo: req.body.phoneNo })
        if (checkPhone) {
            return res.status(400).send({ message: " phone no already exists", status: false })
        }



        const checkEmail = await userModel.findOne({ emailId: req.body.emailId })
        if (checkEmail) {
            return res.status(400).send({ message: "email id already exists", status: false })
        }
        const userDetails = {
            title: req.body.title,
            userName: req.body.userName,
            emailId: req.body.emailId,
            password: req.body.password,
            phoneNo: req.body.phoneNo,
            address: {
                country: req.body.address.country,
                state: req.body.address.state,
                city: req.body.address.city,
                street: req.body.address.street,
                pinCode: req.body.address.pinCode
            }
        }

        let userData = await userModel.create(userDetails)
        if (userData) {
            return res.status(201).send({ message: "user created successfully", status: true, data: userData })
        }




    }
    catch (err) { return res.status(500).send({ Error: "internal server error", message: err.message, status: false }) }
}

const loginUser = async function (req, res) {
    try {

        if (req.body.emailId == null || req.body.emailId == undefined || req.body.emailId == "" || !req.body.emailId) {
            return res.status(400).send({ message: "email id is required for  login", status: fasle })
        }
        if (req.body.password == null || req.body.password == undefined || req.body.password == "" || !req.body.password) {
            return res.status(400).send({ message: "password is required for  login", status: fasle })
        }

        const userData = await userModel.findOne({ emailId: req.body.emailId })
        if (!userData) {
            return res.status(400).send({ message: "email is incorrect", status: false })
        }


        if(userData.password!=req.body.password){//??
            return res.status(400).send({ message: "password is incorrect", status: false })
        }
        
        const token = jwt.sign({
            userId: userData._id.toString(),// iska mtlb

        },
            "village-binjhol",
            { expiresIn: "24h" }
        );
        res.setHeader("x-api-key", token)
        return res.status(200).send({ status: true, message: "login successfully", token: token })
    }
    catch (err) { return res.status(500).send({ Error: "internal server error", message: err.message, status: false }) }
}


const getProfile=async function(req,res){
    try{
        if(req.params.userId==undefined|| req.params.userId==null ||req.params.userId=="" || !req.params.userId ){
            return res.status(400).send({ message: "invalid/missing parameter user id", status: false })
        }
        if (mongoose.Types.ObjectId.isValid(req.params.userId) == false) return res.status(400).send({ staus: false, Error: "user Id is Invalid" })
        let profileData=await userModel.findOne({_id:req.params.userId})
        if(!profileData){
            return res.status(404).send({message:"user not found",status:false})
        }
        else{
            return res.status(200).send({message:"success",status:true,data:profileData})
        }
    }
    catch (err) { return res.status(500).send({ Error: "internal server error", message: err.message, status: false }) }
}
module.exports = { createUser,loginUser ,getProfile}