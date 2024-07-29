const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const PostSchema=new Schema({
    title:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true
    },
    body:{
        type:String,
        rquired:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    updateAt:{
        type:Date,
        default:Date.now
    }

});

 module.exports = mongoose.model('Post',PostSchema);