const express=require("express");
const { registerUser, loginUser, forgotPassword, resetPassword } = require("../controller/userController");
const userRouter=express.Router();

userRouter.post('/register',registerUser);
userRouter.post('/login',loginUser);
userRouter.post('/forgot-password', forgotPassword);
userRouter.post('/reset-password', resetPassword);

module.exports=userRouter;