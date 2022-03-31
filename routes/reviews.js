const express = require('express');

const {
    getReviews,
    getReview,
    createReview,
    updateReview,
    deleteReview
    
} = require('../controllers/reviews'); 


const Review = require('../models/Review'); 

const router = express.Router({mergeParams: true});
const advancedResults = require('../middleware/advancedResults.js')
const {protect,authorize} = require('../middleware/auth.js');



router.route('/').get(advancedResults(Review, {
    path: 'startup',
    select: 'name description'
}),getReviews).post(protect,authorize('user','admin'),createReview)

router.route('/:id').get(getReview).put(protect,authorize('user','admin'),updateReview).delete(protect,authorize('user','admin'),deleteReview);

module.exports=router;