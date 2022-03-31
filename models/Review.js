const mongoose = require('mongoose'); 

const ReviewSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: true,
        maxlength: 100 
    }, 
    text: {
        type: String, 
        required: [true,'Please add some text']
    }, 
    rating: {
        type: Number,
        min:1,
        max:10,
        required: [true,'Please add a rating between 1 and 10']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    startup: {
        type: mongoose.Schema.ObjectId, 
        ref: 'Startup', 
        required: true
    }, 
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }



}); 


//prevent a user from entering multiple reviews for a startup
ReviewSchema.index({startup:1,user:1},{unique:true}); 

//Static method to get average of ratings and save  
ReviewSchema.statics.getAverageRating = async function(startupId){
    
    const obj = await this.aggregate([
        {
            $match : {startup : startupId}
        }, 
        {
            $group : {
                _id: '$startup', 
                averageRating: { $avg: '$rating'}
            }
        }
    ]);
    try{
        await this.model('Startup').findByIdAndUpdate(startupId,{
            averageRating: obj[0].averageRating
        });

    }catch(err){
        console.error(err);
    }
}

//Call getAveragerating after save 
ReviewSchema.post('save',function(){
    this.constructor.getAverageRating(this.startup);

}); 

//Call getAveragerating before remove 
ReviewSchema.pre('remove',function(){
    this.constructor.getAverageRating(this.startup);

});


module.exports = mongoose.model('Review',ReviewSchema);