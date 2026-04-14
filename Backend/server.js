require("dotenv").config();
const express=require("express");
const connectDB = require("./config/db");
const app=express();
const cors=require("cors");
const userRouter = require("./routes/userRoute");
const profileRouter = require("./routes/profileRoute");
const projectRouter = require("./routes/projectRoute");



app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cors({ origin: "*", credentials: true }));
app.use("/uploads", express.static("uploads"));


//Connect Database
connectDB();

//All APIs Point


app.use("/api/user",profileRouter);
app.use("/api/projects", projectRouter);
app.use('/api/auth',userRouter);

const PORT=process.env.PORT || 8080;

app.listen(PORT,()=>{
    console.log('Server running at the ',PORT);
})