import React, { useState, useEffect } from 'react';
import { Typography, Container, List, ListItem, ListItemText, IconButton, Button, Box } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import EditIcon from '@mui/icons-material/Edit';

function CompanyProfilesPage() {
  const [profiles, setProfiles] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfiles = async () => {
      const profilesCollection = collection(db, 'companyProfiles');
      const profilesSnapshot = await getDocs(profilesCollection);
      const profilesList = profilesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProfiles(profilesList);
    };

    fetchProfiles();
  }, []);

  return (
    <Container maxWidth="md">
      <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mt: 2, mb: 2 }}>Back</Button>
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Company Profiles
        </Typography>
        <Button variant="contained" component={Link} to="/company-profiles/new" sx={{ mb: 2 }}>
          New Profile
        </Button>
      </Box>
      <List>
        {profiles.map((profile) => (
          <ListItem
            key={profile.id}
            secondaryAction={
              <IconButton edge="end" aria-label="edit" component={Link} to={`/company-profiles/edit/${profile.id}`}>
                <EditIcon />
              </IconButton>
            }
          >
            <ListItemText primary={profile.companyName} secondary={profile.companyAddress} />
          </ListItem>
        ))}
      </List>
    </Container>
  );
}

export default CompanyProfilesPage;
