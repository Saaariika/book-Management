const mongoose=require('mongoose')

const userSchema=new mongoose.Schema(
    {
        title:{
            type:String,
            required:true,
            enum:["Mr","Mrs","Miss"],
            trim:true
        }
        ,
        userName:{
            type:String,
            required:true,
            trim:true

        }
        ,
        emailId:{
            type:String,
            required:true,
            unique:true,
            trim:true
        },
        password:{
            type:String,
            required:true,
            trim:true
        },
        phoneNo:{
            type:String,
            required:true,
            unique:true,
            trim:true

        },
        address:{
           country:{type:String,trim:true},
           state:{type:String,trim:true},
           city:{type:String,trim:true},
           street:{type:String,trim:true},
           pinCode:{type:Number,trim:true}
        },
    },
   {timestamps:true}
        


    
)
module.exports=mongoose.model("user",userSchema)