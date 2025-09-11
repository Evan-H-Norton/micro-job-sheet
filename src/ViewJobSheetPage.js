import React, { useState, useEffect, useContext } from 'react';
import { Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Box, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { db } from './firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { FlashOn } from '@mui/icons-material';
import { AuthContext } from './App';

function ViewJobSheetPage() {
  const { user } = useContext(AuthContext);
  const [jobSheets, setJobSheets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  
  const navigate = useNavigate();

    useEffect(() => {
    const fetchJobSheets = async () => {
      const jobSheetsCollection = collection(db, 'jobSheets');
      const jobSheetsSnapshot = await getDocs(jobSheetsCollection);
      const jobSheetsList = jobSheetsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJobSheets(jobSheetsList);
    };
    fetchJobSheets();
  }, []);

  const handleMenuClick = (event, sheet) => {
    setAnchorEl(event.currentTarget);
    setSelectedSheet(sheet);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSheet(null);
  };

  const handleView = () => {
    navigate(`/job-sheet/${selectedSheet.id}`);
    handleMenuClose();
  };

  const handleEdit = () => {
    navigate(`/job-sheet/edit/${selectedSheet.id}`);
    handleMenuClose();
  };

  const handleUpdateStatus = () => {
    setNewStatus(selectedSheet.status);
    setStatusDialogOpen(true);
    handleMenuClose();
  };

  const handleStatusDialogClose = () => {
    setStatusDialogOpen(false);
  };

  const handleStatusSave = async () => {
    const jobSheetRef = doc(db, 'jobSheets', selectedSheet.id);
    try {
      await updateDoc(jobSheetRef, { status: newStatus });
      const updatedJobSheets = jobSheets.map(sheet => 
        sheet.id === selectedSheet.id ? { ...sheet, status: newStatus } : sheet
      );
      setJobSheets(updatedJobSheets);
      handleStatusDialogClose();
    } catch (error) {
      console.error("Error updating status: ", error);
    }
  };

  const filteredJobSheets = jobSheets.filter(sheet => {
    const searchTermMatch = 
      sheet.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sheet.jobNumber.toString().includes(searchTerm) ||
      sheet.orderNumber.toString().includes(searchTerm) ||
      sheet.technicianName.toLowerCase().includes(searchTerm.toLowerCase());

    if (user && user.displayName) {
      return searchTermMatch && sheet.technicianName === user.displayName && sheet.status === 'Open';
    } else {
      return searchTermMatch && sheet.status === 'Pending Invoice';
    }
  });

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
        <Button variant="outlined" onClick={() => navigate(-1)}>Back</Button>
        
      </Box>
      <TextField
        label="Search"
        variant="outlined"
        fullWidth
        margin="normal"
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Job Number</TableCell>
              <TableCell>Order Number</TableCell>
              <TableCell>Company Name</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Technician</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredJobSheets.map((sheet) => (
              <TableRow key={sheet.id}>
                <TableCell>{sheet.jobNumber}</TableCell>
                <TableCell>{sheet.orderNumber}</TableCell>
                <TableCell>{sheet.companyName}</TableCell>
                <TableCell>{sheet.date}</TableCell>
                <TableCell>{sheet.technicianName}</TableCell>
                <TableCell>{sheet.status}</TableCell>
                <TableCell>
                  <IconButton onClick={(e) => handleMenuClick(e, sheet)}>
                    <FlashOn />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleView}>View</MenuItem>
        <MenuItem onClick={handleEdit}>Edit</MenuItem>
        <MenuItem onClick={handleUpdateStatus}>Update Status</MenuItem>
      </Menu>
      <Dialog open={statusDialogOpen} onClose={handleStatusDialogClose}>
        <DialogTitle>Update Status</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            fullWidth
            margin="normal"
          >
            <MenuItem value="Open">Open</MenuItem>
            <MenuItem value="Pending Invoice">Pending Invoice</MenuItem>
            {user && !user.displayName && <MenuItem value="Invoiced">Invoiced</MenuItem>}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleStatusDialogClose}>Cancel</Button>
          <Button onClick={handleStatusSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ViewJobSheetPage;
