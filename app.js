import User from './model/User.js';
import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import multer from 'multer'; // Import multer
import path from 'path';     // Import path for file paths
import fs from 'fs';         // Import fs for file system operations
import dotenv from 'dotenv'; // Import dotenv

// Load environment variables from .env file FIRST
dotenv.config();

const app = express();
app.use(express.json());

// Get JWT Secret from environment variables
const JWTSECRET = process.env.JWT_SECRET;
if (!JWTSECRET) {
    console.error('ERROR: JWT_SECRET environment variable is not defined in .env file!');
    process.exit(1);
}

// MongoDB Connection URI from environment variables
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/User'; // Fallback for local dev

const connectDB = async () => {
    try {
        console.log("connecting to db");
        await mongoose.connect(MONGO_URI);
    }
    catch(e){
        console.log("error connecting to database");
    }
}
// Original JWTSECRET was here, now using process.env.JWT_SECRET;

function authcheck(req,res,next){
    const authheader=req.header('Authorization');
    console.log(authheader);
    if(!authheader)res.send("connection rejected");
    const token=authheader.split(' ')[1];
    try{
        const decoded=jwt.verify(token,JWTSECRET);
        req.user=decoded;
        next();
    }
    catch(e){
        res.send("error occured denied");
    }
}

connectDB();

app.get('/Users',async (req,res)=>{
    try{
        const age=req.query.age;
        const limit=parseInt(req.query.limit);
        const page=parseInt(req.query.page);
        const sort=req.sort; // Note: req.sort is not how you typically get sort from query. It should be req.query.sort
        const filter={};
        const skip = (page-1)*limit;

        filter.age=age;
        const data=await User.find(filter).sort(sort).skip(page).limit(limit);
        console.log(data);
        res.send(data);
    }
    catch(e){
        console.error(e);
    }
})

app.post('/Register',async (req,res)=>{
    const email =req.body.email;
    if(!email) return res.status(400).json({error:"email not given"});
    try{
        const data=await User.findOne({email});
        if(!data){
            const user=new User(req.body);
            await user.save();
            res.send("data added successfully");
        }
        else{
            res.send("already there");
        }
    }
    catch(e){
        res.send("error sending data to data base");
    }
})

app.post('/Login',async (req,res)=>{
    try{
        const email=req.body.email;
        const data=await User.findOne({email});
        if(data){
            const token=jwt.sign({userId:data.email},JWTSECRET,{expiresIn:'1h'})
            res.json({token});
        }
        else{
            res.send("login failed invalid credentials");
        }
    }
    catch(e){
        // Error handling for login
    }
})

app.get('/auth',authcheck,(req,res)=>{
    res.send("autheriazation complete successfull");
})

app.post('/add',async (req,res)=>{
    try{
        const user =new User(req.body);
        await user.save();
        res.send("user data saved");
    }
    catch(e){
        res.send("error saving user data");
    }
})

const uploadsDir = path.join(process.cwd(), 'uploads'); // Use process.cwd() for robust pathing

// Create the 'uploads' directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true }); // recursive: true creates parent directories if needed
    console.log(`Created uploads directory at: ${uploadsDir}`);
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir); // Files will be saved in the 'uploads' directory
    },
    filename: function (req, file, cb) {
        // Append a timestamp to the original filename to ensure uniqueness
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Multer upload middleware instance
const upload = multer({ storage: storage });

app.post('/upload',upload.single('profilePicture'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    // You might want to save the file path/name to the user's database record here
    // Example: await User.findByIdAndUpdate(req.user.userId, { profilePicture: req.file.filename });
    res.status(200).json({
        message: 'File uploaded successfully!',
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}` // Provide a path to access it
    });
});

// Use PORT from environment variables or default to 8800
const PORT = process.env.PORT || 8800;
app.listen(PORT,(req,res)=>{
    console.log(`server running at port ${PORT}`)
})