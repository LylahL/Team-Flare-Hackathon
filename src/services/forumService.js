// Function to fetch forum posts from a backend service
export const fetchTopics = async () => {
  try {
    const response = await fetch('https://api.example.com/forum/topics');
    if (!response.ok) throw new Error('Failed to fetch topics');
    return await response.json();
  } catch (error) {
    console.error('Error fetching topics:', error);
    throw error;
  }
};

export const fetchUserProfile = async (userIds) => {
  try {
    const response = await fetch('https://api.example.com/users/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIds })
    });
    if (!response.ok) throw new Error('Failed to fetch user profiles');
    return await response.json();
  } catch (error) {
    console.error('Error fetching user profiles:', error);
    throw error;
  }
};

export const handlePostInteraction = async (postId, action) => {
  try {
    const response = await fetch('https://api.example.com/forum/interact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, action })
    });
    if (!response.ok) throw new Error('Post interaction failed');
    return await response.json();
  } catch (error) {
    console.error('Error handling post interaction:', error);
    throw error;
  }
};

export const fetchForumPosts = async () => {
    try {
        // Fetch data from the backend service
        const response = await fetch('https://api.example.com/forum/posts');
        if (!response.ok) {
            throw new Error('Failed to fetch forum posts');
        }

        // Parse the response as JSON
        const data = await response.json();

        // Return the list of posts with required properties
        return data.map(post => ({
            id: post.id,
            title: post.title,
            content: post.content,
            author: post.author,
            timestamp: post.timestamp
        }));
    } catch (error) {
        console.error('Error fetching forum posts:', error);
        throw error;
    }
};

