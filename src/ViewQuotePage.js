
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Box, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Typography, useTheme, Select, InputLabel } from '@mui/material';
import { db } from './firebase';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { FlashOn } from '@mui/icons-material';
import toast from 'react-hot-toast';

function ViewQuotePage() {
  const [quotes, setQuotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuotes = async () => {
      const quotesCollection = collection(db, 'quotes');
      const quotesSnapshot = await getDocs(quotesCollection);
      const quotesList = quotesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const now = new Date();
      const threeDaysAgo = new Date(now.setDate(now.getDate() - 3));

      const updatedQuotes = await Promise.all(quotesList.map(async (quote) => {
        if (quote.status === 'Valid' && quote.createdAt && new Date(quote.createdAt.toDate()) < threeDaysAgo) {
          const quoteRef = doc(db, 'quotes', quote.id);
          await updateDoc(quoteRef, { status: 'Expired' });
          return { ...quote, status: 'Expired' };
        }
        return quote;
      }));

      setQuotes(updatedQuotes);
    };
    fetchQuotes();
  }, []);

  const handleMenuClick = (event, quote) => {
    setAnchorEl(event.currentTarget);
    setSelectedQuote(quote);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedQuote(null);
  };

  const handleView = (quote) => {
    if (quote) {
      navigate(`/quote/${quote.id}`);
      handleMenuClose();
    }
  };

  const handleEdit = (quote) => {
    if (quote) {
      navigate(`/quote/edit/${quote.id}`);
      handleMenuClose();
    }
  };

  const handleUpdateStatus = (quote) => {
    if (quote) {
      setSelectedQuote(quote);
      setNewStatus(quote.status || 'Valid');
      setStatusDialogOpen(true);
      setAnchorEl(null);
    }
  };

  const handleStatusDialogClose = () => {
    setStatusDialogOpen(false);
    setSelectedQuote(null);
  };

  const handleStatusSave = async () => {
    if (!selectedQuote) return;

    const quoteRef = doc(db, 'quotes', selectedQuote.id);
    const promise = updateDoc(quoteRef, { status: newStatus });

    toast.promise(promise, {
      loading: 'Updating status...',
      success: () => {
        const updatedQuotes = quotes.map(quote =>
          quote.id === selectedQuote.id ? { ...quote, status: newStatus } : quote
        );
        setQuotes(updatedQuotes);
        handleStatusDialogClose();
        return 'Status updated successfully!';
      },
      error: (err) => `Failed to update status: ${err.toString()}`,
    });
  };

  const handleDeleteClick = (quote) => {
    setSelectedQuote(quote);
    setDeleteDialogOpen(true);
    setAnchorEl(null);
  };

  const handleDelete = async () => {
    if (!selectedQuote) return;
    const quoteRef = doc(db, 'quotes', selectedQuote.id);
    const promise = deleteDoc(quoteRef);

    toast.promise(promise, {
      loading: 'Deleting quote...',
      success: () => {
        const updatedQuotes = quotes.filter(quote => quote.id !== selectedQuote.id);
        setQuotes(updatedQuotes);
        setDeleteDialogOpen(false);
        setSelectedQuote(null);
        return 'Quote deleted successfully!';
      },
      error: (err) => `Failed to delete quote: ${err.toString()}`,
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

  const formatQuoteNumber = (quote) => {
    if (!quote || !quote.quoteNumber) return '';
    const number = String(quote.quoteNumber).padStart(4, '0');
    if (quote.documentType === 'Report') {
        return `R-${number}`;
    } else if (quote.documentType === 'Report and Quotation') {
        return `RQ-${number}`;
    } else {
        return `Q-${number}`;
    }
  };

  const filteredQuotes = quotes.filter(quote => {
    const searchTermMatch =
      (quote.companyName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (quote.quoteNumber?.toString() || '').includes(searchTerm);

    return searchTermMatch;
  });

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
        Quotes
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Quote Number</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredQuotes.map((quote) => (
              <TableRow key={quote.id}>
                <TableCell>{formatQuoteNumber(quote)}</TableCell>
                <TableCell>{formatDate(quote.date)}</TableCell>
                <TableCell>{quote.companyName}</TableCell>
                <TableCell>{quote.quoteTitle}</TableCell>
                <TableCell>{quote.status}</TableCell>
                <TableCell>
                  <IconButton onClick={(e) => handleMenuClick(e, quote)}>
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
        <MenuItem onClick={() => handleView(selectedQuote)}>View</MenuItem>
        <MenuItem onClick={() => handleEdit(selectedQuote)}>Edit</MenuItem>
        <MenuItem onClick={() => handleUpdateStatus(selectedQuote)}>Update Status</MenuItem>
        <MenuItem onClick={() => handleDeleteClick(selectedQuote)} sx={{ color: 'error.main' }}>Delete</MenuItem>
      </Menu>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Quote</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this quote?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

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
            <MenuItem value="Valid">Valid</MenuItem>
            <MenuItem value="Expired">Expired</MenuItem>
            <MenuItem value="Accepted">Accepted</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleStatusDialogClose}>Cancel</Button>
          <Button onClick={handleStatusSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ViewQuotePage;
