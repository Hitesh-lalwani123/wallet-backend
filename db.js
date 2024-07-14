const mongoose = require('mongoose');
const mongoURI = 'mongodb+srv://georgelook2800:hm82we63@cluster0.wsh3nhc.mongodb.net/paytm';
mongoose.connect(mongoURI).then(()=>{
    console.log('Connected to db');
    
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    }
});

const accountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    balance: {
        type: Number,
        required: true
    }
})
const Account = mongoose.model('Account',accountSchema)
const User = mongoose.model('User',userSchema);

module.exports = {
    User,
    Account
}
