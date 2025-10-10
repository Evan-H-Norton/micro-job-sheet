import React, { useContext, useState, useEffect } from 'react';
import { Typography, Paper, Button, TextField, Box } from '@mui/material';
import { AuthContext } from './App';
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword, updateProfile } from 'firebase/auth';
import { useTheme } from '@mui/material/styles';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
  const [cellPhoneNumber, setCellPhoneNumber] = useState('');

  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    if (user) {
      const fetchUserProfile = async () => {
        const userProfileRef = doc(db, 'userProfiles', user.uid);
        const userProfileSnap = await getDoc(userProfileRef);
        if (userProfileSnap.exists()) {
          const userProfileData = userProfileSnap.data();
          setTechnicianName(userProfileData.technicianName || user.displayName || '');
          setCellPhoneNumber(userProfileData.cellPhoneNumber || '');
        } else {
          setTechnicianName(user.displayName || '');
        }
      };
      fetchUserProfile();
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    const userProfileRef = doc(db, 'userProfiles', user.uid);
    const profileData = { technicianName, cellPhoneNumber };
    const promise = setDoc(userProfileRef, profileData, { merge: true })
      .then(() => updateProfile(auth.currentUser, { displayName: technicianName }));

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
    <Box sx={{ maxWidth: 'md', margin: 'auto' }}>
      <Box sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        bgcolor: theme.palette.background.paper,
        p: 2
      }}>
        <Button variant="outlined" onClick={() => navigate('/')} sx={{ mt: 2, mb: 2 }}>Back</Button>
      </Box>
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
            <TextField
              id="cell-phone-number"
              label="Cell Phone Number"
              fullWidth
              value={cellPhoneNumber}
              onChange={(e) => setCellPhoneNumber(e.target.value)}
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
    </Box>
  );
}

export default ProfilePage;