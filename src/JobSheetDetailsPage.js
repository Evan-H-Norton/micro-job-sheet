import React, { useState, useEffect } from 'react';
import { Typography, useMediaQuery, Button, Box, Slide, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, IconButton, TextField, DialogActions, Menu, MenuItem } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import { db } from './firebase';
import { collection, getDocs, doc, getDoc, query, where, updateDoc } from 'firebase/firestore';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowBack, ArrowForward, FlashOn as FlashOnIcon } from '@mui/icons-material';

import JobSheetForm from './JobSheetForm';
import PartsPage from './PartsPage';
import PDFViewer from './PDFViewer';
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
  const [docActionMenu, setDocActionMenu] = useState({ anchorEl: null, docId: null });
  const [openPartsPage, setOpenPartsPage] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [showAllDocuments, setShowAllDocuments] = useState(false);

  const toggleShowAllDocuments = () => setShowAllDocuments(!showAllDocuments);

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

  const handleOpenPartsPage = () => {
    setOpenPartsPage(true);
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

        const documentsCollection = collection(db, 'documents');
        let q;
        if (showAllDocuments) {
          q = query(documentsCollection, where('jobNumber', '==', data.jobNumber));
        } else {
          q = query(documentsCollection, where('jobSheetId', '==', id));
        }
        const documentsSnapshot = await getDocs(q);
        setDocuments(documentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    };
    fetchJobSheetAndDocuments();
  }, [id, showAllDocuments]);

  

  

  

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
    const q = query(documentsCollection, where('jobSheetId', '==', id));
    const documentsSnapshot = await getDocs(q);
    setDocuments(documentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    handleRenameClose();
  };

  const handleView = (doc) => {
    if (doc.base64Chunks) { // This is a PDF
        const reconstructedBase64 = `data:${doc.fileType};base64,${doc.base64Chunks.join('')}`;
        setViewDoc({ ...doc, base64: reconstructedBase64 });
    } else { // This is an image
        setViewDoc(doc);
    }
  };

  const handleViewClose = () => {
    setViewDoc(null);
  };

  const handleDocActionMenuClick = (event, docId) => {
    setDocActionMenu({ anchorEl: event.currentTarget, docId: docId });
  };

  const handleDocActionMenuClose = () => {
    setDocActionMenu({ anchorEl: null, docId: null });
  };

    const handleNavigateSheet = (direction) => {
      const newIndex = currentSheetIndex + direction;
      if (newIndex >= 0 && newIndex < jobSheets.length) {
          const slideDir = direction === 1 ? 'left' : 'right';
          navigate(`/job-sheet/${jobSheets[newIndex].id}`, { state: { direction: slideDir } });
      }
    };
  
    const formatJobNumber = (jobNumber) => {
      if (!jobNumber) return '';
      return `J-${String(jobNumber).padStart(4, '0')}`;
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
                <MenuItem onClick={handleOpenPartsPage}>Parts List</MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
        Job Sheet Details
      </Typography>
      <Slide key={id} direction={slideDirection} in={true} mountOnEnter unmountOnExit timeout={300}>
        <Paper sx={{ p: 3, mt: 3, mb: 3 }}>
            <JobSheetForm
                viewMode={true}
                isSmallScreen={isSmallScreen}
                orderType={jobSheet.orderType}
                orderValue={jobSheet.orderValue}
                tasks={jobSheet.tasks}
                outstanding={jobSheet.outstanding}
                status={jobSheet.status}
                invoiceNumber={jobSheet.invoiceNumber}
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
                callout={jobSheet.callout}
                collectionDelivery={jobSheet.collectionDelivery}
                noCharge={jobSheet.noCharge}
                remote={jobSheet.remote}
                labourCharge={jobSheet.labourCharge}
            />
        </Paper>
      </Slide>

      <Dialog open={openDocumentsDialog} onClose={() => setOpenDocumentsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Documents for Job # {formatJobNumber(jobSheet.jobNumber)}, <span onClick={toggleShowAllDocuments} style={{cursor: 'pointer', textDecoration: showAllDocuments ? 'line-through' : 'none'}}>Sheet {currentSheetIndex + 1}</span>
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
          {
            showAllDocuments ? (
              Object.entries(documents.reduce((acc, doc) => {
                const sheetId = doc.jobSheetId || 'unsorted';
                if (!acc[sheetId]) {
                  acc[sheetId] = [];
                }
                acc[sheetId].push(doc);
                return acc;
              }, {})).sort(([sheetIdA], [sheetIdB]) => {
                const sheetIndexA = jobSheets.findIndex(sheet => sheet.id === sheetIdA);
                const sheetIndexB = jobSheets.findIndex(sheet => sheet.id === sheetIdB);
                return sheetIndexA - sheetIndexB;
              }).map(([sheetId, sheetDocuments]) => {
                const sheetIndex = jobSheets.findIndex(sheet => sheet.id === sheetId);
                return (
                  <Box key={sheetId} mb={4}>
                    <Typography variant="h6" gutterBottom>Sheet {sheetIndex + 1}</Typography>
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
                          {sheetDocuments.map((doc) => (
                            <TableRow key={doc.id}>
                              <TableCell>{doc.name}</TableCell>
                              <TableCell>{new Date(doc.uploadedAt.toDate()).toLocaleString()}</TableCell>
                              <TableCell>
                                  {isSmallScreen ? (
                                      <>
                                          <IconButton onClick={(e) => handleDocActionMenuClick(e, doc.id)}>
                                              <FlashOnIcon />
                                          </IconButton>
                                          <Menu
                                              anchorEl={docActionMenu.anchorEl}
                                              open={docActionMenu.docId === doc.id}
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
                  </Box>
                )
              })
            ) : (
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
                                    <IconButton onClick={(e) => handleDocActionMenuClick(e, doc.id)}>
                                        <FlashOnIcon />
                                    </IconButton>
                                    <Menu
                                        anchorEl={docActionMenu.anchorEl}
                                        open={docActionMenu.docId === doc.id}
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
            )
          }
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

      <Dialog open={!!viewDoc} onClose={handleViewClose} fullWidth maxWidth="lg">
        {viewDoc && (
            <>
                <DialogTitle>{viewDoc.name}</DialogTitle>
                <DialogContent>
                    {viewDoc.fileType.startsWith('image/') ? (
                        <TransformWrapper initialScale={1}>
                            <TransformComponent>
                                <img src={viewDoc.base64} alt={viewDoc.name} style={{ maxWidth: '100%', maxHeight: 'calc(100vh - 250px)' }} />
                            </TransformComponent>
                        </TransformWrapper>
                    ) : (
                        <PDFViewer file={viewDoc.base64} />
                    )}
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleViewClose}>Close</Button>
                </DialogActions>
            </>
        )}
      </Dialog>

      <PartsPage
        open={openPartsPage}
        onClose={() => setOpenPartsPage(false)}
        jobSheetId={id}
        jobNumber={jobSheet.jobNumber}
        currentSheetIndex={currentSheetIndex}
        viewMode={true}
        jobSheets={jobSheets}
      />
    </Box>
  );
}
      

export default JobSheetDetailsPage;