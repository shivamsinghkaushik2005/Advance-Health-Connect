import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import connectDB from '../config/db.js';

// Import Health Camp model (to be created)
import HealthCamp from '../models/HealthCamp.js';

dotenv.config();

// Connect to database
connectDB();

// Dummy health camp data
const healthCamps = [
  {
    name: 'Free Diabetes & Cardiac Checkup Camp',
    organizer: 'Health Connect Foundation',
    description: 'A free health camp focused on diabetes and cardiac health. Get complete checkup including blood sugar test, ECG, and consultation with top specialists from Muzaffarpur.',
    location: {
      address: 'Saraiya Primary Health Center',
      city: 'Muzaffarpur',
      state: 'Bihar',
      pincode: '842002',
      coordinates: {
        latitude: 26.1197,
        longitude: 85.3910
      }
    },
    startDate: '2023-06-30T08:00:00Z',
    endDate: '2023-06-30T17:00:00Z',
    image: 'https://example.com/images/diabetes-camp.jpg',
    specialties: ['Cardiology', 'Endocrinology', 'General Medicine'],
    services: [
      { name: 'Blood Sugar Test', description: 'Free blood glucose test', isChargeable: false },
      { name: 'ECG', description: 'Electrocardiogram', isChargeable: false },
      { name: 'Cardiac Consultation', description: 'Consultation with cardiologist', isChargeable: false },
      { name: 'Medicine Distribution', description: 'Free medicines for underprivileged patients', isChargeable: false }
    ],
    registrationRequired: true,
    maxParticipants: 200,
    currentRegistrations: 78,
    status: 'upcoming'
  },
  {
    name: 'Mother & Child Health Camp',
    organizer: 'Sri Krishna Medical College & Hospital',
    description: 'Special health camp for mothers and children under 5 years. Services include vaccination, pediatric checkup, gynecological consultation, and nutritional guidance.',
    location: {
      address: 'SKMCH Community Hall',
      city: 'Muzaffarpur',
      state: 'Bihar',
      pincode: '842004',
      coordinates: {
        latitude: 26.1214,
        longitude: 85.4051
      }
    },
    startDate: '2023-07-10T09:00:00Z',
    endDate: '2023-07-11T16:00:00Z',
    image: 'https://example.com/images/mother-child-camp.jpg',
    specialties: ['Pediatrics', 'Gynecology', 'Nutrition'],
    services: [
      { name: 'Vaccination', description: 'Routine childhood vaccines', isChargeable: false },
      { name: 'Growth Monitoring', description: 'Child growth assessment', isChargeable: false },
      { name: 'Antenatal Check-up', description: 'Checkup for pregnant women', isChargeable: false },
      { name: 'Nutrition Counselling', description: 'Guidance on proper nutrition', isChargeable: false }
    ],
    registrationRequired: true,
    maxParticipants: 150,
    currentRegistrations: 42,
    status: 'upcoming'
  },
  {
    name: 'Eye Care & Cataract Surgery Camp',
    organizer: 'Health Connect in association with Netralaya Eye Hospital',
    description: 'Comprehensive eye checkup camp with free cataract surgery for eligible patients. Expert ophthalmologists from across Bihar will provide consultations and surgeries.',
    location: {
      address: 'Netralaya Eye Hospital, MG Road',
      city: 'Muzaffarpur',
      state: 'Bihar',
      pincode: '842001',
      coordinates: {
        latitude: 26.1225,
        longitude: 85.3905
      }
    },
    startDate: '2023-07-15T08:30:00Z',
    endDate: '2023-07-17T18:00:00Z',
    image: 'https://example.com/images/eye-camp.jpg',
    specialties: ['Ophthalmology'],
    services: [
      { name: 'Complete Eye Checkup', description: 'Comprehensive eye examination', isChargeable: false },
      { name: 'Cataract Screening', description: 'Screening for cataract', isChargeable: false },
      { name: 'Cataract Surgery', description: 'Free surgery for eligible patients', isChargeable: false },
      { name: 'Spectacles Distribution', description: 'Free spectacles for underprivileged', isChargeable: false }
    ],
    registrationRequired: true,
    maxParticipants: 300,
    currentRegistrations: 127,
    status: 'upcoming'
  },
  {
    name: 'General Health Check-up Camp',
    organizer: 'District Health Department',
    description: 'Multi-specialty health checkup covering general medicine, orthopedics, dentistry, and ENT. Open to all residents of Muzaffarpur district.',
    location: {
      address: 'District Hospital Compound',
      city: 'Muzaffarpur',
      state: 'Bihar',
      pincode: '842001',
      coordinates: {
        latitude: 26.1210,
        longitude: 85.3891
      }
    },
    startDate: '2023-08-05T08:00:00Z',
    endDate: '2023-08-05T17:00:00Z',
    image: 'https://example.com/images/general-camp.jpg',
    specialties: ['General Medicine', 'Orthopedics', 'Dentistry', 'ENT'],
    services: [
      { name: 'General Health Checkup', description: 'Basic health examination', isChargeable: false },
      { name: 'Blood Pressure Check', description: 'BP monitoring', isChargeable: false },
      { name: 'Dental Checkup', description: 'Basic dental examination', isChargeable: false },
      { name: 'ENT Examination', description: 'Ear, nose, throat check', isChargeable: false }
    ],
    registrationRequired: false,
    maxParticipants: 500,
    currentRegistrations: 0,
    status: 'upcoming'
  },
  {
    name: 'Women\'s Health Awareness Camp',
    organizer: 'Health Connect & Women\'s Welfare Association',
    description: 'Special camp focused on women\'s health issues including breast cancer screening, gynecological consultation, and health awareness sessions.',
    location: {
      address: 'Jubba Sahni Park Community Center',
      city: 'Muzaffarpur',
      state: 'Bihar',
      pincode: '842003',
      coordinates: {
        latitude: 26.1199,
        longitude: 85.3915
      }
    },
    startDate: '2023-08-20T09:00:00Z',
    endDate: '2023-08-20T16:00:00Z',
    image: 'https://example.com/images/womens-camp.jpg',
    specialties: ['Gynecology', 'Oncology', 'General Medicine'],
    services: [
      { name: 'Breast Cancer Screening', description: 'Early detection examination', isChargeable: false },
      { name: 'Gynecological Consultation', description: 'Consultation with gynecologist', isChargeable: false },
      { name: 'Anemia Detection', description: 'Hemoglobin testing', isChargeable: false },
      { name: 'Health Awareness Session', description: 'Educational session on women\'s health', isChargeable: false }
    ],
    registrationRequired: true,
    maxParticipants: 200,
    currentRegistrations: 35,
    status: 'upcoming'
  }
];

// Import health camps to database
const importData = async () => {
  try {
    // Clear existing data
    await HealthCamp.deleteMany();
    
    // Insert new data
    await HealthCamp.insertMany(healthCamps);
    
    console.log('Health Camps data imported!'.green.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

// Delete all data
const destroyData = async () => {
  try {
    await HealthCamp.deleteMany();
    
    console.log('Health Camps data destroyed!'.red.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

// Run function based on command line argument
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
} 