import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, List, ListItem, ListItemText } from '@mui/material';

// This is the component that your App.js will render at the "/create-criteria" route.
export default function CreateCriteria() {
  // State to hold the list of criteria and the current input value
  const [criteriaList, setCriteriaList] = useState(['Technical Skills', 'Team Fit']);
  const [newCriterion, setNewCriterion] = useState('');

  /**
   * This is the function that adds a new criterion.
   * It's declared here and used in the handleSubmit function below.
   */
  const handleCreateCriterion = (criterionName) => {
    if (criterionName.trim()) {
      setCriteriaList([...criteriaList, criterionName.trim()]);
      setNewCriterion(''); // Clear the input field after adding
    }
  };

  /**
   * Handles the form submission.
   */
  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent page reload
    handleCreateCriterion(newCriterion); // This is where the function is used
  };

  return (
    <Paper sx={{ p: 4, maxWidth: '800px', margin: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Manage Shortlisting Criteria
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Add or remove the criteria used to evaluate candidates.
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          label="New Criterion Name"
          value={newCriterion}
          onChange={(e) => setNewCriterion(e.target.value)}
          placeholder="e.g., 'Communication Skills'"
        />
        <Button type="submit" variant="contained" sx={{ whiteSpace: 'nowrap' }}>
          Add Criterion
        </Button>
      </Box>

      <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
        Current Criteria:
      </Typography>
      <List>
        {criteriaList.map((criterion, index) => (
          <ListItem key={index} divider>
            <ListItemText primary={criterion} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}