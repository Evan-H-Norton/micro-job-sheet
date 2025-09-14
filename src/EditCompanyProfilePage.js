import React, { useState, useEffect } from 'react';
import { Typography, Container, TextField, Button, Box, IconButton } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { doc, getDoc, setDoc, addDoc, collection } from 'firebase/firestore';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import toast from 'react-hot-toast';

function EditCompanyProfilePage({ viewMode = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyTelephone, setCompanyTelephone] = useState('');
  const [contacts, setContacts] = useState([{ name: '', email: '', cellphone: '' }]);

  const pageTitle = viewMode ? 'Company Profile' : (id ? 'Edit Company Profile' : 'New Company Profile');

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

    const promise = id
      ? setDoc(doc(db, 'companyProfiles', id), profileData)
      : addDoc(collection(db, 'companyProfiles'), profileData);

    toast.promise(promise, {
      loading: id ? 'Saving changes...' : 'Creating profile...',
      success: () => {
        navigate('/company-profiles');
        return id ? 'Profile updated successfully!' : 'Profile created successfully!';
      },
      error: (err) => `Failed to save profile: ${err.toString()}`,
    });
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
        <Button variant="outlined" onClick={() => navigate(-1)}>Back</Button>
      </Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
        {pageTitle}
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          id="companyName"
          label="Company Name"
          fullWidth
          margin="normal"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          disabled={viewMode}
        />
        <TextField
          id="companyAddress"
          label="Company Address"
          fullWidth
          margin="normal"
          value={companyAddress}
          onChange={(e) => setCompanyAddress(e.target.value)}
          disabled={viewMode}
        />
        <TextField
          id="companyTelephone"
          label="Company Telephone"
          fullWidth
          margin="normal"
          value={companyTelephone}
          onChange={(e) => setCompanyTelephone(e.target.value)}
          disabled={viewMode}
        />
        <Typography variant="h6" component="h2" gutterBottom sx={{ mt: 2 }}>
          Contacts
        </Typography>
        {contacts.map((contact, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TextField
              id={`contact-name-${index}`}
              label="Name"
              name="name"
              value={contact.name}
              onChange={(e) => handleContactChange(index, e)}
              sx={{ mr: 1 }}
              disabled={viewMode}
            />
            <TextField
              id={`contact-email-${index}`}
              label="Email"
              name="email"
              type="email"
              value={contact.email}
              onChange={(e) => handleContactChange(index, e)}
              sx={{ mr: 1 }}
              disabled={viewMode}
            />
            <TextField
              id={`contact-cellphone-${index}`}
              label="Cellphone"
              name="cellphone"
              value={contact.cellphone}
              onChange={(e) => handleContactChange(index, e)}
              sx={{ mr: 1 }}
              disabled={viewMode}
            />
            {!viewMode && (
              <IconButton onClick={() => handleRemoveContact(index)}>
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
        ))}
        {!viewMode && (
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddContact}
            sx={{ mb: 2 }}
          >
            Add Contact
          </Button>
        )}
        {!viewMode && (
          <Box sx={{ mt: 2 }}>
            <Button type="submit" variant="contained" color="primary">
              {id ? 'Save Changes' : 'Create Profile'}
            </Button>
          </Box>
        )}
      </form>
    </Container>
  );
}

export default EditCompanyProfilePage;
