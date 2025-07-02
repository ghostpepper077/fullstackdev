const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Candidate = require('./models/Candidate');

// --- Database Connection ---
// Use the correct variable name from your .env file
const db = process.env.MONGO_URI; 

mongoose.connect(db)
  .then(() => {
    console.log('MongoDB connection successful!');
    seedDatabase();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// --- Seeding Function ---
const seedDatabase = async () => {
  try {
    await Candidate.deleteMany({});
    console.log('Existing candidates deleted.');

    const dataPath = path.join(__dirname, 'seed-data', 'candidates.json');
    const candidatesData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    await Candidate.insertMany(candidatesData);
    console.log('Dummy candidate data has been successfully imported! 🌱');

  } catch (error) {
    console.error('Error seeding the database:', error);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
};