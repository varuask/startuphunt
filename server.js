const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan'); 
const colors = require('colors'); 
const fileupload = require('express-fileupload');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet'); 
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp'); 
const cors = require('cors');
const cookieParser = require('cookie-parser')
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');


//load env vars 
dotenv.config({path : './config/config.env'}); 
//connect to DB 
connectDB();
// Route files 

const startups = require('./routes/startups');
const products = require('./routes/products');
const auth = require('./routes/auth');
const users = require('./routes/users'); 
const reviews = require('./routes/reviews'); 
const aboutdev = require('./routes/aboutdev');

const app = express(); 
//Body parser 
app.use(express.json());
//cookie parser 
app.use(cookieParser());


//Dev logging middlware 
if(process.env.NODE_ENV === 'development')
{
    app.use(morgan('dev'));
}

//File uploading 
app.use(fileupload()); 

//sanitize data 
app.use(mongoSanitize());


//set security headers 
app.use(helmet());


//prevent xss attacks
app.use(xss()); 

//rate limiting 
const limiter = rateLimit({
    windowMs: 10*60*1000, //10 mins 
    max: 100
})

app.use(limiter); 

//prevent hpp param pollution
app.use(hpp());

//enable cors
app.use(cors());

//set static folder 
app.use(express.static(path.join(__dirname,'public')));

//Mount routers 
app.use('/api/v1/startups',startups); 
app.use('/api/v1/products',products); 
app.use('/api/v1/auth',auth); 
app.use('/api/v1/users',users); 
app.use('/api/v1/reviews',reviews);
app.use('/api/v1/aboutdev',aboutdev);
app.use(errorHandler);   

const PORT = process.env.PORT || 5000

const server =app.listen(PORT,console.log(`Server running in ${process.env.NODE_ENV} mode on PORT ${PORT}`.yellow.bold));

//Handle unhandled promise rejection 
process.on('unhandledRejection',(err,promise)=>{
    console.log(`Error : ${err.message}`.red); 
    //close server and exit process 
    server.close(()=>process.exit(1));
});