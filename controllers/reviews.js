const ErrorResponse = require('../utils/errorResponse'); 
const asyncHandler = require('../middleware/async');
const Review = require('../models/Review'); 
const Startup = require('../models/Startup'); 

//@desc     get all reviews
//@route    GET /api/v1/reviews
//@route    GET /api/v1/startups/:startupId/reviews
//@access   public 

exports.getReviews = asyncHandler (async (req,res,next) => {
     

    if(req.params.startupId){
      const  reviews = await Review.find({startup: req.params.startupId}); 

      res.status(200).json({
        success: true, 
        count: reviews.length, 
        data: reviews
    });
    }else{
        res.status(200).json(res.advancedResults);
        
    }
    
})

//@desc     get all reviews
//@route    GET /api/v1/reviews/:id
//@access   public 

exports.getReview = asyncHandler (async (req,res,next) => {
     const review = await Review.findById(req.params.id).populate({
         path: 'startup', 
         select: 'name description'
     }); 

     if(!review){
         return next(new ErrorResponse(`No reviews found wiht the id of ${req.params.id}`,404));
     }

     res.status(200).json({
         success: true,
         data: review

     })
})   


//@desc     Create a Review
//@route    GET /api/v1/startups/:startupId/reviews
//@access   private

exports.createReview = asyncHandler (async (req,res,next) => {
    req.body.startup = req.params.startupId; 
    req.body.user = req.user.id; 

    const startup = await Startup.findById(req.params.startupId); 
    if(!startup){
        return next(new ErrorResponse(`No Startup found with the id of ${req.params.startupId}`,404));
    }

    const review = await Review.create(req.body);

    res.status(201).json({
        success: true,
        data: review

    })
})



//@desc     Update a Review
//@route    GET /api/v1/reviews/:id
//@access   private

exports.updateReview = asyncHandler (async (req,res,next) => {
    

    let review = await Review.findById(req.params.id); 
    if(!review){
        return next(new ErrorResponse(`No review found with the id of ${req.params.id}`,404));
    }

    //make sure review belongs to user or user is admin 
    if(review.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`Not authorized`,401));
    }

    review = await Review.findByIdAndUpdate(req.params.id,req.body,{
        new:true, 
        runValidators: true
    })

    res.status(200).json({
        success: true,
        data: review

    })
}) 

//@desc     Delete a review
//@route    DELETE /api/v1/reviews/:id
//@access   private

exports.deleteReview = asyncHandler (async (req,res,next) => {
    

    const review = await Review.findById(req.params.id); 
    if(!review){
        return next(new ErrorResponse(`No review found with the id of ${req.params.id}`,404));
    }

    //make sure review belongs to user or user is admin 
    if(review.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`Not authorized`,401));
    }

    await review.remove();

    res.status(200).json({
        success: true,
        data: { }

    })
})