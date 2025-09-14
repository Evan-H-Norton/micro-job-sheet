import React, { useState, useMemo, useContext } from 'react';
import { auth } from './firebase';
import { signOut } from 'firebase/auth';
import { ThemeProvider } from '@mui/material/styles';
import { AppBar, Toolbar, Typography, IconButton, CssBaseline, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import HomePage from './HomePage';
import LoginPage from './LoginPage';
import NewJobSheetPage from './NewJobSheetPage';
import ViewJobSheetPage from './ViewJobSheetPage';
import CompanyProfilesPage from './CompanyProfilesPage';

import JobSheetDetailsPage from './JobSheetDetailsPage';
import EditCompanyProfilePage from './EditCompanyProfilePage';
import ProfilePage from './ProfilePage';
import EditJobSheetPage from './EditJobSheetPage';
import { lightTheme, darkTheme } from './theme';
import { AuthContext, ThemeContext } from './App';
import { Toaster } from 'react-hot-toast';

function Navigation() {
  const { user } = useContext(AuthContext);
  const { darkMode, setDarkMode } = useContext(ThemeContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      handleClose();
    } catch (error) {
      console.error(error);
    }
  };

  const theme = useMemo(() => (darkMode ? darkTheme : lightTheme), [darkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster
        toastOptions={{
          style: {
            background: theme.palette.background.paper,
            color: theme.palette.text.primary,
          },
        }}
      />
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Micro Job Sheet
          </Typography>
          <IconButton sx={{ ml: 1 }} onClick={() => setDarkMode(!darkMode)} color="inherit">
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          {user && (
            <div>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>Profile</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </div>
          )}
        </Toolbar>
      </AppBar>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
        <Route path="/" element={user ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/new-job-sheet" element={user ? <NewJobSheetPage /> : <Navigate to="/login" />} />
        <Route path="/view-job-sheet" element={user ? <ViewJobSheetPage /> : <Navigate to="/login" />} />
        <Route path="/company-profiles" element={user ? <CompanyProfilesPage /> : <Navigate to="/login" />} />
        <Route path="/company-profiles/new" element={user ? <EditCompanyProfilePage /> : <Navigate to="/login" />} />
        <Route path="/company-profiles/edit/:id" element={user ? <EditCompanyProfilePage /> : <Navigate to="/login" />} />
        <Route path="/company-profiles/:id" element={user ? <EditCompanyProfilePage viewMode={true} /> : <Navigate to="/login" />} />
        <Route path="/job-sheet/:id" element={user ? <JobSheetDetailsPage /> : <Navigate to="/login" />} />
        <Route path="/job-sheet/edit/:id" element={user ? <EditJobSheetPage /> : <Navigate to="/login" />} />
        <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>
    </ThemeProvider>
  );
}

export default Navigation;
