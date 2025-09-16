import React from 'react';
import { Typography, TextField, Button, Box, IconButton } from '@mui/material';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import DeleteIcon from '@mui/icons-material/Delete';

function CompanyProfileForm({ 
    companyName, 
    setCompanyName, 
    companyAddress, 
    setCompanyAddress, 
    companyTelephone, 
    setCompanyTelephone, 
    contacts, 
    setContacts, 
    handleSubmit, 
    viewMode, 
    id 
}) {

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

  return (
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
          onClick={handleAddContact}
          sx={{ mb: 2 }}
        >
          <FlashOnIcon />
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
  );
}

export default CompanyProfileForm;
