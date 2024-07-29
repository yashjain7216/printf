const express=require('express');
const router = express.Router();
const Post = require('../models/Post');
//get post
router.get('',async(req,res)=>{
    try {
        const locals={
            title:"Printf",
            description:"simple website"
        }
        let perPage = 10;
        let page = req.query.page||1;
        const data= await Post.aggregate([{$sort:{createdAt:-1}}])
        .skip(perPage*page-perPage)
        .limit(perPage)
        .exec();

        const count = await Post.countDocuments({});
        const nextPage = parseInt(page)+1;
        const hasNextPage = nextPage <=Math.ceil(count/perPage);
        
        res.render('index',{
            locals,
            data,
            current:page,
            nextPage:hasNextPage ? nextPage : null
           
        });
    } 
    catch (error) {
        console.log(error);
    }
    
});
//get post with id
router.get('/post/:id',async(req,res)=>{
   try {
    
       let slug = req.params.id;
       const data = await Post.findById({_id:slug});
       const locals={
        title:data.title,
        description:data.description,
        username:data.username
       }
       res.render('post',{locals,data});
   } 
   catch (error) {
    console.loglog(error);
   }


    res.render('about');
})
//search route
router.post('/search', async (req, res) => {
    try {
      const locals = {
        title: "Seach",
        description: "Simple Blog created with NodeJs, Express & MongoDb."
      }
      let searchTerm = req.body.searchTerm;
      const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "")
  
      const data = await Post.find({
        $or: [
          { username: { $regex: new RegExp(searchNoSpecialChar, 'i') }}
        ]
      });
      res.render("search", {
        data,
        locals
      });
    } catch (error) {
      console.log(error);
    }
  
  });
  



//get about page
router.get('/about',(req,res)=>{
    res.render('about');
})
//get login page
router.get('/login',(req,res)=>{
    res.render('login');
})
module.exports=router;
