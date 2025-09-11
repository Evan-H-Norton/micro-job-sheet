import React, { useRef, useEffect, useState } from 'react';
import SignaturePad from 'react-signature-pad-wrapper';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, IconButton, Box, Typography } from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';

const SignaturePadWrapper = ({ onSave, onClose }) => {
  const signaturePadRef = useRef(null);
  const containerRef = useRef(null);
  const [showRotateMessage, setShowRotateMessage] = useState(false);

  useEffect(() => {
    const resizeCanvas = () => {
      if (signaturePadRef.current && containerRef.current) {
        const canvas = signaturePadRef.current.getCanvas();
        const { width, height } = containerRef.current.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;
        signaturePadRef.current.clear(); // Redraw the canvas
      }
    };

    const handleResizeAndOrientation = () => {
      const isSmallScreen = window.innerWidth < 768;
      const isPortrait = window.matchMedia("(orientation: portrait)").matches;
      setShowRotateMessage(isSmallScreen && isPortrait);
      resizeCanvas();
    };

    window.addEventListener('resize', handleResizeAndOrientation);
    
    const timer = setTimeout(handleResizeAndOrientation, 150);

    return () => {
      window.removeEventListener('resize', handleResizeAndOrientation);
      clearTimeout(timer);
    };
  }, []);

  const handleClear = () => {
    signaturePadRef.current.clear();
  };

  const handleSave = () => {
    if (signaturePadRef.current.isEmpty()) {
      alert('Please provide a signature first.');
    } else {
      const dataURL = signaturePadRef.current.toDataURL('image/png');
      onSave(dataURL);
      onClose();
    }
  };

  return (
    <Dialog open onClose={onClose} fullScreen PaperProps={{ sx: { display: 'flex', flexDirection: 'column' } }}>
      <DialogTitle>
        Signature
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 1, position: 'relative' }}>
        {showRotateMessage && (
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, textAlign: 'center', p: 2 }}>
            <Typography variant="h5">For a better signature experience, please rotate your device to landscape mode.</Typography>
          </Box>
        )}
        <Box ref={containerRef} sx={{ flex: 1, border: '1px solid #ccc', borderRadius: '4px' }}>
          <SignaturePad
            ref={signaturePadRef}
            options={{ penColor: 'black' }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClear}>Clear</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SignaturePadWrapper;
