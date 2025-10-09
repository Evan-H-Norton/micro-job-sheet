
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Box, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Typography, useTheme } from '@mui/material';
import { db } from './firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { FlashOn } from '@mui/icons-material';
import toast from 'react-hot-toast';

function ViewQuotePage() {
  const [quotes, setQuotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuotes = async () => {
      const quotesCollection = collection(db, 'quotes');
      const quotesSnapshot = await getDocs(quotesCollection);
      const quotesList = quotesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQuotes(quotesList);
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

  const formatQuoteNumber = (quoteNumber) => {
    if (!quoteNumber) return '';
    return `Q-${String(quoteNumber).padStart(4, '0')}`;
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
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredQuotes.map((quote) => (
              <TableRow key={quote.id}>
                <TableCell>{formatQuoteNumber(quote.quoteNumber)}</TableCell>
                <TableCell>{formatDate(quote.date)}</TableCell>
                <TableCell>{quote.companyName}</TableCell>
                <TableCell>{quote.quoteTitle}</TableCell>
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
    </Box>
  );
}

export default ViewQuotePage;
