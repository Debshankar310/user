import mongoose from 'mongoose';

const userschema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    date:{
        type:Date,
        required:true,
        default:Date.now
    },
    age:{
        type:String,
        required:true,
        min:1
    }
})

userschema.index({email:1,age:-1});

const User=mongoose.model('User',userschema);

export default User;