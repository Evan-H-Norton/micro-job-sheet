import React, { useState, useEffect } from 'react';
import { Typography, Container, TextField, Button, Box, IconButton } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { doc, getDoc, setDoc, addDoc, collection } from 'firebase/firestore';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

function EditCompanyProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyTelephone, setCompanyTelephone] = useState('');
  const [contacts, setContacts] = useState([{ name: '', email: '', cellphone: '' }]);

  useEffect(() => {
    if (id) {
      const fetchProfile = async () => {
        const docRef = doc(db, 'companyProfiles', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCompanyName(data.companyName);
          setCompanyAddress(data.companyAddress);
          setCompanyTelephone(data.companyTelephone);
          setContacts(data.contacts);
        }
      };
      fetchProfile();
    }
  }, [id]);

  const handleContactChange = (index, event) => {
    const values = [...contacts];
    values[index][event.target.name] = event.target.value;
    setContacts(values);
  };

  const handleAddContact = () => {
    setContacts([...contacts, { name: '', email: '', cellphone: '' }]);
  };

  const handleRemoveContact = (index) => {
    const values = [...contacts];
    values.splice(index, 1);
    setContacts(values);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const profileData = { companyName, companyAddress, companyTelephone, contacts };
    if (id) {
      const docRef = doc(db, 'companyProfiles', id);
      await setDoc(docRef, profileData);
    } else {
      await addDoc(collection(db, 'companyProfiles'), profileData);
    }
    navigate('/company-profiles');
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        {id ? 'Edit Company Profile' : 'New Company Profile'}
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Company Name"
          fullWidth
          margin="normal"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />
        <TextField
          label="Company Address"
          fullWidth
          margin="normal"
          value={companyAddress}
          onChange={(e) => setCompanyAddress(e.target.value)}
        />
        <TextField
          label="Company Telephone"
          fullWidth
          margin="normal"
          value={companyTelephone}
          onChange={(e) => setCompanyTelephone(e.target.value)}
        />
        <Typography variant="h6" component="h2" gutterBottom sx={{ mt: 2 }}>
          Contacts
        </Typography>
        {contacts.map((contact, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TextField
              label="Name"
              name="name"
              value={contact.name}
              onChange={(e) => handleContactChange(index, e)}
              sx={{ mr: 1 }}
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={contact.email}
              onChange={(e) => handleContactChange(index, e)}
              sx={{ mr: 1 }}
            />
            <TextField
              label="Cellphone"
              name="cellphone"
              value={contact.cellphone}
              onChange={(e) => handleContactChange(index, e)}
              sx={{ mr: 1 }}
            />
            <IconButton onClick={() => handleRemoveContact(index)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddContact}
          sx={{ mb: 2 }}
        >
          Add Contact
        </Button>
        <Box sx={{ mt: 2 }}>
          <Button type="submit" variant="contained" color="primary">
            {id ? 'Save Changes' : 'Create Profile'}
          </Button>
        </Box>
      </form>
    </Container>
  );
}

export default EditCompanyProfilePage;
