const express = require('express');

const {
    getProducts,getProduct,addProduct,updateProduct,deleteProduct
    
} = require('../controllers/products'); 

const {protect,authorize} = require('../middleware/auth.js');
const Product = require('../models/Product'); 
const advancedResults = require('../middleware/advancedResults.js')

const router = express.Router({mergeParams: true});

router.route('/').get(advancedResults(Product, {
    path: 'startup',
    select: 'name description'
}),getProducts).post(protect,authorize('admin','publisher'),addProduct); 
router.route('/:id').get(getProduct).put(protect,authorize('admin','publisher'),updateProduct).delete(protect,authorize('admin','publisher'),deleteProduct);


module.exports=router;