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
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Health check endpoint for Render
app.get('/', (req, res) => {
    res.status(200).send('API is running');
});
app.use("/uploads", express.static("uploads"));


//Connect Database
connectDB();




app.use("/api/user",profileRouter);
app.use("/api/projects", projectRouter);
app.use('/api/auth',userRouter);

const PORT=process.env.PORT || 8080;

app.listen(PORT,()=>{
    console.log('Server running at the ',PORT);
})