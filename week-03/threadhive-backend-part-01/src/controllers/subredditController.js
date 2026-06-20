import {
  fetchAllSubreddits,
  createNewSubreddit,
  fetchSubredditWithThreads,
} from "../services/subredditService.js";

export const getAllSubreddits = async (req, res) => {
  try {
    const subreddits = await fetchAllSubreddits();

    // send subreddits
    res.status( 200 ).json({
      success: true,
      message: `Successfully fetched subreddits!!!!!`,
      data: subreddits
    });
  } catch( error ) {
    // send error
    res.status( 500 ).json({
      success: false,
      message: `Internal Server Error`
    });
  }
};

export const createSubreddit = async (req, res) => {
  const { name, description, author } = req.body;

  // validating request body
  if ( !name || !description || !author ) {
    return res.status( 400 ).json({
      success: false,
      message: 'Name, description and author are required. Something is missing'
    });
  }

  try {
    const createdSubreddit = await createNewSubreddit( name, description, author);

    if ( createdSubreddit === null ) {
      return res.status( 409 ).json({
        success: false,
        message: `Subreddit with name ${name} already exists. Please choose a different name.`
      });
    }

    return res.status( 200 ).json({
      success: true,
      message: `Subreddit created successfully!`,
      data: createdSubreddit
    });
  } catch( error ) {
    // Assume internal server error - could also be duplicate key error, validation errors
    return res.status( 500 ).json({
      success: false,
      message: `Internal Server Error`
    })
  }
};

export const getSubredditWithThreads = async (req, res) => {
  // YOUR CODE HERE
};
