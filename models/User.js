const crypto = require('crypto');
const mongoose = require('mongoose'); 
const bycrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true,'Please add a name'], 

    },
    email: {
        type: String,
        required: [true,'Please enter the email'],
        unique: true,
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          'Please add a valid email'
        ]
    },
    role: {
        type: String,
        enum: ['user','publisher'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true,'Please enter the pass'],
        minlength: 6,
        select: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now

    }

    }


);

UserSchema.pre('save',async function(next){
    if(!this.isModified('password')){
        next();

    }
    const salt = await bycrypt.genSalt(10); 
    this.password = await bycrypt.hash(this.password,salt);
    next();
})

UserSchema.methods.getSignedJWTtoken = function (){
    return jwt.sign({id: this._id},process.env.JWT_SECRET,{
        expiresIn : process.env.JWT_EXPIRES
    })

};

UserSchema.methods.passwordValidation = async function (password){
    return await bycrypt.compare(password,this.password);
}

UserSchema.methods.getResetPasswordToken = function (){
    //generate token 
    const resetToken = crypto.randomBytes(20).toString('hex');
    //hash token and set to resetPasswordToken field 
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex'); 
    //set the expire 
    this.resetPasswordExpire = Date.now()+10*60*1000;
    return resetToken;

}
module.exports = mongoose.model('User',UserSchema);