
const ErrorResponse = require('../utils/errorResponse'); 
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');
const crypto = require('crypto');

exports.register= asyncHandler( async(req,res,next)=>{


    const {name,email,password,role} = req.body;

    const user = await User.create({
        name,
        email,
        password,
        role
    }); 

    sendTokenInCookie(user,200,res);
})


exports.login = asyncHandler( async (req,res,next)=>{

    const {email,password} = req.body; 
    if(!email || !password){
        return next(new ErrorResponse('please enter the email and password',404));
    }
    //user check 
    const user = await User.findOne({email}).select('+password'); 
    if(!user){
        return next(new ErrorResponse('Invlaid credentials',404));
    }
    //password check 
    const validity =await user.passwordValidation(password); 
    if(!validity){
        return next(new ErrorResponse('invalid credentials',404));

    }
    sendTokenInCookie(user,200,res);
    
});


//get the currently logged in user 
exports.getMe = asyncHandler( async (req,res,next) => {
    const user = await User.findById(req.user.id); 
    res.status(200).json({
        success: true, 
        data: user
    })
}); 

//update email and password 
//PUT /api/v1/auth/updatedetails
exports.updateDetails = asyncHandler( async (req,res,next) => {

    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email
    }


    const user = await User.findByIdAndUpdate(req.user.id,fieldsToUpdate,{
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success: true, 
        data: user
    })
});   

//update the password 
// PUT /api/v1/auth/updatepassword
exports.updatePassword = asyncHandler( async (req,res,next) => {
    const user = await User.findById(req.user.id).select('+password'); 

    //check current password 
    if(!await user.passwordValidation(req.body.currentPassword)){
        return next(new ErrorResponse('Password is incorrect',401));
    } 

    user.password = req.body.newPassword; 
    await user.save();

    sendTokenInCookie(user,200,res);
}); 



//forget password
// POST /api/v1/auth/forgotpassword
exports.forgotPassword = asyncHandler( async (req,res,next) => {
    const user = await User.findOne({email : req.body.email})
    if(!user){
        return next(new ErrorResponse(`User with this email does not exsit`,404))
    }

    //get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({validateBeforeSave: false}); 
    //create reset URL 
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetPassword/${resetToken}`; 

    const message = `Please make a put req to ${resetUrl}`;
    try{
        await sendEmail({
            email: user.email,
            subject: 'Password reset token',
            message
        });

        return res.status(200).json({success: true,data: 'Email sent'})

    }catch(err){
        console.log(err); 
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined; 

        await user.save({validateBeforeSave: false})

        return next(new ErrorResponse('Email could not be sent',500));

    }
    res.status(200).json({
        success: true, 
        data: user
    })
});

//custom function to send token in a cookie 

const sendTokenInCookie = function (user,statusCode,res){
    const token = user.getSignedJWTtoken();  

    //creating the options js object 
    const options = {
        expires: new Date(Date.now+process.env.JWT_COOKIE_EXPIRE*24*60*60*1000), 
        httpOnly: true
    }

    if(process.env.NODE_ENV==='production'){
        options.secure = true
    }

    res.status(statusCode).cookie('token',token,options).json({success:true,token});
}

//reset password
// /api/v1/auth/resetpassword/:resettoken 
exports.resetPassword = asyncHandler( async (req,res,next) => {
    //get hashed token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now()}
    }); 

    if(!user){
        return next(new ErrorResponse('Invalid Token',400));
    }

    //set new password 
    user.password = req.body.password; 
    user.resetPasswordToken = undefined 
    user.resetPasswordExpire = undefined
    await user.save()

    sendTokenInCookie(user,200,res);
    
}); 