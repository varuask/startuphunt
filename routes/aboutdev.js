const express = require('express'); 

const {aboutDev,downloadResume} = require('../controllers/aboutdev'); 

const router = express.Router(); 

router.route('/').get(aboutDev);
router.route('/downloadresume').get(downloadResume);


module.exports = router;