import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: {
    type: String,
    enum: ['patient', 'doctor', 'pharmacy', 'lab'],
    default: 'patient'
  },
  age: String,
  gender: String,
  address: String,
  pincode: String,
  profileImage: String,
  medicalHistory: [{
    condition: String,
    diagnosedDate: Date,
    medications: [String],
    notes: String
  }]
}, {
  timestamps: true
});

// ✅ Pre-save password hashing
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ✅ Method for login password check
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
