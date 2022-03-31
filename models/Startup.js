const mongoose = require('mongoose');
const slugify = require('slugify'); 
const geocoder = require('../utils/geocoder');

const StartupSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true,'Please add a name'],
        unique: true, 
        trim: true,
        maxlength: [50,'Name cant be more than 50 characters']
    },
    slug: String,
    description:{
        type: String,
        required: [true,'Please add a description'],
        maxlength: [500,'Description cant be more than 50 characters']
    },
    website: {
        type: String,
        match: [
          /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
          'Please use a valid URL with HTTP or HTTPS'
        ]
    },
    phone: {
        type: String,
        maxlength: [20, 'Phone number can not be longer than 20 characters']
    },
    email: {
        type: String,
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          'Please add a valid email'
        ]
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    location: {
        type: {
          type: String, // Don't do `{ location: { type: String } }`
          enum: ['Point'], // 'location.type' must be 'Point'
          required: false
        },
        coordinates: {
          type: [Number],
          required: false,
          index: '2dsphere'
        },
        formattedAddress: String,
        street: String,
        city: String,
        state: String,
        zipcode: String,
        country: String
    },
    businessModel: {
        // Array of strings
        type: [String],
        required: true,
        enum: [
          'b2b',
          'b2c',
          'd2c',
          'c2c',
          'd2c'
        ]
    },
    averageRating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [10, 'Rating must can not be more than 10']
    },
    averageCost: Number,
    logo: {
        type: String,
        default: 'no-logo.jpg'
    },
    profitable: {
        type: Boolean,
        default: true
    },
    valuationInDollars: {
        type: Number
    },
    industry: {
        type: String,
        default: 'tech'
    },
    fundingStage: {
        type: String
        
    },
    yearFounded: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    user : {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }



},{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});    

//create startup slug from the same 
StartupSchema.pre('save',function(next){
    this.slug = slugify(this.name,{lower:true});
    next();
}); 

//Geocode and create location field 
StartupSchema.pre('save',async function(next) {
    const loc = await geocoder.geocode(this.address);
    this.location = {
        type: 'Point',
        coordinates: [loc[0].longitude,loc[0].latitude],
        formattedAddress: loc[0].formattedAddress,
        street: loc[0].streetName, 
        city: loc[0].city, 
        state: loc[0].stateCode, 
        zipcode: loc[0].zipcode,
        country: loc[0].countryCode
    };
    this.address = undefined;
}); 


//cascade delete products when a startup is deleted 
StartupSchema.pre('remove',async function(next){
    console.log(`Products removed ${this._id}`); 
    await this.model('Product').deleteMany({startup: this._id});
    next();
});








// Reverse populate with virtual
StartupSchema.virtual('products',{
    ref: 'Product',
    localField: '_id' ,
    foreignField: 'startup',
    justOne:false
});




module.exports = mongoose.model('Startup',StartupSchema);