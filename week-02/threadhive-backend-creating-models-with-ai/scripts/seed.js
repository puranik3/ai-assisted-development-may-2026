import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import models
import User from '../models/User.js';
import Subreddit from '../models/Subreddit.js';
import Thread from '../models/Thread.js';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.cyan}═══ ${msg} ═══${colors.reset}`),
};

/**
 * Load JSON data from file
 */
function loadData(filename) {
  const filepath = path.join(__dirname, '../data', filename);
  try {
    const rawData = fs.readFileSync(filepath, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    log.error(`Failed to load ${filename}: ${error.message}`);
    throw error;
  }
}

/**
 * Connect to MongoDB
 */
async function connectToDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    log.info(`Connecting to MongoDB at ${mongoUri.split('@')[1] || 'localhost'}...`);

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    log.success('Connected to MongoDB');
  } catch (error) {
    log.error(`Database connection failed: ${error.message}`);
    throw error;
  }
}

/**
 * Clear all collections
 */
async function clearCollections() {
  log.section('Clearing Existing Data');

  try {
    const collections = [User, Subreddit, Thread];

    for (const model of collections) {
      const count = await model.countDocuments();
      if (count > 0) {
        await model.deleteMany({});
        log.success(`Cleared ${model.modelName} collection (${count} documents removed)`);
      } else {
        log.info(`${model.modelName} collection already empty`);
      }
    }
  } catch (error) {
    log.error(`Error clearing collections: ${error.message}`);
    throw error;
  }
}

/**
 * Seed users
 */
async function seedUsers() {
  log.section('Seeding Users');

  try {
    const usersData = loadData('users.json');

    // Convert string IDs to ObjectIds for proper referencing
    const users = usersData.map(user => ({
      ...user,
      _id: new mongoose.Types.ObjectId(user._id),
      createdAt: new Date(user.createdAt),
    }));

    const result = await User.insertMany(users);
    log.success(`Seeded ${result.length} users`);

    return result.map(u => u._id);
  } catch (error) {
    log.error(`Error seeding users: ${error.message}`);
    throw error;
  }
}

/**
 * Seed subreddits
 */
async function seedSubreddits(userIds) {
  log.section('Seeding Subreddits');

  try {
    const subredditsData = loadData('subreddits.json');

    // Convert string IDs to ObjectIds and reference actual user IDs
    const subreddits = subredditsData.map(subreddit => ({
      ...subreddit,
      _id: new mongoose.Types.ObjectId(subreddit._id),
      author: new mongoose.Types.ObjectId(subreddit.author),
      createdAt: new Date(subreddit.createdAt),
    }));

    const result = await Subreddit.insertMany(subreddits);
    log.success(`Seeded ${result.length} subreddits`);

    return result.map(s => s._id);
  } catch (error) {
    log.error(`Error seeding subreddits: ${error.message}`);
    throw error;
  }
}

/**
 * Seed threads
 */
async function seedThreads() {
  log.section('Seeding Threads');

  try {
    const threadsData = loadData('threads.json');

    // Convert string IDs to ObjectIds
    const threads = threadsData.map(thread => ({
      ...thread,
      _id: new mongoose.Types.ObjectId(thread._id),
      author: new mongoose.Types.ObjectId(thread.author),
      subreddit: new mongoose.Types.ObjectId(thread.subreddit),
      createdAt: new Date(thread.createdAt),
    }));

    const result = await Thread.insertMany(threads);
    log.success(`Seeded ${result.length} threads`);

    // Log thread distribution across subreddits
    const subredditMap = {};
    result.forEach(thread => {
      const subId = thread.subreddit.toString();
      subredditMap[subId] = (subredditMap[subId] || 0) + 1;
    });

    log.info(`Thread distribution: ${JSON.stringify(subredditMap)}`);

    return result.map(t => t._id);
  } catch (error) {
    log.error(`Error seeding threads: ${error.message}`);
    throw error;
  }
}

/**
 * Verify referential integrity
 */
async function verifyIntegrity() {
  log.section('Verifying Referential Integrity');

  try {
    // Check users count
    const userCount = await User.countDocuments();
    log.info(`Total users in database: ${userCount}`);

    // Check subreddits count and author references
    const subredditCount = await Subreddit.countDocuments();
    log.info(`Total subreddits in database: ${subredditCount}`);

    const subredditsWithoutAuthor = await Subreddit.countDocuments({ author: null });
    if (subredditsWithoutAuthor === 0) {
      log.success('All subreddits have valid author references');
    } else {
      log.warning(`Found ${subredditsWithoutAuthor} subreddits without author`);
    }

    // Check threads count and references
    const threadCount = await Thread.countDocuments();
    log.info(`Total threads in database: ${threadCount}`);

    const threadsWithoutAuthor = await Thread.countDocuments({ author: null });
    const threadsWithoutSubreddit = await Thread.countDocuments({ subreddit: null });

    if (threadsWithoutAuthor === 0) {
      log.success('All threads have valid author references');
    } else {
      log.warning(`Found ${threadsWithoutAuthor} threads without author`);
    }

    if (threadsWithoutSubreddit === 0) {
      log.success('All threads have valid subreddit references');
    } else {
      log.warning(`Found ${threadsWithoutSubreddit} threads without subreddit`);
    }

    // Verify ObjectId uniqueness
    const userIds = await User.distinct('_id');
    const uniqueUserIds = new Set(userIds.map(id => id.toString()));
    if (uniqueUserIds.size === userIds.length) {
      log.success(`All ${userIds.length} user IDs are unique`);
    } else {
      log.warning('Duplicate user IDs detected');
    }

  } catch (error) {
    log.error(`Error verifying integrity: ${error.message}`);
    throw error;
  }
}

/**
 * Print summary statistics
 */
async function printSummary() {
  log.section('Seeding Complete - Summary');

  try {
    const users = await User.countDocuments();
    const subreddits = await Subreddit.countDocuments();
    const threads = await Thread.countDocuments();

    console.log(`
  ${colors.cyan}Database Statistics:${colors.reset}
  ├─ Users:       ${users}
  ├─ Subreddits:  ${subreddits}
  └─ Threads:     ${threads}
    `);

    // Sample data display
    const sampleThread = await Thread.findOne()
      .populate('author', 'name email')
      .populate('subreddit', 'name');

    if (sampleThread) {
      log.info(`Sample thread: "${sampleThread.title}"`);
      log.info(`  Author: ${sampleThread.author.name}`);
      log.info(`  Subreddit: r/${sampleThread.subreddit.name}`);
      log.info(`  Votes: ${sampleThread.upvotes} up, ${sampleThread.downvotes} down`);
    }

  } catch (error) {
    log.error(`Error printing summary: ${error.message}`);
  }
}

/**
 * Main seed function
 */
async function seed() {
  try {
    log.section('ThreadHive Database Seeding');
    log.info(`Started at ${new Date().toISOString()}`);

    // Connect to database
    await connectToDatabase();

    // Clear existing data
    await clearCollections();

    // Seed data in proper order to maintain referential integrity
    await seedUsers();
    await seedSubreddits();
    await seedThreads();

    // Verify integrity and print summary
    await verifyIntegrity();
    await printSummary();

    log.success('\n✨ Database seeding completed successfully!\n');
  } catch (error) {
    log.error(`\n❌ Seeding failed: ${error.message}\n`);
    process.exit(1);
  } finally {
    // Disconnect from database
    try {
      await mongoose.disconnect();
      log.info('Disconnected from MongoDB');
    } catch (error) {
      log.error(`Error disconnecting: ${error.message}`);
    }
  }
}

// Run seed function
seed();
