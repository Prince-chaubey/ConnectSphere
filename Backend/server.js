require("dotenv").config();
const express=require("express");
const connectDB = require("./config/db");
const app=express();
const cors=require("cors");
const userRouter = require("./routes/userRoute");
const profileRouter = require("./routes/profileRoute");



app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));


//Connect Database
connectDB();


//All APIs Point


app.use('/api/auth',userRouter);
app.use("/api/user",profileRouter);
const PORT=process.env.PORT || 8080;

app.listen(PORT,()=>{
    console.log('Server running at the ',PORT);
})