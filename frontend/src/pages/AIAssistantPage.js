import React, { useState } from 'react';
import { Button, Card, Container, TextField, Typography } from '@mui/material';
import { getPersonalizedGuidance, predictCaseChallenges, assistFormCompletion } from '../../backend/src/services/aiService';

const AIAssistantPage = () => {
  const [userProfile, setUserProfile] = useState({});
  const [caseDetails, setCaseDetails] = useState({});
  const [guidance, setGuidance] = useState('');
  const [challenges, setChallenges] = useState('');
  const [formData, setFormData] = useState({});
  const [formAssistance, setFormAssistance] = useState('');

  const handleGetGuidance = async () => {
    const guidance = await getPersonalizedGuidance(userProfile, caseDetails);
    setGuidance(guidance);
  };

  const handlePredictChallenges = async () => {
    const challenges = await predictCaseChallenges(caseDetails);
    setChallenges(challenges);
  };

  const handleAssistForm = async () => {
    const assistance = await assistFormCompletion(formData, caseDetails);
    setFormAssistance(assistance);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        AI Immigration Assistant
      </Typography>
      <Card style={{ padding: '1rem', margin: '1rem 0' }}>
        <TextField
          label="User Profile"
          fullWidth
          multiline
          rows={4}
          value={JSON.stringify(userProfile)}
          onChange={(e) => setUserProfile(JSON.parse(e.target.value))}
        />
        <TextField
          label="Case Details"
          fullWidth
          multiline
          rows={4}
          value={JSON.stringify(caseDetails)}
          onChange={(e) => setCaseDetails(JSON.parse(e.target.value))}
        />
        <Button variant="contained" onClick={handleGetGuidance} style={{ margin: '1rem 0' }}>
          Get Personalized Guidance
        </Button>
        <Typography>{guidance}</Typography>
      </Card>
      <Card style={{ padding: '1rem', margin: '1rem 0' }}>
        <Button variant="contained" onClick={handlePredictChallenges}>
          Predict Case Challenges
        </Button>
        <Typography>{challenges}</Typography>
      </Card>
      <Card style={{ padding: '1rem', margin: '1rem 0' }}>
        <TextField
          label="Form Data"
          fullWidth
          multiline
          rows={4}
          value={JSON.stringify(formData)}
          onChange={(e) => setFormData(JSON.parse(e.target.value))}
        />
        <Button variant="contained" onClick={handleAssistForm} style={{ margin: '1rem 0' }}>
          Assist Form Completion
        </Button>
        <Typography>{formAssistance}</Typography>
      </Card>
    </Container>
  );
};

export default AIAssistantPage;

