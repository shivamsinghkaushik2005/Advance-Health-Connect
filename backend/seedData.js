import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Doctor from './models/Doctor.js';
import bcrypt from 'bcryptjs';
import connectDB from './config/db.js';

dotenv.config();

const seedDoctors = async () => {
  try {
    // Connect to the database
    await connectDB();
    
    // Clear existing doctors data
    await Doctor.deleteMany({});
    console.log('Deleted existing doctor records');
    
    // Create doctor users
    const doctors = [
      {
        name: 'Dr. Rajesh Kumar',
        email: 'dr.rajesh@example.com',
        password: await bcrypt.hash('password123', 10),
        phoneNumber: '9876543201',
        userType: 'doctor',
        address: 'Brahampura, Muzaffarpur, Bihar',
        gender: 'male',
        dateOfBirth: new Date('1980-05-15')
      },
      {
        name: 'Dr. Priya Singh',
        email: 'dr.priya@example.com',
        password: await bcrypt.hash('password123', 10),
        phoneNumber: '9876543202',
        userType: 'doctor',
        address: 'Motijheel, Muzaffarpur, Bihar',
        gender: 'female',
        dateOfBirth: new Date('1985-03-22')
      },
      {
        name: 'Dr. Amit Verma',
        email: 'dr.amit@example.com',
        password: await bcrypt.hash('password123', 10),
        phoneNumber: '9876543203',
        userType: 'doctor',
        address: 'Juran Chapra, Muzaffarpur, Bihar',
        gender: 'male',
        dateOfBirth: new Date('1978-11-10')
      },
      {
        name: 'Dr. Neha Sharma',
        email: 'dr.neha@example.com',
        password: await bcrypt.hash('password123', 10),
        phoneNumber: '9876543204',
        userType: 'doctor',
        address: 'Mithanpura, Muzaffarpur, Bihar',
        gender: 'female',
        dateOfBirth: new Date('1982-07-25')
      },
      {
        name: 'Dr. Sunil Gupta',
        email: 'dr.sunil@example.com',
        password: await bcrypt.hash('password123', 10),
        phoneNumber: '9876543205',
        userType: 'doctor',
        address: 'Saraiyaganj, Muzaffarpur, Bihar',
        gender: 'male',
        dateOfBirth: new Date('1975-09-18')
      }
    ];

    // Insert doctor users
    const createdUsers = await User.insertMany(doctors);
    console.log(`Created ${createdUsers.length} doctor users`);
    
    // Create doctor profiles
    const doctorProfiles = [
      {
        userId: createdUsers[0]._id,
        speciality: 'Cardiology',
        licenseNumber: 'MCI12345',
        education: [
          { degree: 'MBBS', institution: 'AIIMS Patna', year: 2005 },
          { degree: 'MD (Cardiology)', institution: 'PGIMER Chandigarh', year: 2010 }
        ],
        experience: [
          { hospital: 'SKMCH Muzaffarpur', position: 'Senior Cardiologist', duration: '5 years' },
          { hospital: 'Apollo Hospital, Patna', position: 'Consultant', duration: '3 years' }
        ],
        fees: 800,
        availability: [
          {
            day: 'Monday',
            slots: [
              { startTime: '09:00', endTime: '09:30', isBooked: false },
              { startTime: '09:30', endTime: '10:00', isBooked: false },
              { startTime: '10:00', endTime: '10:30', isBooked: false },
              { startTime: '10:30', endTime: '11:00', isBooked: false }
            ]
          },
          {
            day: 'Wednesday',
            slots: [
              { startTime: '16:00', endTime: '16:30', isBooked: false },
              { startTime: '16:30', endTime: '17:00', isBooked: false },
              { startTime: '17:00', endTime: '17:30', isBooked: false },
              { startTime: '17:30', endTime: '18:00', isBooked: false }
            ]
          },
          {
            day: 'Friday',
            slots: [
              { startTime: '14:00', endTime: '14:30', isBooked: false },
              { startTime: '14:30', endTime: '15:00', isBooked: false },
              { startTime: '15:00', endTime: '15:30', isBooked: false },
              { startTime: '15:30', endTime: '16:00', isBooked: false }
            ]
          }
        ],
        languages: ['Hindi', 'English'],
        rating: 4.7,
        reviewCount: 56,
        isVerified: true,
        status: 'approved'
      },
      {
        userId: createdUsers[1]._id,
        speciality: 'Gynecology',
        licenseNumber: 'MCI23456',
        education: [
          { degree: 'MBBS', institution: 'Patna Medical College', year: 2008 },
          { degree: 'MS (Gynecology)', institution: 'KGMU Lucknow', year: 2013 }
        ],
        experience: [
          { hospital: 'Sadar Hospital Muzaffarpur', position: 'Senior Gynecologist', duration: '6 years' },
          { hospital: 'Private Clinic', position: 'Consultant', duration: '4 years' }
        ],
        fees: 600,
        availability: [
          {
            day: 'Tuesday',
            slots: [
              { startTime: '10:00', endTime: '10:30', isBooked: false },
              { startTime: '10:30', endTime: '11:00', isBooked: false },
              { startTime: '11:00', endTime: '11:30', isBooked: false },
              { startTime: '11:30', endTime: '12:00', isBooked: false }
            ]
          },
          {
            day: 'Thursday',
            slots: [
              { startTime: '16:00', endTime: '16:30', isBooked: false },
              { startTime: '16:30', endTime: '17:00', isBooked: false },
              { startTime: '17:00', endTime: '17:30', isBooked: false },
              { startTime: '17:30', endTime: '18:00', isBooked: false }
            ]
          },
          {
            day: 'Saturday',
            slots: [
              { startTime: '09:00', endTime: '09:30', isBooked: false },
              { startTime: '09:30', endTime: '10:00', isBooked: false },
              { startTime: '10:00', endTime: '10:30', isBooked: false },
              { startTime: '10:30', endTime: '11:00', isBooked: false }
            ]
          }
        ],
        languages: ['Hindi', 'English'],
        rating: 4.8,
        reviewCount: 72,
        isVerified: true,
        status: 'approved'
      },
      {
        userId: createdUsers[2]._id,
        speciality: 'Orthopedics',
        licenseNumber: 'MCI34567',
        education: [
          { degree: 'MBBS', institution: 'IGIMS Patna', year: 2006 },
          { degree: 'MS (Orthopedics)', institution: 'AIIMS Delhi', year: 2011 }
        ],
        experience: [
          { hospital: 'SKMCH Muzaffarpur', position: 'Senior Orthopedic Surgeon', duration: '4 years' },
          { hospital: 'Medanta Hospital, Delhi', position: 'Consultant', duration: '3 years' }
        ],
        fees: 700,
        availability: [
          {
            day: 'Monday',
            slots: [
              { startTime: '14:00', endTime: '14:30', isBooked: false },
              { startTime: '14:30', endTime: '15:00', isBooked: false },
              { startTime: '15:00', endTime: '15:30', isBooked: false },
              { startTime: '15:30', endTime: '16:00', isBooked: false }
            ]
          },
          {
            day: 'Wednesday',
            slots: [
              { startTime: '10:00', endTime: '10:30', isBooked: false },
              { startTime: '10:30', endTime: '11:00', isBooked: false },
              { startTime: '11:00', endTime: '11:30', isBooked: false },
              { startTime: '11:30', endTime: '12:00', isBooked: false }
            ]
          },
          {
            day: 'Saturday',
            slots: [
              { startTime: '16:00', endTime: '16:30', isBooked: false },
              { startTime: '16:30', endTime: '17:00', isBooked: false },
              { startTime: '17:00', endTime: '17:30', isBooked: false },
              { startTime: '17:30', endTime: '18:00', isBooked: false }
            ]
          }
        ],
        languages: ['Hindi', 'English'],
        rating: 4.6,
        reviewCount: 48,
        isVerified: true,
        status: 'approved'
      },
      {
        userId: createdUsers[3]._id,
        speciality: 'Pediatrics',
        licenseNumber: 'MCI45678',
        education: [
          { degree: 'MBBS', institution: 'Government Medical College Muzaffarpur', year: 2009 },
          { degree: 'MD (Pediatrics)', institution: 'BHU Varanasi', year: 2014 }
        ],
        experience: [
          { hospital: 'SKMCH Muzaffarpur', position: 'Pediatrician', duration: '5 years' },
          { hospital: 'Child Care Clinic', position: 'Director', duration: '3 years' }
        ],
        fees: 500,
        availability: [
          {
            day: 'Tuesday',
            slots: [
              { startTime: '14:00', endTime: '14:30', isBooked: false },
              { startTime: '14:30', endTime: '15:00', isBooked: false },
              { startTime: '15:00', endTime: '15:30', isBooked: false },
              { startTime: '15:30', endTime: '16:00', isBooked: false }
            ]
          },
          {
            day: 'Thursday',
            slots: [
              { startTime: '10:00', endTime: '10:30', isBooked: false },
              { startTime: '10:30', endTime: '11:00', isBooked: false },
              { startTime: '11:00', endTime: '11:30', isBooked: false },
              { startTime: '11:30', endTime: '12:00', isBooked: false }
            ]
          },
          {
            day: 'Sunday',
            slots: [
              { startTime: '09:00', endTime: '09:30', isBooked: false },
              { startTime: '09:30', endTime: '10:00', isBooked: false },
              { startTime: '10:00', endTime: '10:30', isBooked: false },
              { startTime: '10:30', endTime: '11:00', isBooked: false }
            ]
          }
        ],
        languages: ['Hindi', 'English', 'Bhojpuri'],
        rating: 4.9,
        reviewCount: 86,
        isVerified: true,
        status: 'approved'
      },
      {
        userId: createdUsers[4]._id,
        speciality: 'General Medicine',
        licenseNumber: 'MCI56789',
        education: [
          { degree: 'MBBS', institution: 'Darbhanga Medical College', year: 2004 },
          { degree: 'MD (Medicine)', institution: 'Patna Medical College', year: 2009 }
        ],
        experience: [
          { hospital: 'Sadar Hospital Muzaffarpur', position: 'General Physician', duration: '7 years' },
          { hospital: 'Private Practice', position: 'Consultant', duration: '5 years' }
        ],
        fees: 400,
        availability: [
          {
            day: 'Monday',
            slots: [
              { startTime: '16:00', endTime: '16:30', isBooked: false },
              { startTime: '16:30', endTime: '17:00', isBooked: false },
              { startTime: '17:00', endTime: '17:30', isBooked: false },
              { startTime: '17:30', endTime: '18:00', isBooked: false }
            ]
          },
          {
            day: 'Thursday',
            slots: [
              { startTime: '14:00', endTime: '14:30', isBooked: false },
              { startTime: '14:30', endTime: '15:00', isBooked: false },
              { startTime: '15:00', endTime: '15:30', isBooked: false },
              { startTime: '15:30', endTime: '16:00', isBooked: false }
            ]
          },
          {
            day: 'Saturday',
            slots: [
              { startTime: '10:00', endTime: '10:30', isBooked: false },
              { startTime: '10:30', endTime: '11:00', isBooked: false },
              { startTime: '11:00', endTime: '11:30', isBooked: false },
              { startTime: '11:30', endTime: '12:00', isBooked: false }
            ]
          }
        ],
        languages: ['Hindi', 'English', 'Maithili'],
        rating: 4.5,
        reviewCount: 64,
        isVerified: true,
        status: 'approved'
      }
    ];
    
    // Insert doctor profiles
    const createdDoctors = await Doctor.insertMany(doctorProfiles);
    console.log(`Created ${createdDoctors.length} doctor profiles`);
    
    console.log('Seed data added successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Run the seed function
seedDoctors(); 