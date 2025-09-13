import React, { useState } from 'react';
import { auth } from './firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box } from '@mui/material';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (error) {
      switch (error.code) {
        case 'auth/invalid-credential':
          setError('Incorrect password or email. Please try again.');
          break;
        case 'auth/missing-password':
          setError('Please enter your password.');
          break;
        case 'auth/user-not-found':
          setError('No account found with this email. Please sign up.');
          break;
        default:
          setError(error.message);
          break;
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
            Login
          </Typography>
          <TextField
            id="email"
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            id="password"
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <Typography color="error" sx={{ my: 2, textAlign: 'center' }}>{error}</Typography>}
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Log In
          </Button>
        </form>
      </Box>
    </Container>
  );
}

export default LoginPage;