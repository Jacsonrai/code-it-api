const express=require('express')
const Blog=require('./models/blog-model/blogmodel')
const{body,validationResult, param}=require('express-validator')
const cors=require('cors')
const mongoose=require('mongoose')

const app=express()
const PORT=8000

app.use(express.json())
app.use(express.urlencoded({extended:false}))

app.use(cors({
    origin: 'http://localhost:3000'
}))

app.get("/",(req,res)=>{
    res.send('Hello NODE API')
})
app.get("/blog",async(req,res)=>{
    try{
       const blog= await Blog.find({});
       res.status(200).json({data:blog,message:"blog data successfully fetched",status:200})
    }
    catch(err){
        res.status(500).json({message:err.message})
    }
})
app.delete('/blog/:id',async(req,res)=>{
    try{
        const {id}=req.params
        const blog= await Blog.findByIdAndDelete(id);
        if(!blog){
            return res.status(404).json({data:[],message:`no blog found.with id ${id}`})
         }
        res.status(200).json({data:blog,message:"blog datad successfully deleted"})
     }
     catch(err){
         res.status(500).json({message:err.message})
     }
})
app.get('/blog/:id',async(req,res)=>{
    try{
        const {id}=req.params
        const blog= await Blog.findById(id);
        if(!blog){
            return res.status(404).json({data:[],message:`no blog found with id ${id}`})
         }
         res.status(200).json({data:blog,message:"blog data successfully fetched"})
     }
     catch(err){
         res.status(500).json({message:err.message})
     }
})
app.put('/blog/:id',[
body('title').notEmpty().withMessage('Title is required.'),
body('image').notEmpty().withMessage('Image is required.'),
body('description').notEmpty().withMessage('Description is required.')
],async(req,res)=>{
    try{
        const {id}=req.params
        const blog= await Blog.findByIdAndUpdate(id,req.body);
        if(!blog){

           return res.status(404).json({data:[],message:`no blog found.with id ${id}`})
        }
        const updated=await Blog.findById(id)
        res.status(200).json({data:updated,message:"blog data updated successfully",status:200})
     }
     catch(err){
         res.status(500).json({message:err.message})
     }
})

app.post('/blog-create',
[
body('title').notEmpty().withMessage('Title is required.'),
body('image').notEmpty().withMessage('Image is required.'),
body('description').notEmpty().withMessage('Description is required.')],
async(req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
   
    try{
        const blog=await Blog.create(req.body)
        res.status(200).json(blog)
    }
    catch(err){
        console.log(err.message)
        res.status(500).json({message:err.message})
    }
})

mongoose
.connect('mongodb+srv://admin:spaceagent123@cluster0.blokf.mongodb.net/Blog?retryWrites=true&w=majority')
.then(()=>{
    app.listen(PORT,()=>{
        console.log(`Node api is running on port ${PORT}`)
    })
    console.log('mongodb conected successfully')
})
.catch(err=>console.log(err))
