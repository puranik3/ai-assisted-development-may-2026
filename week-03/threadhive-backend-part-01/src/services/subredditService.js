import Subreddit from "../models/Subreddit.js";
import Thread from "../models/Thread.js";

export const fetchAllSubreddits = async () => {
  const subreddits = await Subreddit.find();
  return subreddits;
};

export const createNewSubreddit = async (name, description, author) => {
  const exists = await Subreddit.findOne( { name } );

  if ( exists ) {
    return null;
  }

  // alternative is Subreddit.create()
  const newSubreddit = new Subreddit({
    // name: name,
    name,
    description,
    author
  });

  const createdSubreddit = await newSubreddit.save();
  return createdSubreddit;
};

export const fetchSubredditWithThreads = async (id) => {
  // YOUR CODE HERE
};
