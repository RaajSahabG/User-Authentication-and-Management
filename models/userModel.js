const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
     
    name:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true
    },
    mobile:{
        type:Number,
        require:true
    },
    image:{
        type:String,
        requrie:true
    },
    password:{
        type:String,
        requrie:true
    },
    is_admin:{
        type:Number,
        requrie:true
    },
    is_varified:{
        type:Number,
        default:0
    },
    token:{
        type:String,
        default:''
    }
})
module.exports = mongoose.model('user',userSchema);