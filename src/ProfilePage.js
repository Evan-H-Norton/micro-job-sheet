import React, { useContext, useState, useEffect } from 'react';
import { Typography, Container, Paper, Button, TextField, Box } from '@mui/material';
import { AuthContext } from './App';
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword, updateProfile } from 'firebase/auth';
import { auth } from './firebase';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function ProfilePage() {
  const { user } = useContext(AuthContext);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [technicianName, setTechnicianName] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setTechnicianName(user.displayName || '');
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    const promise = updateProfile(auth.currentUser, { displayName: technicianName });
    toast.promise(promise, {
      loading: 'Updating profile...',
      success: () => {
        navigate(-1);
        return 'Profile updated successfully!';
      },
      error: (err) => {
        setError(err.message);
        return 'Failed to update profile.';
      },
    });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }

    const promise = reauthenticateWithCredential(auth.currentUser, EmailAuthProvider.credential(user.email, currentPassword))
      .then(() => {
        return updatePassword(auth.currentUser, newPassword);
      });

    toast.promise(promise, {
      loading: 'Changing password...',
      success: () => {
        setShowChangePassword(false);
        return 'Password changed successfully!';
      },
      error: (err) => {
        setError(err.message);
        return 'Failed to change password.';
      },
    });
  };

  return (
    <Container maxWidth="md">
      <Button variant="outlined" onClick={() => navigate('/')} sx={{ mt: 2, mb: 2 }}>Back</Button>
      <Paper sx={{ p: 2, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
          User Profile
        </Typography>
        {user ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              id="email"
              label="Email"
              fullWidth
              value={user.email}
              InputProps={{ readOnly: true }}
            />
            <TextField
              id="technician-name"
              label="Technician Name"
              fullWidth
              value={technicianName}
              onChange={(e) => setTechnicianName(e.target.value)}
            />
            <Button variant="outlined" onClick={() => setShowChangePassword(!showChangePassword)}>
              Change Password
            </Button>
            <Button variant="contained" onClick={handleUpdateProfile}>
              Save Profile
            </Button>
            {showChangePassword && (
              <Box component="form" onSubmit={handleChangePassword} sx={{ mt: 2 }}>
                <TextField
                  id="current-password"
                  type="password"
                  label="Current Password"
                  fullWidth
                  margin="normal"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <TextField
                  id="new-password"
                  type="password"
                  label="New Password"
                  fullWidth
                  margin="normal"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <TextField
                  id="confirm-new-password"
                  type="password"
                  label="Confirm New Password"
                  fullWidth
                  margin="normal"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {error && (
                  <Typography color="error">{error}</Typography>
                )}
                <Button type="submit" variant="contained" sx={{ mt: 2 }}>
                  Submit
                </Button>
              </Box>
            )}
          </Box>
        ) : (
          <Typography>Loading...</Typography>
        )}
      </Paper>
    </Container>
  );
}

export default ProfilePage;