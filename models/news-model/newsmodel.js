const mongoose=require('mongoose')

const newsSchema=mongoose.Schema({
    title:{
        type:String,
        required:[true,"Please enter the blog title."]
    },
    description:{
        type:String,
        required:[true]
    },
    image:{
        type:String,
        required:[true]
    },

},{
    timestamps:true
})
const News=mongoose.model('News',newsSchema);
module.exports=News;