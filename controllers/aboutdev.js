const fs = require('fs');
const path = require('path');
//@desc    About DEV
//@route   GET /api/v1/aboutdev
//@access  Public

exports.aboutDev =  (req,res,next)=> { 
    const data = JSON.parse(
        fs.readFileSync('./_data/aboutdev.json','utf-8')
    ); 

    res.status(200).json({
        success: true,
        data
    });
}; 

//@desc    Download PDF
//@route   GET /api/v1/aboutdev/downloadresume
//@access  Public

exports.downloadResume = (req,res,next) => {
    res.status(200).sendFile(path.join(__dirname,'..','_data','saurav_resume.pdf'));
   // res.download(path.join(__dirname,'..','_data','saurav_resume.pdf'));
}