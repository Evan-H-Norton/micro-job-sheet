import React, { useState, useEffect, useMemo } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ThemeProvider } from '@mui/material/styles';
import { AppBar, Toolbar, Typography, Button, IconButton, CssBaseline } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './HomePage';
import LoginPage from './LoginPage';
import NewJobSheetPage from './NewJobSheetPage';
import ViewJobSheetPage from './ViewJobSheetPage';
import CompanyProfilesPage from './CompanyProfilesPage';
import CompanyProfilePage from './CompanyProfilePage';
import JobSheetDetailsPage from './JobSheetDetailsPage';
import EditCompanyProfilePage from './EditCompanyProfilePage';
import { lightTheme, darkTheme } from './theme';

export const ThemeContext = React.createContext();
export const AuthContext = React.createContext();

function App() {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true' ? true : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(error);
    }
  };

  const theme = useMemo(() => (darkMode ? darkTheme : lightTheme), [darkMode]);

  return (
    <AuthContext.Provider value={{ user }}>
      <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
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
                {user && <Button color="inherit" onClick={handleLogout}>Logout</Button>}
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
              <Route path="/company-profiles/:id" element={user ? <CompanyProfilePage /> : <Navigate to="/login" />} />
              <Route path="/job-sheet/:id" element={user ? <JobSheetDetailsPage /> : <Navigate to="/login" />} />
            </Routes>
          </Router>
        </ThemeProvider>
      </ThemeContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;
