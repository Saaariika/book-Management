const mongoose=require('mongoose')
const jwt = require('jsonwebtoken')
const userModel = require('../models/userSchema.js')
const bookModel=require('../models/bookSchema.js')
const authentication=async function(req,res,next){
    try{
        let token=req.headers["x-api-key"]
        if(!token){
            return res.status(400).send({message:"token must be passed",status:false})
        }
        const decodedToken=jwt.verify(token,"village-binjhol",
        {ignoreExpiration:true}
        );
        console.log(decodedToken)
        if(!decodedToken){
            return res.status(401).send({message:"invalid jwt token"})
        }
        if(Date.now>decodedToken.exp*1000){
            return res.status(401).send({message:"session expired",status:false})
        }
        req.userId=decodedToken.userId;
        //console.log(req.userId)
        next()
        
    }
    catch (err) { return res.status(500).send({ Error: "internal server error", message: err.message, status: false }) }
}


module.exports={authentication}