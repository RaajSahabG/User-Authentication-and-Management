const express = require("express");
const mongoose = require("mongoose")
const path = require("path");
mongoose.connect("mongodb://127.0.0.1:27017/user_management_system");
const app = express();

//for user routes
const userRoute = require("./routes/userRoute")
app.use("/",userRoute);

//for admin routes
const adminRoute = require("./routes/adminRoute");
app.use("/admin",adminRoute);
//serve files
// app.set("css",path.join("./public/css"));
app.use(express.static(path.join(__dirname,'public')));
app.listen(3000, function(){
    console.log(`server run at port 3000`);
})