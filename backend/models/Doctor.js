import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  speciality: {
    type: String,
    required: true
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  image: {
    type: String,
    default: ''
  },
  education: [{
    degree: String,
    institution: String,
    year: Number
  }],
  experience: [{
    hospital: String,
    position: String,
    duration: String
  }],
  fees: {
    type: Number,
    required: true
  },
  availability: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    slots: [{
      startTime: String,
      endTime: String,
      isBooked: {
        type: Boolean,
        default: false
      }
    }]
  }],
  languages: [String],
  rating: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
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

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor; 