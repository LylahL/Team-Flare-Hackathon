import React from 'react';
import { Card, CardContent, Typography, Button, Avatar, IconButton, Stack } from '@mui/material';
import { ThumbUp, ThumbDown } from '@mui/icons-material';

const ForumPost = ({ post }) => {
  const { title, content, author, timestamp, likes, dislikes, replies, userProfile } = post;

  const handleLike = async () => await handlePostInteraction('like');
  const handleDislike = async () => await handlePostInteraction('dislike');

  return (
    <Card>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2}>
          {userProfile?.avatar && (<Avatar src={userProfile.avatar} />)}
          <div>
            <Typography variant="h5" component="div">
              {title}
            </Typography>
            <Typography variant="caption" display="block">
              Posted by {userProfile?.name || author} on {new Date(timestamp).toLocaleString()}
            </Typography>
          </div>
        </Stack>

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="div">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {content}
        </Typography>
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          Posted by {author} on {new Date(timestamp).toLocaleString()}
        </Typography>
        <Button variant="text">Reply</Button>
      </CardContent>
    </Card>
  );
};

export default ForumPost;

