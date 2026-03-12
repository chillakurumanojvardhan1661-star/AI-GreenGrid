const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://kushalkarri1117_db_user:U0cHN82tHxzPY8sX@cluster0.0lvogxq.mongodb.net/ai_greengrid?appName=Cluster0';

console.log('Attempting to connect to MongoDB...');
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Successfully connected to MongoDB!');
        process.exit(0);
    })
    .catch(err => {
        console.error('Connection failed:', err);
        process.exit(1);
    });
