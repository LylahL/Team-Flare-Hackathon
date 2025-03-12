import React from 'react';

const ForumPolicyPage = () => {
  return (
    <div className="forum-policy-page">
      <h1>Forum Usage Policy</h1>
      <section>
        <h2>Content Standards</h2>
        <ul>
          <li>Posts must be relevant to the forum's topics</li>
          <li>No spam or promotional content</li>
          <li>No illegal or harmful content</li>
          <li>Respect intellectual property rights</li>
        </ul>
      </section>

      <section>
        <h2>User Behavior</h2>
        <ul>
          <li>Be respectful to all members</li>
          <li>No harassment or hate speech</li>
          <li>Maintain a professional tone</li>
          <li>No inappropriate language</li>
        </ul>
      </section>

      <section>
        <h2>Moderation Policies</h2>
        <ul>
          <li>Moderators may edit or remove inappropriate content</li>
          <li>Users may report problematic posts</li>
          <li>Decisions of moderators are final</li>
          <li>Transparent moderation procedures</li>
        </ul>
      </section>

      <section>
        <h2>Consequences for Violations</h2>
        <ul>
          <li>Warning for first-time offenses</li>
          <li>Temporary suspension for repeated violations</li>
          <li>Permanent ban for severe violations</li>
          <li>Appeal process available</li>
        </ul>
      </section>
    </div>
  );
};

export default ForumPolicyPage;

