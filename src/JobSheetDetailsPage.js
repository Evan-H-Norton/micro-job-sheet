import React, { useState, useEffect } from 'react';
import { Typography, useMediaQuery, Button, Box, Slide, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, IconButton, TextField, DialogActions, Menu, MenuItem } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import { db } from './firebase';
import { collection, getDocs, doc, getDoc, query, where, updateDoc } from 'firebase/firestore';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowBack, ArrowForward, FlashOn as FlashOnIcon } from '@mui/icons-material';

import JobSheetForm from './JobSheetForm';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';


function JobSheetDetailsPage() {
  
  const [jobSheet, setJobSheet] = useState(null);
  const [jobSheets, setJobSheets] = useState([]);
  const [currentSheetIndex, setCurrentSheetIndex] = useState(0);
  const [documents, setDocuments] = useState([]);
  const [openDocumentsDialog, setOpenDocumentsDialog] = useState(false);
  const location = useLocation();
  const slideDirection = location.state?.direction || 'up';
  const [renameDoc, setRenameDoc] = useState(null);
  const [newDocName, setNewDocName] = useState('');
  const [viewDoc, setViewDoc] = useState(null);
  const [docActionAnchorEl, setDocActionAnchorEl] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewDocuments = () => {
    setOpenDocumentsDialog(true);
    handleMenuClose();
  };
  
  
  
  const { id } = useParams();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobSheetAndDocuments = async () => {
      const docRef = doc(db, 'jobSheets', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setJobSheet(data);

        const jobSheetsCollection = collection(db, 'jobSheets');
        const jobSheetsSnapshot = await getDocs(jobSheetsCollection);
        const allJobSheets = jobSheetsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const relatedJobSheets = allJobSheets.filter(sheet => sheet.jobNumber === data.jobNumber);
        setJobSheets(relatedJobSheets);
        const newIndex = relatedJobSheets.findIndex(sheet => sheet.id === id);
        setCurrentSheetIndex(newIndex);

        // Fetch documents related to this job number
        const documentsCollection = collection(db, 'documents');
        const q = query(documentsCollection, where('jobNumber', '==', data.jobNumber));
        const documentsSnapshot = await getDocs(q);
        setDocuments(documentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    };
    fetchJobSheetAndDocuments();
  }, [id]);

  

  

  

  const handleRename = (doc) => {
    setRenameDoc(doc);
    setNewDocName(doc.name);
  };

  const handleRenameClose = () => {
    setRenameDoc(null);
    setNewDocName('');
  };

  const handleRenameSave = async () => {
    await updateDoc(doc(db, 'documents', renameDoc.id), { name: newDocName });
    const documentsCollection = collection(db, 'documents');
    const q = query(documentsCollection, where('jobNumber', '==', jobSheet.jobNumber));
    const documentsSnapshot = await getDocs(q);
    setDocuments(documentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    handleRenameClose();
  };

  const handleView = (doc) => {
    setViewDoc(doc);
  };

  const handleViewClose = () => {
    setViewDoc(null);
  };

  const handleDocActionMenuClick = (event) => {
    setDocActionAnchorEl(event.currentTarget);
  };

  const handleDocActionMenuClose = () => {
    setDocActionAnchorEl(null);
  };

  const handleNavigateSheet = (direction) => {
    const newIndex = currentSheetIndex + direction;
    if (newIndex >= 0 && newIndex < jobSheets.length) {
        const slideDir = direction === 1 ? 'left' : 'right';
        navigate(`/job-sheet/${jobSheets[newIndex].id}`, { state: { direction: slideDir } });
    }
};

  if (!jobSheet) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 'md', margin: 'auto' }}>
      <Box sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        bgcolor: theme.palette.background.paper,
        p: 2,
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
      }}>
        <Box sx={{ justifySelf: 'start' }}>
          <Button variant="outlined" onClick={() => navigate('/view-job-sheet')}>Back</Button>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifySelf: 'center' }}>
            <Button variant="outlined" onClick={() => handleNavigateSheet(-1)} disabled={currentSheetIndex === 0}>
                <ArrowBack />
            </Button>
            <Button variant="outlined" disabled>{currentSheetIndex + 1}</Button>
            <Button variant="outlined" onClick={() => handleNavigateSheet(1)} disabled={currentSheetIndex === jobSheets.length - 1}>
                <ArrowForward />
            </Button>
        </Box>
                <Box sx={{ justifySelf: 'end' }}>
          {jobSheet.status !== 'Invoiced' && jobSheet.status !== 'Cancelled' && (
            <>
              <Button variant="contained" onClick={handleMenuClick}>
                <FlashOnIcon />
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleViewDocuments}>Documents</MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Box>
      <Slide key={id} direction={slideDirection} in={true} mountOnEnter unmountOnExit timeout={300}>
        <Paper sx={{ p: 3, mt: 3, mb: 3 }}>
            <JobSheetForm
                viewMode={true}
                isSmallScreen={isSmallScreen}
                orderType={jobSheet.orderType}
                orderValue={jobSheet.orderValue}
                tasks={jobSheet.tasks}
                outstanding={jobSheet.outstanding}
                faultComplaint={jobSheet.faultComplaint}
                workCarriedOut={jobSheet.workCarriedOut}
                arrivalTime={jobSheet.arrivalTime}
                departureTime={jobSheet.departureTime}
                totalTime={jobSheet.totalTime}
                technicianName={jobSheet.technicianName}
                technicianSignature={jobSheet.technicianSignature}
                customerName={jobSheet.customerName}
                customerSignature={jobSheet.customerSignature}
                companyNameInput={jobSheet.companyName}
                companyAddress={jobSheet.companyAddress}
                companyTelephone={jobSheet.companyTelephone}
                contactNameInput={jobSheet.contact.name}
                contactCellphoneInput={jobSheet.contact.cellphone}
                contactEmailInput={jobSheet.contact.email}
                date={jobSheet.date}
                jobNumber={jobSheet.jobNumber}
            />
        </Paper>
      </Slide>

      <Dialog open={openDocumentsDialog} onClose={() => setOpenDocumentsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Documents for Job # {jobSheet.jobNumber}
          <IconButton
            aria-label="close"
            onClick={() => setOpenDocumentsDialog(false)}
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
        <DialogContent>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>File Name</TableCell>
                  <TableCell>Uploaded At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>{doc.name}</TableCell>
                    <TableCell>{new Date(doc.uploadedAt.toDate()).toLocaleString()}</TableCell>
                    <TableCell>
                        {isSmallScreen ? (
                            <>
                                <IconButton onClick={handleDocActionMenuClick}>
                                    <FlashOnIcon />
                                </IconButton>
                                <Menu
                                    anchorEl={docActionAnchorEl}
                                    open={Boolean(docActionAnchorEl)}
                                    onClose={handleDocActionMenuClose}
                                >
                                    <MenuItem onClick={() => { handleView(doc); handleDocActionMenuClose(); }}>View</MenuItem>
                                    <MenuItem onClick={() => { handleRename(doc); handleDocActionMenuClose(); }}>Rename</MenuItem>
                                    
                                </Menu>
                            </>
                        ) : (
                            <>
                                <Button variant="outlined" onClick={() => handleView(doc)}>View</Button>
                                <Button variant="outlined" onClick={() => handleRename(doc)}>Rename</Button>
                            </>
                        )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>

      <Dialog open={!!renameDoc} onClose={handleRenameClose}>
        <DialogTitle>Rename Document</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Name"
            type="text"
            fullWidth
            value={newDocName}
            onChange={(e) => setNewDocName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRenameClose}>Cancel</Button>
          <Button onClick={handleRenameSave}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!viewDoc} onClose={handleViewClose}>
        <DialogTitle>{viewDoc?.name}</DialogTitle>
        <DialogContent>
          <TransformWrapper>
            <TransformComponent>
              <img src={viewDoc?.base64} alt={viewDoc?.name} style={{ maxWidth: '100%' }} />
            </TransformComponent>
          </TransformWrapper>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleViewClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
      

export default JobSheetDetailsPage;