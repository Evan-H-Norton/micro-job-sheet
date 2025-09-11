import React, { useContext, useState, useEffect } from 'react';
import { Typography, Container, Paper, Button, TextField, Box } from '@mui/material';
import { AuthContext } from './App';
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword, updateProfile } from 'firebase/auth';
import { auth } from './firebase';
import { useNavigate } from 'react-router-dom';

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
    try {
      await updateProfile(auth.currentUser, { displayName: technicianName });
      alert('Profile updated successfully!');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setShowChangePassword(false);
      alert('Password changed successfully!');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Container maxWidth="md">
      <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mt: 2, mb: 2 }}>Back</Button>
      <Paper sx={{ p: 2, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
          User Profile
        </Typography>
        {user ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Email"
              fullWidth
              value={user.email}
              InputProps={{ readOnly: true }}
            />
            <TextField
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
                  type="password"
                  label="Current Password"
                  fullWidth
                  margin="normal"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <TextField
                  type="password"
                  label="New Password"
                  fullWidth
                  margin="normal"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <TextField
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