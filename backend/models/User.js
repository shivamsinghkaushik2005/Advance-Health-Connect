import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    unique: true,
    sparse: true
  },
  phoneNumber: { 
    type: String, 
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true
  },
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
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Password encryption middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    console.error('Error hashing password:', error);
    next(error);
  }
});

// Method to check if entered password matches stored password
userSchema.methods.matchPassword = async function(enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
};

const User = mongoose.model('User', userSchema);

export default User; 