const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const config = require("../config/config");

const randormstring = require("randomstring");



const securePassword = async(password)=>{
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
}
// for send mail

const sendVerifyMail = async(name, email, user_id)=>{
    try {
        const transporter =  nodemailer.createTransport({
            host:"smtp.gmail.com",
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:config.emailUser,
                pass:config.emailPassword

            }
        });
        const mailOptions = {
            from:'',
            to:email,
            subject:'For Verification mail',
            html:'<p>Hii '+name+', This is Vishal Raj Owner of trillion doller Company please click here to <a href="http://localhost:3000/verify?id='+user_id+'"> verify </a> your mail.</p>'
        }
        transporter.sendMail(mailOptions, function(error,info){
            if(error){
                console.log(error);
            }
            else{
                console.log("Email has been sent:- ",info.response);
            }
        })
    } catch (error) {
        console.log(error.message);
    }
}

//for reset  password sendMail

const sendResetPasswordMail = async(name, email, token)=>{
    try {
        const transporter =  nodemailer.createTransport({
            host:"smtp.gmail.com",
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:config.emailUser,
                pass:config.emailPassword

            }
        });
        const mailOptions = {
            from:config.emailUser,
            to:email,
            subject:'For Reset Password',
            html:'<p>Hii '+name+', i am your big brother vishal here sun ye kar please click here to <a href="http://localhost:3000/forget-password?token='+token+'"> Reset</a> your password.</p>'
        }
        transporter.sendMail(mailOptions, function(error,info){
            if(error){
                console.log(error);
            }
            else{
                console.log("Email has been sent:- ",info.response);
            }
        })
    } catch (error) {
        console.log(error.message);
    }
}

const loadRegister = async(req,res)=>{
    try {
        
         res.render("registration");

    } catch (error) {
        console.log(error.message);
    }
};
const insertUser = async(req,res)=>{
    try {
        const spassword = await securePassword(req.body.password);
        const user = new User({
            name:req.body.name,
            email:req.body.email,
            mobile:req.body.mno,
            image:req.file.filename,
            password:spassword,
            is_admin:0,
        });

        const userData = await user.save();

        if(userData){
            sendVerifyMail(req.body.name, req.body.email, userData._id);
            res.render("registration",{message:"Your registration has successfully. Please verify your Email"});

        }else{
            res.render("registration",{message:"Your registration has not been successfully."});
        }

    } catch (error) {
        console.log(error.message);
    }
}

const verifyMail = async(req,res)=>{
    try {
        
         const updateInfo = await User.updateOne({_id:req.query.id},{ $set:{is_varified:1 }});
         
         console.log(updateInfo);
         res.render("email-verified");

    } catch (error) {
        console.log(error.message);
    }
}
//login user started

const loginLoad = async(req,res)=>{
    try {
        res.render('login');
    } catch (error) {
        console.log(error.message);
    }
}
const verifyLogin = async(req,res)=>{
    try {
        const email = req.body.email;
        const password = req.body.password;

       const userData = await User.findOne({email:email}); 

       if(userData){
          const passwordMatch = await bcrypt.compare(password,userData.password);

          if(passwordMatch){
            if(userData.is_varified == 0){
                res.render("login",{message:"Please verify your mail,"});
            }
            else{
                req.session.user_id = userData._id;
                res.redirect('/home');
            }

          }else{
            res.render("login",{message:"email and password is incorrect"})
          }
       }else{
        res.render("login",{message:"email and password is incorrect"})
       }

    } catch (error) {
       
    }
}
const loadHome = async(req,res)=>{
    try {
        const userData = await User.findById({ _id:req.session.user_id});

        res.render("home",{ user:userData});  
    } catch (error) {
        console.log(error.message);
    }
}
const userLogout = async(req,res)=>{
    try {
        req.session.destroy();
        res.redirect('/');
    } catch (error) {
        console.log(error.message);
    }
}
// forget password create
const forgetLoad = async(req,res)=>{
    try {
        res.render('forget');
    } catch (error) {
        console.log(error.message);
    }
}
const forgetVerify = async(req,res)=>{
    try {
        const email = req.body.email;
        const userData = await User.findOne({email:email});
        if (userData) {
            const randomString = randormstring.generate();
            if (userData.is_varified == 0) {
                res.render("forget",{message:"Please Verify your email"});
            } else {
                const randomString = randormstring.generate();
                const updatedData = await User.updateOne({email:email},{$set:{ token:randomString }});
                sendResetPasswordMail(userData.name,userData.email,randomString);
                res.render("forget",{message:"Please check your mail for reset your password"});
            }
        } else {
            res.render("forget",{message:"user mail is incorrect"});
        }
    } catch (error) {
        console.log(error.message);
    }
}
const forgetPasswordLoad = async(req,res)=>{
    try {
        const token = req.query.token;
        const tokenData = await User.findOne({token:token})
        if (tokenData) {
            res.render("forget-password",{user_id:tokenData._id});
        } else {
            res.render("404",{message:"Token is invalid."});
        }
    } catch (error) {
        console.log(error.message);
    }
}
const resetPassword = async(req,res)=>{
    try {
        const password = req.body.password;
        const user_id = req.body.user_id;

        const secure_password = await securePassword(password);
        const userupdateData = await User.findByIdAndUpdate({_id:user_id},{$set:{password:secure_password, token:'' }})
        res.redirect("/");

    } catch (error) {
        console.log(error.message);
    }
}
//for verification send mail link
const verificationLoad = async(req,res)=>{
    try {
        res.render("verification");
    } catch (error) {
        console.log(error.message);
    }
}
const sendverificationLink = async(req,res)=>{
    try {
        const email = req.body.email;
        const userData = await User.findOne({ email:email});
        if(userData){
            sendVerifyMail(userData.name, userData.email, userData._id);

            res.render('verification',{message:"Reset verification mail sent you mail id, please check now"})
        }
    } catch (error) {
        console.log(error.message);
    }
}
//user profile edit and update
const editLoad = async(req,res)=>{
    try {
        const id = req.query.id;
        const userData = await User.findById({_id:id});

        if(userData){
            res.render("edit",{ user: userData});
        }
        else{
            res.redirect("home");
        }
    } catch (error) {
        console.log(error.message);
    }
};
const updateProfile = async(req,res)=>{
    try {
        if(req.file){
            const userData = await User.findByIdAndUpdate({_id: req.body.user_id},{$set:{name:req.body.name, email:req.body.email, mobile:req.body.mno, image:req.file.filename}});
        }
        else{
          const userData = await User.findByIdAndUpdate({_id: req.body.user_id},{$set:{name:req.body.name, email:req.body.email, mobile:req.body.mno}});
        }
        res.redirect("/home");
    } catch (error) {
        console.log(error.message);
    }
}
const homesLoad = async(req,res)=>{
   try {
       res.render("homes");
   } catch (error) {
     console.log(error.message);
   }
}
const loadContact = async(req,res)=>{
    try {
        res.render("Contact");
    } catch (error) {
        console.log(error.message);
    }
}
const loadSignup = async(req,res)=>{
    try {
        res.render("signup");
    } catch (error) {
        console.log(error.message);
    }
}
const loadSignupG = async(req,res)=>{
    try {
        
    } catch (error) {
        console.log(error.message);
    }
}
const loadUpdateProfile = async(req,res)=>{
    try {
        res.render("updateProfile");
    } catch (error) {
        console.log(error.message);
    }
}
const loadCoverPhoto = async(req,res)=>{
    try {
        var accessToken = request.fields.accessToken;
        var coverPhoto = "";
        database.collection("users").findOne({
            "accessToken": accessToken
        }, function (error, user){
            if(user == null){
                res.json({
                    "status": "error",
                    "message": "User has logged out. Please login again"
                });
            }else {
                if(require.files.coverPhoto.seze> 0 && request.files.coverPhoto.type.include("image")){
                    if(user.coverPhoto != ""){
                        fileSystem.unlink(user.coverPhoto, function(error){

                        });
                    }
                    coverPhoto = "public/images/"+ new Date().getTime() + "-"+ request.files.coverPhoto.name;
                    fileSystem.rename(req.files.coverPhoto.path, coverPhoto, function(error){

                    });
                    database.collection("users").updateOne({
                        "accessToken": accessToken
                    }, {
                        $set: {
                            "coverPhoto": coverPhoto
                        }
                    }, function(error, data){
                        res.json({
                            "status": "status",
                            "message": "Cover photo has been updated.",
                            data: mainURL + "/" + coverPhoto
                        });
                    });
                } else {
                    res.json({
                        "status": "error",
                        "message": "Please select valid image."
                    });
                }
            }
        });
    
    } catch (error) {
        console.log(error.message);
    }
}
module.exports = {
    loadRegister,
    insertUser,
    verifyMail,
    loginLoad,
    verifyLogin,
    loadHome,
    userLogout,
    forgetLoad,
    forgetVerify,
    forgetPasswordLoad,
    resetPassword,
    verificationLoad,
    sendverificationLink,
    editLoad,
    updateProfile,
    homesLoad,
    loadContact,
    loadSignup,
    loadUpdateProfile
}