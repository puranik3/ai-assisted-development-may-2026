import mongoose from "mongoose";
import dotenv from "dotenv";

import User from "./models/User.js";
import Subreddit from "./models/Subreddit.js";
import Thread from "./models/Thread.js";

async function query1() {
    // Write code for Query 1 here
    // Find user by email diana@example.com
    const dianaUser = await User.findOne({
        email: "diana@example.com",
        // role: 'admin'
    });
    console.log("dianaUser", dianaUser);
}

async function query2() {
    // find -> [ {} ]
    // findOne -> {}
    // Write code for Query 2 here
    // Get threads in a subreddit programming
    const programmingSubreddit = await Subreddit.findOne({
        name: "programming",
    });
    // console.log( 'programmingSubreddit', programmingSubreddit );

    const programmingThreads = await Thread.find({
        subreddit: programmingSubreddit._id,
    });
    console.log("programmingThreads", programmingThreads);
}

async function query3() {
    // Write code for Query 3 here
    // Threads posted by a specific user Ethan
    const ethanUser = await User.findOne({
        name: "Ethan",
    });

    // console.log( 'ethanUser', ethanUser );

    const ethanThreads = await Thread.find({
        author: ethanUser._id,
    });
    console.log("ethanThreads", ethanThreads);
}

async function query4() {
    // Write code for Query 4 here
    // Users who posted threads
    const authors = await Thread.distinct("author");

    // console.log( 'authors', authors );

    // $in operator -> find documents where the value of a field matches any value in the specified array (authors array in this case)
    const usersWhoPostedThreads = await User.find({
        _id: { $in: authors },
    });
    console.log("usersWhoPostedThreads", usersWhoPostedThreads);
}

// more queries
async function query5() {
    // Write code for Query 5 here
    // Threads with at least 2 upvotes
    const threadsWithAtLeast2Upvotes = await Thread.find({
        upvotes: { $gte: 2 },
    });
    console.log("threadsWithAtLeast2Upvotes", threadsWithAtLeast2Upvotes);
}

async function query6() {
    // Threads created on or after January 1, 2024
    const threadsCreatedAfterJan2024 = await Thread.find({
        createdAt: { $gte: new Date("2024-01-01") },
    });
    console.log("threadsCreatedAfterJan2024", threadsCreatedAfterJan2024);
}

async function query7() {
    // Add a new thread (Create) Subreddit devops author Ethan
    const userEthan = await User.findOne({ name: "Ethan" });

    // Use Ctrl/Alt + right arrow (or) Cmd + right arrow to accept code suggestions word by word
    const newSubreddit = new Subreddit({
        name: "devops2",
        description: "A subreddit for DevOps enthusiasts",
        author: userEthan._id,
        createdAt: new Date(),
    });

    await newSubreddit.save();
}

async function query8() {
    // Update title of the thread "CI/CD tools comparison?"
    const threadToUpdate = await Thread.findOne({
        title: "CI/CD tools comparison?",
    });

    if (threadToUpdate) {
        threadToUpdate.title = "Updated CI/CD tools comparison?";
        await threadToUpdate.save();
    } else {
        console.log("Thread not found");
    }

    const result = await Thread.updateOne(
        { title: "Design systems in Figma" },
        { $set: { title: "Updated Design systems in Figma" } },
    );
    console.log("updateOne result:", result);
}

async function query9() {
    // Delete all threads by Ethan
    const userEthan = await User.findOne({ name: "Ethan" });

    if (userEthan) {
        const deleteResult = await Thread.deleteMany({ author: userEthan._id });
        console.log("deleteMany result:", deleteResult);
    } else {
        console.log("User Ethan not found");
    }
}

async function query10() {
    // Delete all subreddits and their associated threads
    const deleteSubredditsResult = await Subreddit.deleteMany({});
    console.log("deleteSubredditsResult:", deleteSubredditsResult);

    const deleteThreadsResult = await Thread.deleteMany({});
    console.log("deleteThreadsResult:", deleteThreadsResult);
}

async function query11() {
    // Retrieve the ids of all users who have posted threads, along with the number of threads they have posted
    const result = await Thread.aggregate(
        [
          {
            $group: {
              _id: "$author", // Group by author (user ID)
              threadCount: { $sum: 1 } // Count the number of threads for each author
             }
          }
        ]
    );

    console.log("Users with thread counts:", result);
}

async function query12() {
    // Find the author ID and thread count for the user who posted the most threads
    let result = await Thread.aggregate(
        [
          {
            $group: {
              _id: "$author", // Group by author (user ID)
              threadCount: { $sum: 1 } // Count the number of threads for each author
             }
          },
          {
            $sort: { threadCount: -1 } // Sort in descending order of thread count
          },
          {
            $limit: 1 // Limit to the top result (the user with the most threads)
          }
        ]
    );

    result = result[0];

    console.log("Users with thread max counts:", result);
}

async function runQueries() {
    // Uncomment the query you want to run
    // await query1();
    // await query2();
    // await query3();
    // await query4();
    // await query5();
    // await query6();
    // await query7();
    // await query8();
    // await query9();
    // await query10();
    // await query11();
    await query12();
    // more
}

async function main() {
    try {
        dotenv.config();
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");
        await runQueries();
    } catch (err) {
        console.error("DB connection failed:", err);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from DB");
    }
}

main();
