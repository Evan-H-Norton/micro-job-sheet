import React, { useState, useEffect, useContext } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Box, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Select, InputLabel, Typography, useTheme } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { db } from './firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { FlashOn } from '@mui/icons-material';
import { AuthContext } from './App';
import toast from 'react-hot-toast';
import JobSheetRow from './JobSheetRow';

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
  const [isCompletedMenu, setIsCompletedMenu] = useState(false);
  const [openJobsSortField, setOpenJobsSortField] = useState('jobNumber');
  const [openJobsSortDirection, setOpenJobsSortDirection] = useState('asc');
  const [completedJobsSortField, setCompletedJobsSortField] = useState('jobNumber');
  const [completedJobsSortDirection, setCompletedJobsSortDirection] = useState('asc');
  const theme = useTheme();

  const navigate = useNavigate();

  const handleOpenJobsSort = (field) => {
    if (openJobsSortField === field) {
      setOpenJobsSortDirection(openJobsSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setOpenJobsSortField(field);
      setOpenJobsSortDirection('asc');
    }
  };

  const handleCompletedJobsSort = (field) => {
    if (completedJobsSortField === field) {
      setCompletedJobsSortDirection(completedJobsSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setCompletedJobsSortField(field);
      setCompletedJobsSortDirection('asc');
    }
  };

  const sortData = (data, field, direction) => {
    if (!field) {
      return data;
    }

    return [...data].sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];

      // Handle specific field types if necessary (e.g., dates, numbers)
      if (field === 'date') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (field === 'jobNumber' || field === 'orderValue' || field === 'invoiceNumber') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else {
        // Default to string comparison for other fields
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (aValue < bValue) {
        return direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

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

  const handleMenuClick = (event, sheet, isSub = false, isCompleted = false) => {
    setAnchorEl(event.currentTarget);
    setSelectedSheet(sheet);
    setIsSubmenu(isSub);
    setIsCompletedMenu(isCompleted);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSheet(null);
    setIsCompletedMenu(false);
  };

  const handleView = (sheet) => {
    if (sheet) {
      navigate(`/job-sheet/${sheet.id}`, { state: { direction: 'up' } });
      handleMenuClose();
    }
  };

  const handleEdit = (sheet) => {
    if (sheet) {
      navigate(`/job-sheet/edit/${sheet.id}`, { state: { direction: 'up' } });
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
      if (selectedSheet.invoiceNumber) {
        const promises = sheetsToUpdate.map(sheet => {
          const jobSheetRef = doc(db, 'jobSheets', sheet.id);
          return updateDoc(jobSheetRef, { status: 'Invoiced' });
        });

        const promise = Promise.all(promises);

        toast.promise(promise, {
          loading: 'Updating status...',
          success: () => {
            const updatedJobSheets = jobSheets.map(sheet =>
              sheet.jobNumber === selectedSheet.jobNumber ? { ...sheet, status: 'Invoiced' } : sheet
            );
            setJobSheets(updatedJobSheets);
            handleStatusDialogClose();
            return 'Status updated successfully!';
          },
          error: (err) => `Failed to update status: ${err.toString()}`,
        });
      } else {
        setStatusDialogOpen(false);
        setInvoiceDialogOpen(true);
      }
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

  const formatJobNumber = (jobNumber) => {
    if (!jobNumber) return '';
    return `J-${String(jobNumber).padStart(4, '0')}`;
  };

  const filteredJobSheets = jobSheets.filter(sheet => {
    const searchTermMatch =
      (sheet.companyName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (sheet.jobNumber?.toString() || '').includes(searchTerm) ||
      (sheet.orderType?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (sheet.orderValue?.toString() || '').includes(searchTerm) ||
      (sheet.technicianName?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    if (user && user.displayName) {
      return searchTermMatch && sheet.technicianName === user.displayName && (sheet.status === 'Open' || sheet.status === 'In Progress');
    } else {
      return searchTermMatch && (sheet.status === 'Pending Invoice' || sheet.status === 'In Progress');
    }
  });

  const sortedFilteredJobSheets = sortData(filteredJobSheets, openJobsSortField, openJobsSortDirection);

  const groupedFilteredJobSheets = [];
  let currentJobNumberFiltered = null;
  for (const sheet of sortedFilteredJobSheets) {
    if (sheet.jobNumber !== currentJobNumberFiltered) {
      groupedFilteredJobSheets.push([]);
      currentJobNumberFiltered = sheet.jobNumber;
    }
    groupedFilteredJobSheets[groupedFilteredJobSheets.length - 1].push(sheet);
  }

  const sortedInvoicedJobSheets = sortData(invoicedJobSheets, completedJobsSortField, completedJobsSortDirection);

  const groupedInvoicedJobSheets = [];
  let currentJobNumberInvoiced = null;
  for (const sheet of sortedInvoicedJobSheets) {
    if (sheet.jobNumber !== currentJobNumberInvoiced) {
      groupedInvoicedJobSheets.push([]);
      currentJobNumberInvoiced = sheet.jobNumber;
    }
    groupedInvoicedJobSheets[groupedInvoicedJobSheets.length - 1].push(sheet);
  }

  const toggleRow = (jobNumber) => {
    setOpenRows(prevOpenRows => ({ ...prevOpenRows, [jobNumber]: !prevOpenRows[jobNumber] }));
  };

  

  return (
    <Box sx={{ maxWidth: 'lg', margin: 'auto' }}>
        <Box sx={{
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            bgcolor: theme.palette.background.paper,
            p: 2
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
                <Button variant="outlined" onClick={() => navigate('/')}>Back</Button>
            </Box>
            <TextField
                id="search"
                label="Search"
                variant="outlined"
                fullWidth
                margin="normal"
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </Box>
      <Typography variant="h5" gutterBottom sx={{ textAlign: 'center' }}>
        {user?.displayName ? 'Active Jobs' : 'Invoiceable Jobs'}
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '15%' }} onClick={() => handleOpenJobsSort('jobNumber')}>
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  Job Number
                  {openJobsSortField === 'jobNumber' && (openJobsSortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />)}
                </Box>
              </TableCell>
              <TableCell sx={{ width: '15%' }} onClick={() => handleOpenJobsSort('date')}>
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  Date
                  {openJobsSortField === 'date' && (openJobsSortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />)}
                </Box>
              </TableCell>
              <TableCell sx={{ width: '25%' }} onClick={() => handleOpenJobsSort('companyName')}>
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  Client
                  {openJobsSortField === 'companyName' && (openJobsSortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />)}
                </Box>
              </TableCell>
              <TableCell sx={{ width: '15%' }} onClick={() => handleOpenJobsSort('orderValue')}>
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  Order
                  {openJobsSortField === 'orderValue' && (openJobsSortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />)}
                </Box>
              </TableCell>
              <TableCell sx={{ width: '15%' }} onClick={() => handleOpenJobsSort('technicianName')}>
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  Technician
                  {openJobsSortField === 'technicianName' && (openJobsSortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />)}
                </Box>
              </TableCell>
              <TableCell sx={{ width: '10%' }} onClick={() => handleOpenJobsSort('status')}>
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  Status
                  {openJobsSortField === 'status' && (openJobsSortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />)}
                </Box>
              </TableCell>
              <TableCell sx={{ width: '5%' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {groupedFilteredJobSheets.map((sheets) => {
              const multipleOrderTypes = new Set(sheets.map(s => s.orderType)).size > 1;
              return (
              <React.Fragment key={sheets[0].jobNumber}>
                <TableRow sx={{ backgroundColor: 'inherit' }}>
                  <TableCell sx={{ width: '15%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => toggleRow(sheets[0].jobNumber)}
                        style={{ visibility: sheets.length > 1 ? 'visible' : 'hidden' }}
                      >
                        {openRows[sheets[0].jobNumber] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                      </IconButton>
                      {formatJobNumber(sheets[0].jobNumber)}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ width: '15%' }}>{formatDate(sheets[0].date)}</TableCell>
                  <TableCell sx={{ width: '25%' }}>{sheets[0].companyName}</TableCell>
                  <TableCell sx={{ width: '15%' }}>{multipleOrderTypes ? 'Multi-Sheet' : (sheets[0].orderType === 'S.L.A' ? 'S.L.A' : sheets[0].orderValue)}</TableCell>
                  <TableCell sx={{ width: '15%' }}>{sheets[0].technicianName}</TableCell>
                  <TableCell sx={{ width: '10%' }}>{sheets[0].status}</TableCell>
                  <TableCell sx={{ width: '5%' }}>
                    <IconButton onClick={(e) => handleMenuClick(e, sheets[0], false, false)}>
                      <FlashOn />
                    </IconButton>
                  </TableCell>
                </TableRow>
                {openRows[sheets[0].jobNumber] && sheets.map((sheet) => (
                  <JobSheetRow key={sheet.id} sheet={sheet} handleMenuClick={handleMenuClick} formatDate={formatDate} theme={theme} isCompletedJobsTable={false} />
                ))}
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
                  <TableCell sx={{ width: '14%' }} onClick={() => handleCompletedJobsSort('jobNumber')}>
                    <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      Job Number
                      {completedJobsSortField === 'jobNumber' && (completedJobsSortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />)}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ width: '14%' }} onClick={() => handleCompletedJobsSort('date')}>
                    <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      Date
                      {completedJobsSortField === 'date' && (completedJobsSortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />)}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ width: '22%' }} onClick={() => handleCompletedJobsSort('companyName')}>
                    <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      Client
                      {completedJobsSortField === 'companyName' && (completedJobsSortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />)}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ width: '14%' }} onClick={() => handleCompletedJobsSort('orderValue')}>
                    <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      Order
                      {completedJobsSortField === 'orderValue' && (completedJobsSortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />)}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ width: '14%' }} onClick={() => handleCompletedJobsSort('technicianName')}>
                    <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      Technician
                      {completedJobsSortField === 'technicianName' && (completedJobsSortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />)}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ width: '9%' }} onClick={() => handleCompletedJobsSort('invoiceNumber')}>
                    <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      Invoice #
                      {completedJobsSortField === 'invoiceNumber' && (completedJobsSortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />)}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ width: '10%' }} onClick={() => handleCompletedJobsSort('status')}>
                    <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      Status
                      {completedJobsSortField === 'status' && (completedJobsSortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />)}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ width: '7%' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {groupedInvoicedJobSheets.map((sheets) => {
                  const jobNumber = sheets[0].jobNumber; // Get jobNumber from the first sheet in the group
                  const multipleOrderTypes = new Set(sheets.map(s => s.orderType)).size > 1;
                  return (
                  <React.Fragment key={jobNumber}>
                    <TableRow sx={{ backgroundColor: 'inherit' }}>
                      <TableCell sx={{ width: '14%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={() => toggleRow(jobNumber)}
                            style={{ visibility: sheets.length > 1 ? 'visible' : 'hidden' }}
                          >
                            {openRows[jobNumber] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                          </IconButton>
                          {formatJobNumber(jobNumber)}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ width: '14%' }}>{formatDate(sheets[0].date)}</TableCell>
                      <TableCell sx={{ width: '22%' }}>{sheets[0].companyName}</TableCell>
                      <TableCell sx={{ width: '14%' }}>{multipleOrderTypes ? 'Multi-Sheet' : (sheets[0].orderType === 'S.L.A' ? 'S.L.A' : sheets[0].orderValue)}</TableCell>
                      <TableCell sx={{ width: '14%' }}>{sheets[0].technicianName}</TableCell>
                      <TableCell sx={{ width: '9%' }}>{sheets[0].invoiceNumber}</TableCell>
                      <TableCell sx={{ width: '10%' }}>{sheets[0].status}</TableCell>
                      <TableCell sx={{ width: '7%' }}>
                        <IconButton onClick={(e) => handleMenuClick(e, sheets[0], false, true)}>
                          <FlashOn />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    {openRows[sheets[0].jobNumber] && sheets.map((sheet) => (
                      <JobSheetRow key={sheet.id} sheet={sheet} handleMenuClick={handleMenuClick} formatDate={formatDate} theme={theme} isCompletedJobsTable={true} />
                    ))}
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
        {!isCompletedMenu && selectedSheet?.status !== 'Invoiced' && <MenuItem onClick={() => handleEdit(selectedSheet)}>Edit</MenuItem>}
        {!isCompletedMenu && selectedSheet?.status !== 'Invoiced' && !isSubmenu && <MenuItem onClick={() => handleUpdateStatus(selectedSheet)}>Update Status</MenuItem>}
        {!isCompletedMenu && isSubmenu && <MenuItem onClick={() => handleDeleteClick(selectedSheet)} sx={{ color: 'error.main' }}>Delete</MenuItem>}
        {!isCompletedMenu && !isSubmenu && <MenuItem onClick={() => handleCancelClick(selectedSheet)} sx={{ color: 'error.main' }}>Cancel</MenuItem>}
      </Menu>
      <Dialog open={statusDialogOpen} onClose={handleStatusDialogClose} fullWidth maxWidth="sm">
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
            <MenuItem value="In Progress">In Progress</MenuItem>
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
    </Box>
  );
}

export default ViewJobSheetPage;
