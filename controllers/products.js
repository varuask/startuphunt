const ErrorResponse = require('../utils/errorResponse'); 
const asyncHandler = require('../middleware/async');
const Product = require('../models/Product'); 
const Startup = require('../models/Startup'); 

//@desc     get all products 
//@route    GET /api/v1/products 
//@route    GET /api/v1/startups/:startupId/products 
//@access   public 

exports.getProducts = asyncHandler (async (req,res,next) => {
     

    if(req.params.startupId){
      const  products = await Product.find({startup: req.params.startupId}); 

      res.status(200).json({
        success: true, 
        count: products.length, 
        data: products
    });
    }else{
        res.status(200).json(res.advancedResults);
        
    }
    
})   

//@desc     get single product 
//@route    GET /api/v1/products/:id
//@access   public 

exports.getProduct = asyncHandler (async (req,res,next) => {

    const product = await Product.findById(req.params.id).populate({
        path: 'startup',
        select: 'name description'
    }); 

    if(!product)
    {
        return next(new ErrorResponse(`No product with the id of ${req.params.id}`,404))
    }
    
    res.status(200).json({
        success: true, 
        data: product
    });
})

//@desc     add a new product
//@route    POST /api/v1/startups/:startupId/products 
//@access   private 

exports.addProduct = asyncHandler (async (req,res,next) => { 

    req.body.startup = req.params.startupId 
    req.body.user = req.user.id

    const startup = await Startup.findById(req.params.startupId); 

    if(!startup)
    {
        return next(
            new ErrorResponse(`No startup with the id of ${req.params.startupId}`))
    } 

    if(startup.user.toString()!==req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`User ${req.user.email} is not allowed add a product to this startup`,401));
    }
    const product = await Product.create(req.body);
    
    res.status(200).json({
        success: true, 
        data: product
    });
}) 

//@desc     update product 
//@route    PUT /api/v1/products/:id
//@access   private 

exports.updateProduct = asyncHandler (async (req,res,next) => { 

    

    let product = await Product.findById(req.params.id); 

    if(!product)
    {
        return next(
            new ErrorResponse(`No product with the id of ${req.params.id}`,404))
    } 

    if(product.user.toString()!==req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`User ${req.user.email} is not allowed add a product to this startup`,401));
    }

    product = await Product.findByIdAndUpdate(req.params.id,req.body,{
        new: true, 
        runValidators: true
    });
    
    res.status(200).json({
        success: true, 
        data: product
    });
}) 

//@desc     delete a product 
//@route    DELETE /api/v1/products/:id
//@access   private 

exports.deleteProduct = asyncHandler (async (req,res,next) => { 

    const product = await Product.findById(req.params.id); 

    if(!product)
    {
        return next(
            new ErrorResponse(`No product with the id of ${req.params.id}`,404))
    } 

    if(product.user.toString()!==req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`User ${req.user.email} is not allowed add a product to this startup`,401));
    }

    await product.remove(); 
    
    res.status(200).json({
        success: true, 
        data: {}
    });
})