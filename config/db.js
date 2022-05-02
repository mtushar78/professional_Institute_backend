const mongoose = require('mongoose');

const connectionDB = async ()=>{
    const connection = await mongoose.connect(process.env.MONGO_URL,{
        useNewUrlParser: true,
        useUnifiedTopology:true
    });
    console.log(`MongoDB Connected ${connection.connection.host}`);
};
module.exports= connectionDB;