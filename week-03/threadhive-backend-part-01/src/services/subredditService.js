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
  const subreddit = await Subreddit.findById(id);

  if (!subreddit ) {
    return null;
  }

  // get the threafds for the subreddit - make sure the author details are sent, not just the author id
  const threads = await Thread
                          .find({ subreddit : id })
                          .populate( 'author' )
                          .sort( { createdAt: -1 } );

  return {
    subreddit,
    threads
  };
};
