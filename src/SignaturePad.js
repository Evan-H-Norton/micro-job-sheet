import React, { useRef, useEffect } from 'react';
import SignaturePad from 'react-signature-pad-wrapper';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, IconButton, Box } from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';

const SignaturePadWrapper = ({ onSave, onClose }) => {
  const signaturePadRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const resizeContainerToCanvas = () => {
      if (signaturePadRef.current && containerRef.current) {
        const canvas = signaturePadRef.current.getCanvas();
        const { width, height } = canvas;
        
        containerRef.current.style.width = `${width}px`;
        containerRef.current.style.height = `${height}px`;
      }
    };

    const handleResize = () => {
        setTimeout(resizeContainerToCanvas, 50);
    };

    window.addEventListener('resize', handleResize);
    
    setTimeout(resizeContainerToCanvas, 150);

    return () => {
      window.removeEventListener('resize', handleResize);
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
      <DialogContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 1, position: 'relative', touchAction: 'none' }}>
        <Box ref={containerRef} sx={{ border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
          <SignaturePad
            ref={signaturePadRef}
            options={{ penColor: 'black' }}
            redrawOnResize
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
