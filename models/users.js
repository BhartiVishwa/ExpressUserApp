const mongoose=require('mongoose');
const userschema=new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: Number, required: true },
  image: { type: String },
  createdAt: { type: Date,default: Date.now }
});
module.exports = mongoose.model('user',userschema)