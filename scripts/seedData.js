/**
 * Seed Script - Creates sample data for testing
 * Run with: npm run seed
 */

require('dotenv').config();

const mongoose = require('mongoose');
const config = require('../src/config/env');
const User = require('../src/models/User');
const FinancialRecord = require('../src/models/FinancialRecord');
const logger = require('../src/utils/logger');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongodbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    logger.info('Connected to MongoDB for seeding');

    // Clear existing data
    await User.deleteMany({});
    await FinancialRecord.deleteMany({});
    logger.info('Cleared existing data');

    // Create users
    const adminUser = await User.create({
      email: 'admin@example.com',
      password: 'Admin@123456',
      fullName: 'Admin User',
      role: 'admin',
      status: 'active'
    });

    const analystUser = await User.create({
      email: 'analyst@example.com',
      password: 'Analyst@123456',
      fullName: 'Analyst User',
      role: 'analyst',
      status: 'active'
    });

    const viewerUser = await User.create({
      email: 'viewer@example.com',
      password: 'Viewer@123456',
      fullName: 'Viewer User',
      role: 'viewer',
      status: 'active'
    });

    logger.info('Created 3 test users');

    // Create sample financial records
    const recordsData = [
      {
        userId: analystUser._id,
        amount: 5000,
        type: 'income',
        category: 'salary',
        description: 'Monthly salary',
        date: new Date(2024, 0, 5),
        createdBy: analystUser._id
      },
      {
        userId: analystUser._id,
        amount: 1500,
        type: 'expense',
        category: 'rent',
        description: 'Monthly rent',
        date: new Date(2024, 0, 1),
        createdBy: analystUser._id
      },
      {
        userId: analystUser._id,
        amount: 200,
        type: 'expense',
        category: 'food',
        description: 'Groceries',
        date: new Date(2024, 0, 10),
        createdBy: analystUser._id
      },
      {
        userId: analystUser._id,
        amount: 100,
        type: 'expense',
        category: 'transport',
        description: 'Uber rides',
        date: new Date(2024, 0, 15),
        createdBy: analystUser._id
      },
      {
        userId: analystUser._id,
        amount: 300,
        type: 'income',
        category: 'freelance',
        description: 'Freelance project',
        date: new Date(2024, 0, 20),
        createdBy: analystUser._id
      },
      {
        userId: analystUser._id,
        amount: 80,
        type: 'expense',
        category: 'entertainment',
        description: 'Movie tickets',
        date: new Date(2024, 0, 22),
        createdBy: analystUser._id
      },
      {
        userId: viewerUser._id,
        amount: 4000,
        type: 'income',
        category: 'salary',
        description: 'Salary payment',
        date: new Date(2024, 0, 5),
        createdBy: viewerUser._id
      },
      {
        userId: viewerUser._id,
        amount: 1200,
        type: 'expense',
        category: 'rent',
        description: 'Rent payment',
        date: new Date(2024, 0, 1),
        createdBy: viewerUser._id
      }
    ];

    await FinancialRecord.insertMany(recordsData);
    logger.info(`Created ${recordsData.length} sample financial records`);

    logger.info('Seeding completed successfully!');
    console.log(`
╔════════════════════════════════════════════════╗
║      Database Seeding Completed Successfully   ║
╠════════════════════════════════════════════════╣
║ Admin User:
║   Email: admin@example.com
║   Password: Admin@123456
║
║ Analyst User:
║   Email: analyst@example.com
║   Password: Analyst@123456
║
║ Viewer User:
║   Email: viewer@example.com
║   Password: Viewer@123456
╚════════════════════════════════════════════════╝
    `);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed', {
      message: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
};

seedData();
