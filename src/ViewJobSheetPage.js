import React, { useState, useEffect, useContext } from 'react';
import { Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Box, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Select, InputLabel, Typography, Collapse } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { db } from './firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { FlashOn } from '@mui/icons-material';
import { AuthContext } from './App';
import toast from 'react-hot-toast';

function ViewJobSheetPage() {
  const { user } = useContext(AuthContext);
  const [jobSheets, setJobSheets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [invoicedJobSheets, setInvoicedJobSheets] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [openRows, setOpenRows] = useState({});
  const [isSubmenu, setIsSubmenu] = useState(false);

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

  useEffect(() => {
    const filteredCompleted = jobSheets.filter(sheet => sheet.status === 'Invoiced' || sheet.status === 'Cancelled');
    setInvoicedJobSheets(filteredCompleted);
  }, [jobSheets]);

  const handleMenuClick = (event, sheet, isSub = false) => {
    setAnchorEl(event.currentTarget);
    setSelectedSheet(sheet);
    setIsSubmenu(isSub);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSheet(null);
  };

  const handleView = (sheet) => {
    if (sheet) {
      navigate(`/job-sheet/${sheet.id}`);
      handleMenuClose();
    }
  };

  const handleEdit = (sheet) => {
    if (sheet) {
      navigate(`/job-sheet/edit/${sheet.id}`);
      handleMenuClose();
    }
  };

  const handleUpdateStatus = (sheet) => {
    if (sheet) {
      setSelectedSheet(sheet);
      setNewStatus(sheet.status);
      setStatusDialogOpen(true);
      setAnchorEl(null);
    }
  };

  const handleDeleteClick = (sheet) => {
    setSelectedSheet(sheet);
    setDeleteDialogOpen(true);
    setAnchorEl(null);
  };

  const handleCancelClick = (sheet) => {
    setSelectedSheet(sheet);
    setCancelDialogOpen(true);
    setAnchorEl(null);
  };

  const handleConfirmCancel = async () => {
    if (!selectedSheet) return;

    const sheetsToUpdate = jobSheets.filter(s => s.jobNumber === selectedSheet.jobNumber);
    const promises = sheetsToUpdate.map(s => {
      const jobSheetRef = doc(db, 'jobSheets', s.id);
      return updateDoc(jobSheetRef, { status: 'Cancelled' });
    });

    const promise = Promise.all(promises);

    toast.promise(promise, {
      loading: 'Cancelling job...',
      success: () => {
        const updatedJobSheets = jobSheets.map(s =>
          s.jobNumber === selectedSheet.jobNumber ? { ...s, status: 'Cancelled' } : s
        );
        setJobSheets(updatedJobSheets);
        setCancelDialogOpen(false);
        handleMenuClose();
        return 'Job cancelled successfully!';
      },
      error: (err) => `Failed to cancel job: ${err.toString()}`,
    });
  };

  const handleStatusDialogClose = () => {
    setStatusDialogOpen(false);
    setSelectedSheet(null);
  };

  const handleStatusSave = async () => {
    if (!selectedSheet) return;

    const sheetsToUpdate = jobSheets.filter(sheet => sheet.jobNumber === selectedSheet.jobNumber);

    if (newStatus === 'Invoiced') {
      setStatusDialogOpen(false);
      setInvoiceDialogOpen(true);
    } else {
      const promises = sheetsToUpdate.map(sheet => {
        const jobSheetRef = doc(db, 'jobSheets', sheet.id);
        return updateDoc(jobSheetRef, { status: newStatus });
      });

      const promise = Promise.all(promises);

      toast.promise(promise, {
        loading: 'Updating status...',
        success: () => {
          const updatedJobSheets = jobSheets.map(sheet =>
            sheet.jobNumber === selectedSheet.jobNumber ? { ...sheet, status: newStatus } : sheet
          );
          setJobSheets(updatedJobSheets);
          handleStatusDialogClose();
          return 'Status updated successfully!';
        },
        error: (err) => `Failed to update status: ${err.toString()}`,
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedSheet) return;
    const jobSheetRef = doc(db, 'jobSheets', selectedSheet.id);
    const promise = deleteDoc(jobSheetRef);

    toast.promise(promise, {
      loading: 'Deleting job sheet...',
      success: () => {
        const updatedJobSheets = jobSheets.filter(sheet => sheet.id !== selectedSheet.id);
        setJobSheets(updatedJobSheets);
        setDeleteDialogOpen(false);
        setSelectedSheet(null);
        return 'Job sheet deleted successfully!';
      },
      error: (err) => `Failed to delete job sheet: ${err.toString()}`,
    });
  };

  const handleInvoiceNumberSave = async () => {
    if (!selectedSheet || !invoiceNumber) {
      toast.error('Invoice number is required.');
      return;
    }

    const sheetsToUpdate = jobSheets.filter(sheet => sheet.jobNumber === selectedSheet.jobNumber);
    const promises = sheetsToUpdate.map(sheet => {
      const jobSheetRef = doc(db, 'jobSheets', sheet.id);
      return updateDoc(jobSheetRef, { status: 'Invoiced', invoiceNumber });
    });

    const promise = Promise.all(promises);

    toast.promise(promise, {
      loading: 'Saving invoice number...',
      success: () => {
        const updatedJobSheets = jobSheets.map(sheet =>
          sheet.jobNumber === selectedSheet.jobNumber ? { ...sheet, status: 'Invoiced', invoiceNumber } : sheet
        );
        setJobSheets(updatedJobSheets);
        setInvoiceDialogOpen(false);
        setInvoiceNumber('');
        handleStatusDialogClose();
        return 'Invoice number saved successfully!';
      },
      error: (err) => `Failed to save invoice number: ${err.toString()}`,
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const filteredJobSheets = jobSheets.filter(sheet => {
    const searchTermMatch =
      (sheet.companyName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (sheet.jobNumber?.toString() || '').includes(searchTerm) ||
      (sheet.orderType?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (sheet.orderValue?.toString() || '').includes(searchTerm) ||
      (sheet.technicianName?.toLowerCase() || '').includes(searchTerm.toLowerCase());

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
        id="search"
        label="Search"
        variant="outlined"
        fullWidth
        margin="normal"
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Typography variant="h5" gutterBottom sx={{ textAlign: 'center' }}>
        {user?.displayName ? 'Open Jobs' : 'Pending Invoice Jobs'}
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Job Number</TableCell>
              <TableCell>Order</TableCell>
              <TableCell>Company Name</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Technician</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(
              filteredJobSheets.reduce((acc, sheet) => {
                if (!acc[sheet.jobNumber]) {
                  acc[sheet.jobNumber] = [];
                }
                acc[sheet.jobNumber].push(sheet);
                return acc;
              }, {})
            ).map(([jobNumber, sheets]) => {
              const multipleOrderTypes = new Set(sheets.map(s => s.orderType)).size > 1;
              return (
              <React.Fragment key={jobNumber}>
                <TableRow>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => {
                          if (sheets.length > 1) {
                            const newOpenRows = { ...openRows };
                            newOpenRows[jobNumber] = !newOpenRows[jobNumber];
                            setOpenRows(newOpenRows);
                          }
                        }}
                        style={{ visibility: sheets.length > 1 ? 'visible' : 'hidden' }}
                      >
                        {openRows[jobNumber] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                      </IconButton>
                      {jobNumber}
                    </Box>
                  </TableCell>
                  <TableCell>{multipleOrderTypes ? '~' : (sheets[0].orderType === 'S.L.A' ? 'S.L.A' : sheets[0].orderValue)}</TableCell>
                  <TableCell>{sheets[0].companyName}</TableCell>
                  <TableCell>{formatDate(sheets[0].date)}</TableCell>
                  <TableCell>{sheets[0].technicianName}</TableCell>
                  <TableCell>{sheets[0].status}</TableCell>
                  <TableCell>
                    <IconButton onClick={(e) => handleMenuClick(e, sheets[0], false)}>
                      <FlashOn />
                    </IconButton>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                    <Collapse in={openRows[jobNumber]} timeout="auto" unmountOnExit>
                      <Box sx={{ margin: 1 }}>
                        
                        <Table size="small" aria-label="purchases">
                          <TableHead>
                            <TableRow>
                              <TableCell />
                              <TableCell>Order</TableCell>
                              <TableCell />
                              <TableCell>Date</TableCell>
                              <TableCell>Technician</TableCell>
                              <TableCell />
                              <TableCell>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {sheets.map((historyRow) => (
                              <TableRow key={historyRow.id}>
                                <TableCell />
                                <TableCell>{historyRow.orderType === 'S.L.A' ? 'S.L.A' : historyRow.orderValue}</TableCell>
                                <TableCell />
                                <TableCell>{formatDate(historyRow.date)}</TableCell>
                                <TableCell>{historyRow.technicianName}</TableCell>
                                <TableCell />
                                <TableCell>
                                  <IconButton onClick={(e) => handleMenuClick(e, historyRow, true)}>
                                    <FlashOn />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            )})}
          </TableBody>
        </Table>
      </TableContainer>

      {!user?.displayName && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ textAlign: 'center' }}>
            Completed Jobs
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Job Number</TableCell>
                  <TableCell>Order</TableCell>
                  <TableCell>Company Name</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Technician</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Invoice #</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(
                  invoicedJobSheets.reduce((acc, sheet) => {
                    if (!acc[sheet.jobNumber]) {
                      acc[sheet.jobNumber] = [];
                    }
                    acc[sheet.jobNumber].push(sheet);
                    return acc;
                  }, {})
                ).map(([jobNumber, sheets]) => {
                  const multipleOrderTypes = new Set(sheets.map(s => s.orderType)).size > 1;
                  return (
                  <React.Fragment key={jobNumber}>
                    <TableRow>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={() => {
                              if (sheets.length > 1) {
                                const newOpenRows = { ...openRows };
                                newOpenRows[jobNumber] = !newOpenRows[jobNumber];
                                setOpenRows(newOpenRows);
                              }
                            }}
                            style={{ visibility: sheets.length > 1 ? 'visible' : 'hidden' }}
                          >
                            {openRows[jobNumber] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                          </IconButton>
                          {jobNumber}
                        </Box>
                      </TableCell>
                      <TableCell>{multipleOrderTypes ? '~' : (sheets[0].orderType === 'S.L.A' ? 'S.L.A' : sheets[0].orderValue)}</TableCell>
                      <TableCell>{sheets[0].companyName}</TableCell>
                      <TableCell>{formatDate(sheets[0].date)}</TableCell>
                      <TableCell>{sheets[0].technicianName}</TableCell>
                      <TableCell>{sheets[0].status}</TableCell>
                      <TableCell>{sheets[0].invoiceNumber}</TableCell>
                      <TableCell>
                        <IconButton onClick={(e) => handleMenuClick(e, sheets[0], false)}>
                          <FlashOn />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                        <Collapse in={openRows[jobNumber]} timeout="auto" unmountOnExit>
                          <Box sx={{ margin: 1 }}>
                            <Table size="small" aria-label="purchases">
                              <TableHead>
                                <TableRow>
                                  <TableCell />
                                  <TableCell>Order</TableCell>
                                  <TableCell />
                                  <TableCell>Date</TableCell>
                                  <TableCell>Technician</TableCell>
                                  <TableCell />
                                  <TableCell>Invoice #</TableCell>
                                  <TableCell>Actions</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {sheets.map((historyRow) => (
                                  <TableRow key={historyRow.id}>
                                    <TableCell />
                                    <TableCell>{historyRow.orderType === 'S.L.A' ? 'S.L.A' : historyRow.orderValue}</TableCell>
                                    <TableCell />
                                    <TableCell>{formatDate(historyRow.date)}</TableCell>
                                    <TableCell>{historyRow.technicianName}</TableCell>
                                    <TableCell />
                                    <TableCell>{historyRow.invoiceNumber}</TableCell>
                                    <TableCell>
                                      <IconButton onClick={(e) => handleMenuClick(e, historyRow, true)}>
                                        <FlashOn />
                                      </IconButton>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                )})}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleView(selectedSheet)}>View</MenuItem>
        {selectedSheet?.status !== 'Invoiced' && <MenuItem onClick={() => handleEdit(selectedSheet)}>Edit</MenuItem>}
        {selectedSheet?.status !== 'Invoiced' && !isSubmenu && <MenuItem onClick={() => handleUpdateStatus(selectedSheet)}>Update Status</MenuItem>}
        {isSubmenu && <MenuItem onClick={() => handleDeleteClick(selectedSheet)} sx={{ color: 'error.main' }}>Delete</MenuItem>}
        {!isSubmenu && <MenuItem onClick={() => handleCancelClick(selectedSheet)} sx={{ color: 'error.main' }}>Cancel</MenuItem>}
      </Menu>
      <Dialog open={statusDialogOpen} onClose={handleStatusDialogClose}>
        <DialogTitle>Update Status</DialogTitle>
        <DialogContent>
          <InputLabel id="status-select-label">Status</InputLabel>
          <Select
            labelId="status-select-label"
            id="status-select"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            fullWidth
            margin="normal"
          >
            <MenuItem value="Open">Open</MenuItem>
            <MenuItem value="Pending Invoice">Pending Invoice</MenuItem>
            {user && !user.displayName && <MenuItem value="Invoiced">Invoiced</MenuItem>}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleStatusDialogClose}>Cancel</Button>
          <Button onClick={handleStatusSave}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Job Sheet</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this job sheet?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
      >
        <DialogTitle>Cancel Job</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to cancel this job?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>No</Button>
          <Button onClick={handleConfirmCancel} color="error">Yes</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={invoiceDialogOpen} onClose={() => setInvoiceDialogOpen(false)}>
        <DialogTitle>Enter Invoice Number</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="invoiceNumber"
            label="Invoice Number"
            type="text"
            fullWidth
            variant="standard"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInvoiceDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleInvoiceNumberSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ViewJobSheetPage;
