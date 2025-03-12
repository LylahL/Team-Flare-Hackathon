import React, { useState, useEffect } from 'react';
import ForumPost from '../components/ForumPost';
import { fetchForumPosts, fetchTopics, fetchUserProfile } from '../services/forumService';
import { Container, Typography, Grid, Tabs, Tab } from '@mui/material';
import { fetchForumPosts } from '../services/forumService';
import { Container, Typography, Grid } from '@mui/material';

const ForumPage = () => {
  const [posts, setPosts] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [userProfiles, setUserProfiles] = useState({});

  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const loadContent = async () => {
      const [posts, topics] = await Promise.all([
        fetchForumPosts(),
        fetchTopics(),
      ]);
      setPosts(posts);
      setTopics(topics);
      const userIds = [...new Set(posts.map(post => post.author))];
      const profiles = await fetchUserProfile(userIds);
      setUserProfiles(profiles);
    };
    loadContent();
  }, []);

  const handleTopicChange = (event, newValue) => setSelectedTopic(newValue);

    const loadPosts = async () => {
      const data = await fetchForumPosts();
      setPosts(data);
    };
    loadPosts();
  }, []);

  return (
    <Container maxWidth="lg">
      <Typography variant="h3" gutterBottom>
        Community Forum
      </Typography>
      <Tabs value={selectedTopic} onChange={handleTopicChange} variant="scrollable" scrollButtons="auto">
        {topics.map(topic => (
          <Tab key={topic.id} label={topic.name} value={topic.id} />
        ))}
        <Tab label="Forum Policy" value="policy" component="a" href="/forum-policy" />
      </Tabs>
      <Grid container spacing={3}>
        Community Forum
      </Typography>
      <Grid container spacing={3}>
        {posts.map((post) => (
          <Grid item xs={12} key={post.id}>
            <ForumPost post={post} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default ForumPage;

