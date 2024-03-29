const express=require('express')
const Blog=require('./models/blog-model/blogmodel')
const User=require('./models/user-model/usermodel')
const{body,validationResult, param}=require('express-validator')
const cors=require('cors')
const mongoose=require('mongoose')
const bcrypt=require("bcryptjs")

const app=express()
const PORT=8000
const jwt=require("jsonwebtoken")
const Category = require('./models/category-model/categorymodel')

app.use(express.json())
app.use(express.urlencoded({extended:false}))

app.use(cors({
    origin: 'http://localhost:3000'
}))

app.get("/",(req,res)=>{
    res.send('Hello NODE API')
})
app.get("/news",async(req,res)=>{
    try{
       const blog= await Blog.find({}).populate('category');
       res.status(200).json({data:blog,message:"news data successfully fetched",status:200})
    }
    catch(err){
        res.status(500).json({message:err.message})
    }
})
app.delete('/news/:id',async(req,res)=>{
    try{
        const {id}=req.params
        const blog= await Blog.findByIdAndDelete(id);
        if(!blog){
            return res.status(404).json({data:[],message:`no blog found.with id ${id}`})
         }
        res.status(200).json({data:blog,message:"news data successfully deleted",status:200})
     }
     catch(err){
         res.status(500).json({message:err.message})
     }
})
app.get('/news/:id',async(req,res)=>{
    try{
        const {id}=req.params
        const blog= await Blog.findById(id).populate('category');
        if(!blog){
            return res.status(404).json({data:[],message:`no newsfound with id ${id}`})
         }
         res.status(200).json({data:blog,message:"news data successfully fetched"})
     }
     catch(err){
         res.status(500).json({message:err.message})
     }
})
app.put('/news/:id',[
body('title').notEmpty().withMessage('Title is required.'),
body('image').notEmpty().withMessage('Image is required.'),
body('description').notEmpty().withMessage('Description is required.'),
body('category').notEmpty().withMessage('category id is required.')
],async(req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    try{
        const {id}=req.params
        const blog=await Blog.updateOne({_id:id},{
            $set:{
                "title":req.body.title,
                "image":req.body.image,
                "description":req.body.description,
                "category":req.body.category
            }
        })
        if(!blog){
         return res.status(404).json({data:[],message:`no blog found.with id ${id}`})
        }
        res.status(200).json({data:blog,message:"news data updated successfully",status:200})
     }
     catch(err){
         res.status(500).json({message:err.message})
     }
})

app.post('/news-create',
[
body('title').notEmpty().withMessage('Title is required.'),
body('image').notEmpty().withMessage('Image is required.'),
body('description').notEmpty().withMessage('Description is required.'),
body('category').notEmpty().withMessage('Category id is required')],

async(req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    try{
        const blog=await Blog.create(req.body)
        res.status(200).json({
            message:"blog created successfully",
            status:200,
            data:blog
        })
    }
    catch(err){
        console.log(err.message)
        res.status(500).json({message:err.message})
    }
})
//category api
app.post('/category',[
    body('name').notEmpty().withMessage('category name is required.'),
    body('slug').notEmpty().withMessage('category slug is required.')
],
async(req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const existedCategory=await Category.findOne({slug:req.body.slug})
    if(existedCategory){
        return res.status(404).json({
            status:404,
            message:"slug already existed"})
    }
    try{
        const category= await Category.create(req.body)
        res.status(200).json({
            message:"blog created successfully",
            status:200,
            data:category
        })

    }catch(err){
        res.status(500).json({message:err.message})
    }
})
app.get("/category",async(req,res)=>{
    try{
       const category= await Category.find({});
       res.status(200).json({data:category,message:"Category data successfully fetched",status:200})
    }
    catch(err){
        res.status(500).json({message:err.message})
    }
})
app.delete("/category/:id",async(req,res)=>{
    try{
        const {id}=req.params
        const category= await Category.findByIdAndDelete(id);
        if(!category){
            return res.status(404).json({data:[],message:`no category found.with id ${id}`})
         }
        res.status(200).json({data:category,message:"category data successfully deleted",status:200})
    }catch(err){
        res.status(500).json({message:err.message})  
    }
})


async function initial(){
    const initialUserData={
        email:"test@gmail.com",
        password:bcrypt.hashSync("password")
    }
   const existedUser=await User.findOne({email:initialUserData.email})
   if(!existedUser){
    const user=await User.create(initialUserData)
    console.log(user,'user created')
   }
  
 
}
app.post('/auth/register',[
    body('email').notEmpty().withMessage('email is required.'),
    body('password').notEmpty().withMessage('password is required.'),
],async(req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    try{
        const existedEmail=await User.findOne({email:req.body.email})
        if(existedEmail){
            return res.status(404).json({
                status: 404,
                message: "email already taken",
            })
        }
        const hashPassword=await bcrypt.hash(req.body.password,10)
       const data={
        email:req.body.email,
        password:hashPassword
       }
        const user=await User.create(data)
        res.status(200).json({data:user,message:"user register successfully",status:200})
    }
    catch(err){
        res.status(500).json({message:err.message})
       }
})


app.post('/auth/login',[
body('email').notEmpty().withMessage('email is required.'),
body('password').notEmpty().withMessage('password is required.'),
],async(req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    try{
        const existedUser=await User.findOne({email:req.body.email})
        if(!existedUser){
            return res.status(404).json({
                status: 404,
                message: "User not found",
            })
        }
        const hashPassword= await existedUser?.password
        const isPasswordMatch=await bcrypt.compare(req.body.password,hashPassword)
        if(!isPasswordMatch)
        {
            return res.status(404).json({
                status: 404,
                message: "Password not found",
            })
        }
        const token = jwt.sign(
            { _id: existedUser?._id, email: existedUser?.email },
            "YOUR_SECRET",
            {
              expiresIn: "1d",
            }
          );
        const data={
            email:existedUser.email,
            token:token
        }
        return res.status(200).json({
            message:"logined successfully",
            status:200,
            data:data
        })

       }catch(err){
        res.status(500).json({message:err.message})
       }
   

})
initial()
mongoose
.connect('mongodb+srv://admin:spaceagent123@cluster0.blokf.mongodb.net/Blog?retryWrites=true&w=majority')
.then(()=>{
    app.listen(PORT,()=>{
        console.log(`Node api is running on port ${PORT}`)
    })
    console.log('mongodb conected successfully')
})
.catch(err=>console.log(err))
