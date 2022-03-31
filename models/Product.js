const mongoose = require('mongoose'); 
const Startup = require('./Startup');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required:[true,'Please add a product name']
    },
    description: {
        type: String, 
        required: [true,'Please add a description'] 
    },
    costOfPremiumInINR: {
        type: Number, 
        required: [true,'Please add a premium cost']
    },
    productStage : {
        type: String, 
        required: [true,'Please add the stage of product'], 
        enum: ['alpha','beta','stable']
    },
    freemiumAvailable: {
        type: Boolean, 
        default: false 
    }, 
    createdAt: {
        type: Date,
        default: Date.now
    }, 
    startup : {
        type: mongoose.Schema.ObjectId, 
        ref: 'Startup',
        required: true 
    },
    user : {
        type: mongoose.Schema.ObjectId, 
        ref: 'User',
        required: true 
    }
});   


//Static method to get average of product costOfPremiumInINRs  
ProductSchema.statics.getAverageCost = async function(startupId){
    
    const obj = await this.aggregate([
        {
            $match : {startup : startupId}
        }, 
        {
            $group : {
                _id: '$startup', 
                averageCost: { $avg: '$costOfPremiumInINR'}
            }
        }
    ]);
    try{
        await this.model('Startup').findByIdAndUpdate(startupId,{
            averageCost: Math.ceil(obj[0].averageCost/10)*10
        });

    }catch(err){
        console.error(err);
    }
}

//Call getAverageCost after save 
ProductSchema.post('save',function(){
    this.constructor.getAverageCost(this.startup);

}); 

//Call getAverageCost before remove 
ProductSchema.pre('remove',function(){
    this.constructor.getAverageCost(this.startup);

});

module.exports = mongoose.model('Product', ProductSchema); 
