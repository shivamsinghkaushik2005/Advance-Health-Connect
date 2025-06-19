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
  fees: {
    type: Number,
    required: true,
    default: 0
  },
  experience: [{
    hospital: String,
    position: String,
    duration: String
  }],
  education: [{
    degree: String,
    institution: String,
    year: String
  }],
  languages: [String],
  availability: [{
    day: String,
    slots: [{
      startTime: String,
      endTime: String
    }]
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numberOfReviews: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;