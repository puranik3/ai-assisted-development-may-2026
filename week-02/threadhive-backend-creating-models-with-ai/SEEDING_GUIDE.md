# ThreadHive Database Seeding Guide

## Overview

This production-ready database seeding system populates your MongoDB Atlas database with realistic sample data for the ThreadHive application.

## Files Structure

```
/data/
├── users.json          # 10 sample users with unique ObjectIds
├── subreddits.json     # 6 subreddits (each with a user as author)
└── threads.json        # 20 threads distributed across subreddits

/scripts/
└── seed.js             # Main seeding script
```

## Sample Data Details

### Users (10 total)
- Realistic names and email addresses
- Hashed password placeholders
- CreatedAt timestamps spread across April 22 - May 19, 2026

### Subreddits (6 total)
- **programming** - General programming community
- **webdev** - Web development discussions
- **javascript** - JavaScript and Node.js focused
- **databases** - Database design and optimization
- **devops** - DevOps and CI/CD
- **learning** - Educational resources

Each subreddit has:
- Unique author reference (User ObjectId)
- Descriptive content
- CreatedAt timestamps

### Threads (20 total)
- Distributed across subreddits (3-4 per subreddit)
- Random authors from the user pool
- CreatedAt timestamps from May 16-June 3, 2026
- Realistic upvotes (45-234) and downvotes (2-15)
- Calculated voteCount field

## ObjectId Management

All ObjectIds are:
- **Unique**: Each document has a distinct, valid MongoDB ObjectId
- **Properly referenced**: Foreign keys correctly point to their parent documents
- **Consistent**: Same ID strings used in relationships across data files

### ObjectId Format
- Users: `507f1f77bcf86cd79943900X` (10 users)
- Subreddits: `607f1f77bcf86cd79944000X` (6 subreddits)
- Threads: `707f1f77bcf86cd79944100X` (20 threads)

## Prerequisites

1. **MongoDB Atlas** account with a database named `threadhive`
2. **.env file** in project root with:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/threadhive?retryWrites=true&w=majority
   ```
3. **Node.js** (v14+) and npm installed
4. **Dependencies** installed: `npm install`

## Running the Seed Script

### Method 1: Using npm script (recommended)
```bash
npm run seed
```

### Method 2: Direct node execution
```bash
node scripts/seed.js
```

## What the Script Does

The seeding script performs the following operations in sequence:

1. **Load Environment Variables** - Reads MONGODB_URI from .env file
2. **Connect to MongoDB** - Establishes connection to Atlas
3. **Clear Existing Data** - Removes all documents from User, Subreddit, and Thread collections
4. **Seed Users** - Inserts 10 user documents with proper ObjectIds
5. **Seed Subreddits** - Inserts 6 subreddits with valid author references
6. **Seed Threads** - Inserts 20 threads with author and subreddit references
7. **Verify Integrity** - Validates all referential relationships
8. **Print Summary** - Displays statistics and sample data
9. **Disconnect** - Closes database connection

## Console Output Example

```
═══ ThreadHive Database Seeding ═══
ℹ Started at 2026-06-21T10:30:00.000Z
ℹ Connecting to MongoDB at cluster0.mongodb.net...
✓ Connected to MongoDB

═══ Clearing Existing Data ═══
✓ Cleared User collection (10 documents removed)
✓ Cleared Subreddit collection (6 documents removed)
✓ Cleared Thread collection (20 documents removed)

═══ Seeding Users ═══
✓ Seeded 10 users

═══ Seeding Subreddits ═══
✓ Seeded 6 subreddits

═══ Seeding Threads ═══
✓ Seeded 20 threads
ℹ Thread distribution: {"607f1f77bcf86cd799440001":4,...}

═══ Verifying Referential Integrity ═══
ℹ Total users in database: 10
ℹ Total subreddits in database: 6
✓ All subreddits have valid author references
ℹ Total threads in database: 20
✓ All threads have valid author references
✓ All threads have valid subreddit references
✓ All 10 user IDs are unique

═══ Seeding Complete - Summary ═══

  Database Statistics:
  ├─ Users:       10
  ├─ Subreddits:  6
  └─ Threads:     20

ℹ Sample thread: "Best practices for async/await in JavaScript"
ℹ   Author: Sarah Chen
ℹ   Subreddit: r/javascript
ℹ   Votes: 145 up, 3 down

✓ Database seeding completed successfully!
```

## Customizing Sample Data

To modify the sample data:

### Add More Users
Edit `/data/users.json`:
```json
{
  "_id": "507f1f77bcf86cd79943900b",
  "name": "New User",
  "email": "new.user@example.com",
  "password": "hashed_password_11",
  "createdAt": "2026-05-22T10:00:00Z"
}
```

### Add More Threads
Edit `/data/threads.json` and ensure:
- Unique `_id` (following the pattern)
- Valid `author` reference (existing user ObjectId)
- Valid `subreddit` reference (existing subreddit ObjectId)

### Regenerate ObjectIds
If you need fresh ObjectIds, you can use Node.js:
```javascript
const mongoose = require('mongoose');
console.log(new mongoose.Types.ObjectId().toString());
```

## Error Handling

The script includes robust error handling:

- **Connection Errors**: Clear message if MONGODB_URI is missing or invalid
- **Data Loading Errors**: Specific file not found messages
- **Duplicate Key Errors**: Handled for unique fields (email, subreddit name)
- **Referential Integrity**: Validation after seeding

## Best Practices

1. **Always backup** your database before running seed.js
2. **Run on development/staging** first before production
3. **Modify sample data** to match your testing scenarios
4. **Verify timestamps** are appropriate for your use case
5. **Check vote counts** reflect realistic engagement levels

## Troubleshooting

### Error: "MONGODB_URI environment variable is not set"
- Ensure .env file exists in project root
- Check that MONGODB_URI is properly formatted
- Verify no spaces around the equals sign in .env

### Error: "MongoServerError: E11000 duplicate key error"
- Run the script again (it clears old data first)
- Or manually delete documents from collections in MongoDB Atlas

### Error: "Failed to load users.json"
- Ensure data files exist in `/data` folder
- Check JSON syntax is valid (no trailing commas)

### Script completes but collections are empty
- Verify database name matches MONGODB_URI
- Check MongoDB Atlas network access allows your IP
- Confirm credentials in connection string

## Performance Notes

- **Insertion Time**: ~500ms - 2 seconds depending on network
- **Data Size**: ~50KB total (10 users, 6 subreddits, 20 threads)
- **Indexes**: Script respects any existing indexes on collections
- **Scalability**: Can be modified to seed 1000s of records

## Next Steps

After seeding:

1. Query the data using MongoDB Compass or Atlas UI
2. Test your API endpoints with real data
3. Verify relationships work correctly in your application
4. Adjust sample data as needed for testing scenarios

## Questions or Issues?

If you encounter problems:
1. Check the error message carefully (included in console output)
2. Verify all prerequisites are met
3. Review the Troubleshooting section above
4. Check MongoDB Atlas cluster status
