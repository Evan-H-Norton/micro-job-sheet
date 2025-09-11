import React, { useState, useEffect } from 'react';
import { Typography, Container, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';
import { useParams } from 'react-router-dom';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

function CompanyProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const docRef = doc(db, 'companyProfiles', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile({ id: docSnap.id, ...docSnap.data() });
      }
    };

    fetchProfile();
  }, [id]);

  if (!profile) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 2, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
          {profile.companyName}
        </Typography>
        <Typography variant="h6">Company Address:</Typography>
        <Typography gutterBottom>{profile.companyAddress}</Typography>
        <Typography variant="h6">Company Telephone:</Typography>
        <Typography gutterBottom>{profile.companyTelephone}</Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6">Contacts:</Typography>
        <List>
          {profile.contacts.map((contact, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={contact.name}
                secondary={`Email: ${contact.email} | Cellphone: ${contact.cellphone}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  );
}

export default CompanyProfilePage;
