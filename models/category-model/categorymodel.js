const mongoose=require('mongoose')
const categorySchema=mongoose.Schema({
    name:{
        type:String,
        required:[true,'please enter the category name']
    },
    slug:{
        type:String,
        required:[true,'please enter the category slug'],
        unique:true
    },
},{
    timestamps:true
}
)
const Category=mongoose.model('Category',categorySchema);
module.exports=Category