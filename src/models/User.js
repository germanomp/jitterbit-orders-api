const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');


const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
}, { versionKey: false });


userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});


userSchema.methods.comparePassword = async function (senha) {
  return bcrypt.compare(senha, this.password);
};


module.exports = mongoose.model('User', userSchema);

