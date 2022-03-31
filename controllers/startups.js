const path = require('path');
const ErrorResponse = require('../utils/errorResponse'); 
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const Startup = require('../models/Startup');

//@desc     get all startups 
//@route    GET /api/v1/startups 
//@access   public 

exports.getStartups = asyncHandler (async (req,res,next) => { 

       
        res
            .status(200)
            .json(res.advancedResults);
    
});

//@desc     get single startup
//@route    GET /api/v1/startups/:v1 
//@access   public 

exports.getStartup = asyncHandler (async (req,res,next) => {
    
        const startup = await Startup.findById(req.params.id); 
        if(!startup){
            return  next(new ErrorResponse(`Startup not found with id of ${req.params.id}`,404));
        
        }
        res.status(200).json({success:true,data:startup});
});

//@desc     create new startup
//@route    POST /api/v1/startups/
//@access   private

exports.createStartup = asyncHandler(async (req,res,next) => { 
        //add user to req-body
        req.body.user = req.user.id; 
        //check for published startup
        const publisherFound = await Startup.findOne({user: req.user.id}); 

        if(publisherFound && req.user.role !=='admin'){
            return next(new ErrorResponse(`This user-: ${req.user.id} has already published a startup`,400));
        }
    
        const startup = await Startup.create(req.body); 
        console.log(req.body); 
        res.status(201).json({
        success: true, 
        data: startup
    });
});

//@desc     update  startup
//@route    PUT /api/v1/startups/:v1
//@access   private

exports.updateStartup = asyncHandler(async (req,res,next) => {
        let startup = await Startup.findByIdAndUpdate(req.params.id);
        if(!startup){
            return  next(new ErrorResponse(`Startup not found with id of ${req.params.id}`,404));
        }
        if(startup.user.toString()!==req.user.id && req.user.role !== 'admin'){
            return next(new ErrorResponse(`User ${req.user.email} is not allowed to update this startup`,401));
        }
        startup = await Startup.findByIdAndUpdate(req.params.id,req.body,{
            new: true,
            runValidators: true
        });
        res.status(200).json({success:true,data:startup});
});

//@desc     delete startup
//@route    DELETE /api/v1/startups/:v1
//@access   private

exports.deleteStartup = asyncHandler(async (req,res,next) => {
    
        const startup = await Startup.findById(req.params.id);
        if(!startup){
            return  next(new ErrorResponse(`Startup not found with id of ${req.params.id}`,404));
        }
        if(startup.user.toString()!==req.user.id && req.user.role !== 'admin'){
            return next(new ErrorResponse(`User ${req.user.email} is not allowed to delete this startup`,401));
        }
    
        startup.remove();
        res.status(200).json({success:true,data:{} });
    
});   

//@desc     get startups within a radius 
//@route    GET /api/v1/startups/radius/:zipcode/:distance
//@access   private

exports.getStartupsInRadius = asyncHandler(async (req,res,next) => {
    
    const { zipcode,distance } = req.params;
    

    //Get lat/lng from geocoder 
    const loc = await geocoder.geocode(zipcode); 
    const lat = loc[0].latitude;
    const lng = loc[0].longitude; 

    //calc radius in radians
    //divide dist by radius of earth 
    //Earth radius = 3963 mile/6378 km 
    const radius = distance/3963; 
    const startups = await Startup.find({
        location: { $geoWithin: { $centerSphere: [ [lng, lat], radius ] } }
    });
    res.status(200).json({
        success: true,
        count: startups.length,
        data: startups
    });
    

});  


//@desc     upload a foto for startup 
//@route    DELETE /api/v1/startups/:id/logo
//@access   private

exports.startupLogoUpload = asyncHandler(async (req,res,next) => {
    
    const startup = await Startup.findById(req.params.id);
    if(!startup){
        return  next(new ErrorResponse(`Startup not found with id of ${req.params.id}`,404));
    } 

    if(startup.user.toString()!==req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`User ${req.user.email} is not allowed to delete this startup`,401));
    }

    if(!req.files){
        return next(new ErrorResponse(`Please upload a file`,400));
    }
    
    const file = req.files.file 
    //Make sure that the image is a logo 
    if(!file.mimetype.startsWith('image')){
        return next(new ErrorResponse(`Please upload an iamge`),400);
    }  

    // Check File size 
    if(file.size > process.env.MAX_FILE_UPLOAD){
        return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,400))
    }

    //create a custom filename 
    file.name = `logo_${startup._id}${path.parse(file.name).ext}`;
    
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`,async err=>{
        if(err){
            console.log(err);
            return next(new ErrorResponse(`Problem with the file upload`,500));
        }

        await Startup.findByIdAndUpdate(req.params.id,{logo: file.name});
        res.status(200).json({
            success: true,
            data: file.name
        });
        
    });

});  
