import mongoose from "mongoose";
import User from "./User.js";

const taskSchema= new mongoose.Schema({
    title: {
    type: String,
    required: true,
    trim: true, // Trim whitespace from the title
  },
  description: {
    type: String,
    trim: true, // Trim whitespace from the description
  },
  completed: {
    type: Boolean,
    default: false, // Default value for completed status is false
  },
  dueDate: {
    type: Date,
    required: false, // Make due date optional
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set the creation timestamp
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // This tells Mongoose it relates to the User collection
    required: true
  }
})

const Task =mongoose.model('Task',taskSchema);

export default Task;