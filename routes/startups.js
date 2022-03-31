const express = require('express');

const {getStartup,
    getStartups,
    createStartup,
    updateStartup,
    deleteStartup,
    getStartupsInRadius,
    startupLogoUpload
} = require('../controllers/startups'); 

const Startup = require('../models/Startup');
const advancedResults = require('../middleware/advancedResults');

const {protect,authorize} = require('../middleware/auth.js');

//include other resource router 
const productRouter = require('./products');  
const reviewsRouter = require('./reviews');

const router = express.Router(); 
//Re-route into other resource router 
router.use('/:startupId/products',productRouter);
router.use('/:startupId/reviews',reviewsRouter);

router.route('/radius/:zipcode/:distance').get(getStartupsInRadius); 

router.route('/:id/logo').put(protect,authorize('admin','publisher'),startupLogoUpload);

router.route('/').get(advancedResults(Startup,'products'),getStartups).post(protect,authorize('admin','publisher'),createStartup);

router.route('/:id').get(getStartup).put(protect,authorize('admin','publisher'),updateStartup).delete(protect,authorize('admin','publisher'),deleteStartup);


module.exports = router;