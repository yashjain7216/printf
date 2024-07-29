const express=require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken');
const adminLayout = '../views/layouts/admin';

const jwtSecret = process.env.JWT_SECRET;
//login authorization
const authMiddleware =(req,res,next)=>{
  const token =req.cookies.token;
  if(!token){
    return res.status(401).json({message:'unauthorized'});
  }
  try{
    const decoded = jwt.verify(token,jwtSecret);
    req.userId = decoded.userId;
    next();
  }catch(error){
    res.status(401).json({message:'Unauthorized'});
  }
}

//getting admin home
router.get('/admin',async(req,res)=>{
    try {
        const locals={
            title:"Admin",
            description:"Create Read Update"

        }
        res.render('admin/index',{locals,layout:adminLayout});
    } catch (error) {
       console.log(error); 
    }
})

router.get('/register', (req, res) => {
  res.render('admin/register');
});

//login
router.post('/admin',async(req,res)=>{
    try {
      const {username,password}=req.body;
      const user = await User.findOne({username});
      if(!user){
        return res.status(401).json({message:'Invalid credentials'});
      }
       const isPasswordValid = await bcrypt.compare(password,user.password);
       if(!isPasswordValid){
        return res.status(401).json({message:'Invalid credentials'});
      }
       const token = jwt.sign({userId:user._id},jwtSecret);
       res.cookie('token',token,{httpOnly:true});
       res.redirect('/dashboard');
    } catch (error) {
       console.log(error); 
    }
});
//dashboard
router.get('/dashboard',authMiddleware,async(req,res)=>{
  try {
    const locals={
      title:'Dashboard',
      description:'create update delete'
    }
    const data =await Post.find();
    res.render('admin/dashboard',{
    locals,data,layout:adminLayout
    });
  } catch (error) {
    console.log(error);
  }

});
//get new post
router.get('/add-post',authMiddleware,async(req,res)=>{
  try {
    const locals={
      title:'Add Post',
      description:'create update delete'
    }
    const data =await Post.find();
    res.render('admin/add-post',{
    locals,layout:adminLayout});
  } catch (error) {
    console.log(error);
  }

});
//post new post
router.post('/add-post',authMiddleware,async(req,res)=>{
  try {
    console.log(req.body);
    try {
      const newPost = new Post({
        title: req.body.title,
        username: req.body.username,
        body: req.body.body
      });
      await Post.create(newPost);
      res.redirect('/dashboard');
    } catch (error) {
      console.log(error);
    }
    
  } catch (error) {
    console.log(error);
  }

});
//edit post
router.put('/edit-post/:id',authMiddleware,async(req,res)=>{
  try {
  await Post.findByIdAndUpdate(req.params.is,{
        title: req.body.title,
        username: req.body.username,
        body: req.body.body,
        updatedAt: Date.now()
  });
  res.redirect(`/edit-post/${req.params.id}`);
  } catch (error) {
    console.log(error);
  }

});
//get edit post
router.get('/edit-post/:id', authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Edit Post",
      description: "create post update",
    };
    const data = await Post.findOne({ _id: req.params.id });
    res.render('admin/edit-post', {
      locals,
      data,
      layout: adminLayout
    })
  } catch (error) {
    console.log(error);
  }

});




//registration
router.post('/register',async(req,res)=>{
    try {
      const {username,password}=req.body;
      const hashedPassword = await bcrypt.hash(password,10);
      try {
        const user= await User.create({username,password:hashedPassword})
        res.redirect('/admin');
        
      } catch (error) {
        if(error.code===11000){
        res.status(409).json({message:'user already in use'});
        }
        res.status(409).json({message:'internal server issue'});
      }



    } catch (error) {
       console.log(error); 
    }
})
//delete post
router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
  try {
    await Post.deleteOne( { _id: req.params.id } );
    res.redirect('/dashboard');
  } catch (error) {
    console.log(error);
  }
});
//logout
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  //res.json({ message: 'Logout successful.'});
  res.redirect('/');
});





module.exports = router;
