import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  isChargeable: {
    type: Boolean,
    default: false
  },
  fee: {
    type: Number,
    default: 0
  }
});

const locationSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    required: true
  },
  coordinates: {
    latitude: {
      type: Number
    },
    longitude: {
      type: Number
    }
  }
});

const healthCampSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  organizer: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: locationSchema,
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  image: {
    type: String,
    default: '/images/camps/default.jpg'
  },
  specialties: [String],
  services: [serviceSchema],
  doctors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  }],
  registrationRequired: {
    type: Boolean,
    default: true
  },
  maxParticipants: {
    type: Number,
    default: 100
  },
  currentRegistrations: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
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

// Add virtual for remaining capacity
healthCampSchema.virtual('remainingCapacity').get(function() {
  return this.maxParticipants - this.currentRegistrations;
});

// Add virtual for registration status
healthCampSchema.virtual('isRegistrationOpen').get(function() {
  return this.registrationRequired && this.status === 'upcoming' && this.currentRegistrations < this.maxParticipants;
});

// Add method to check if camp is active
healthCampSchema.methods.isActive = function() {
  return ['upcoming', 'ongoing'].includes(this.status);
};

const HealthCamp = mongoose.model('HealthCamp', healthCampSchema);

export default HealthCamp; 