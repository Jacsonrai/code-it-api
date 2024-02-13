const mongoose=require('mongoose')
const User=mongoose.model(
    "User",
    new mongoose.Schema({
        email:{
            type:String,
            required:[true,"Please enter the email"]
        },
        password:{
            type:String,
            required:[true,"Please enter the password"]
        }
    },{
        timestamps:true
    })
)
module.exports=User