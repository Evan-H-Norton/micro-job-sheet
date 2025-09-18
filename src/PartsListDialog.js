
import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, IconButton, TextField, Typography, Box
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const PartsListDialog = ({ open, onClose, parts, setParts }) => {
    const [newPart, setNewPart] = useState({ quantity: 1, description: '', price: '' });

    const handleAddPart = () => {
        setParts([...parts, { ...newPart, id: Date.now() }]);
        setNewPart({ quantity: 1, description: '', price: '' });
    };

    const handlePartChange = (index, field, value) => {
        const updatedParts = [...parts];
        if (field === 'price') {
            const numericValue = value.replace(/[^0-9.]/g, '');
            updatedParts[index][field] = numericValue;
        } else {
            updatedParts[index][field] = value;
        }
        setParts(updatedParts);
    };

    const handleRemovePart = (index) => {
        const updatedParts = parts.filter((_, i) => i !== index);
        setParts(updatedParts);
    };

    const calculateTotal = () => {
        return parts.reduce((total, part) => total + (part.quantity * part.price), 0);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(value);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Parts List</DialogTitle>
            <DialogContent>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ width: '15%' }}>Quantity</TableCell>
                                <TableCell sx={{ width: '60%' }}>Part Description</TableCell>
                                <TableCell sx={{ width: '15%' }}>Price excl.</TableCell>
                                <TableCell sx={{ width: '10%' }}>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {parts.map((part, index) => (
                                <TableRow key={part.id}>
                                    <TableCell sx={{ width: '15%' }}>
                                        <TextField
                                            type="number"
                                            value={part.quantity}
                                            onChange={(e) => handlePartChange(index, 'quantity', e.target.value)}
                                            inputProps={{ min: 1 }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ width: '60%' }}>
                                        <TextField
                                            value={part.description}
                                            onChange={(e) => handlePartChange(index, 'description', e.target.value)}
                                            fullWidth
                                        />
                                    </TableCell>
                                    <TableCell sx={{ width: '15%' }}>
                                        <TextField
                                            value={part.price}
                                            onChange={(e) => handlePartChange(index, 'price', e.target.value)}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ width: '10%' }}>
                                        <IconButton onClick={() => handleRemovePart(index)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Typography variant="h6">
                        Total: {formatCurrency(calculateTotal())}
                    </Typography>
                </Box>
                <Box sx={{ mt: 2 }}>
                    <Button onClick={handleAddPart} startIcon={<AddIcon />} variant="contained">
                        Add Part
                    </Button>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="outlined">Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default PartsListDialog;
