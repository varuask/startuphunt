const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

//Load env vars 
dotenv.config({path: './config/config.env'});

//Load models 
const Startup = require('./models/Startup'); 
const Product = require('./models/Product'); 
const User = require('./models/User'); 
const Review = require('./models/Review');



//connect DB 
mongoose.connect(process.env.MONGO_URI , {
    useNewUrlParser : true,
  //  useCreateIndex : true,
  //  useFindAndModify : false  
}); 

//Read JSON files 
const startups = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/startups.json`,'utf-8')
); 

const products = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/products.json`,'utf-8')
);

const users = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/users.json`,'utf-8')
) 

const reviews = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/reviews.json`,'utf-8')
)

//Import into DB 
const importData = async() => {
    try{
        await Startup.create(startups); 
        await Product.create(products);
        await User.create(users);
        await Review.create(reviews);
        console.log('Data imported....'.green.inverse);
        process.exit();
    }
    catch(err)
    {
        console.error(err);
    }
}

//Delete Data 
const deleteData = async()=>{
    try{
        await Startup.deleteMany(); 
        await Product.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log('Data Destroyed....'.red.inverse);
        process.exit();
    }catch(err)
    {
        console.error(err);
    }
}

if(process.argv[2]==='-i'){
    importData();
}else if(process.argv[2]==='-d')
{
    deleteData();
}
