import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { BrowserRouter as Router } from 'react-router-dom';
import Navigation from './Navigation';

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

  return (
    <AuthContext.Provider value={{ user }}>
      <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
        <Router>
          <Navigation />
        </Router>
      </ThemeContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;
