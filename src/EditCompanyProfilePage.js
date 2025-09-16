import React, { useState, useEffect } from 'react';
import { Typography, Button, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { doc, getDoc, setDoc, addDoc, collection } from 'firebase/firestore';
import toast from 'react-hot-toast';
import CompanyProfileForm from './CompanyProfileForm';

function EditCompanyProfilePage({ viewMode = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
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
    <Box sx={{ maxWidth: 'md', margin: 'auto' }}>
      <Box sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        bgcolor: theme.palette.background.paper,
        p: 2
      }}>
        <Button variant="outlined" onClick={() => navigate('/company-profiles')}>Back</Button>
      </Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
        {pageTitle}
      </Typography>
      <CompanyProfileForm
        companyName={companyName}
        setCompanyName={setCompanyName}
        companyAddress={companyAddress}
        setCompanyAddress={setCompanyAddress}
        companyTelephone={companyTelephone}
        setCompanyTelephone={setCompanyTelephone}
        contacts={contacts}
        setContacts={setContacts}
        handleSubmit={handleSubmit}
        viewMode={viewMode}
        id={id}
      />
    </Box>
  );
}

export default EditCompanyProfilePage;