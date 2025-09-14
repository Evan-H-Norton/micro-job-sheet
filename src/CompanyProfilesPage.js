import React, { useState, useEffect } from 'react';
import { Typography, Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Button, Box, Menu, MenuItem, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { db } from './firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { FlashOn } from '@mui/icons-material';
import toast from 'react-hot-toast';

function CompanyProfilesPage() {
  const [profiles, setProfiles] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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

  const handleMenuClick = (event, profile) => {
    setAnchorEl(event.currentTarget);
    setSelectedProfile(profile);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleView = (profile) => {
    if (profile) {
      navigate(`/company-profiles/${profile.id}`);
      handleMenuClose();
    }
  };

  const handleEdit = (profile) => {
    if (profile) {
      navigate(`/company-profiles/edit/${profile.id}`);
      handleMenuClose();
    }
  };

  const handleDeleteClick = (profile) => {
    setSelectedProfile(profile);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (!selectedProfile) return;
    const profileRef = doc(db, 'companyProfiles', selectedProfile.id);
    const promise = deleteDoc(profileRef);

    toast.promise(promise, {
      loading: 'Deleting profile...',
      success: () => {
        const updatedProfiles = profiles.filter(p => p.id !== selectedProfile.id);
        setProfiles(updatedProfiles);
        setDeleteDialogOpen(false);
        setSelectedProfile(null);
        return 'Profile deleted successfully!';
      },
      error: (err) => `Failed to delete profile: ${err.toString()}`,
    });
  };

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
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Company Name</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {profiles.map((profile) => (
              <TableRow key={profile.id}>
                <TableCell>{profile.companyName}</TableCell>
                <TableCell>{profile.companyAddress}</TableCell>
                <TableCell>
                  <IconButton onClick={(e) => handleMenuClick(e, profile)}>
                    <FlashOn />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleView(selectedProfile)}>View</MenuItem>
        <MenuItem onClick={() => handleEdit(selectedProfile)}>Edit</MenuItem>
        <MenuItem onClick={() => handleDeleteClick(selectedProfile)} sx={{ color: 'error.main' }}>Delete</MenuItem>
      </Menu>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Profile</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this company profile? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default CompanyProfilesPage;
