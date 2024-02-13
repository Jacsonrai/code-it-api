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
        res.status(200).json({data:blog,message:"blog datad successfully deleted",status:200})
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
