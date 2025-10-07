import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, IconButton, TextField, Typography, Box
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { db } from './firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const PartsPage = ({ open, onClose, jobSheetId, jobNumber, currentSheetIndex, viewMode = false, jobSheets = [], parts: localParts, setParts: setLocalParts }) => {
    const [parts, setParts] = useState([]);

    useEffect(() => {
        if (localParts) {
            setParts(localParts);
        }
    }, [localParts]);

    const [showAllParts, setShowAllParts] = useState(false);
    const [partToDelete, setPartToDelete] = useState(null);

    const toggleShowAllParts = () => setShowAllParts(!showAllParts);



    const handleAddPart = async () => {
        const newPartData = { quantity: 1, description: '', price: '' };
        if (setLocalParts) {
            setLocalParts([...parts, { ...newPartData, id: Date.now() }]);
        } else if (jobSheetId && jobNumber) {
            const docRef = await addDoc(collection(db, 'parts'), { ...newPartData, jobSheetId, jobNumber });
            setParts([...parts, { ...newPartData, id: docRef.id }]);
        }
    };

    const handlePartChange = (id, field, value) => {
        const updatedParts = parts.map(part => {
            if (part.id === id) {
                if (field === 'price') {
                    const numericValue = value.replace(/[^0-9.]/g, '');
                    return { ...part, [field]: numericValue };
                } else if (field === 'quantity') {
                    const intValue = Math.max(1, parseInt(value, 10) || 1);
                    return { ...part, [field]: intValue };
                }
                return { ...part, [field]: value };
            }
            return part;
        });

        if (setLocalParts) {
            setLocalParts(updatedParts);
        } else {
            setParts(updatedParts);
        }
    };

    const handlePartBlur = async (id, field, value) => {
        if (setLocalParts) return;
        const partRef = doc(db, 'parts', id);
        await updateDoc(partRef, { [field]: value });
    };

    const handleRemovePartClick = (id) => {
        setPartToDelete(id);
    };

    const handleRemovePart = async () => {
        if (partToDelete) {
            if (setLocalParts) {
                setLocalParts(parts.filter(part => part.id !== partToDelete));
            } else {
                await deleteDoc(doc(db, 'parts', partToDelete));
                setParts(parts.filter(part => part.id !== partToDelete));
            }
            setPartToDelete(null);
        }
    };

    const calculateTotal = () => {
        return parts.reduce((total, part) => total + (Number(part.quantity) * Number(part.price)), 0);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(value);
    };

    const groupedParts = parts.reduce((acc, part) => {
        const sheetId = part.jobSheetId || 'unsorted';
        if (!acc[sheetId]) {
            acc[sheetId] = [];
        }
        acc[sheetId].push(part);
        return acc;
    }, {});

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                Parts for Job # {jobNumber}, <span onClick={toggleShowAllParts} style={{cursor: 'pointer', textDecoration: showAllParts ? 'line-through' : 'none'}}>Sheet {currentSheetIndex + 1}</span>
            </DialogTitle>
            <DialogContent>
                {showAllParts ? (
                    Object.entries(groupedParts).sort(([sheetIdA], [sheetIdB]) => {
                        const sheetIndexA = jobSheets.findIndex(sheet => sheet.id === sheetIdA);
                        const sheetIndexB = jobSheets.findIndex(sheet => sheet.id === sheetIdB);
                        return sheetIndexA - sheetIndexB;
                    }).map(([sheetId, sheetParts]) => {
                        const sheetIndex = jobSheets.findIndex(sheet => sheet.id === sheetId);
                        return (
                            <Box key={sheetId} mb={4}>
                                <Typography variant="h6" gutterBottom>Sheet {sheetIndex !== -1 ? sheetIndex + 1 : 'N/A'}</Typography>
                                <TableContainer component={Paper}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ width: '15%' }}>Quantity</TableCell>
                                                <TableCell sx={{ width: '60%' }}>Part Description</TableCell>
                                                <TableCell sx={{ width: '15%' }}>Price excl.</TableCell>
                                                {!viewMode && <TableCell sx={{ width: '10%' }}>Action</TableCell>}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {sheetParts.map((part) => (
                                                <TableRow key={part.id}>
                                                    <TableCell sx={{ width: '15%' }}>
                                                        <TextField
                                                            type="number"
                                                            value={part.quantity}
                                                            onChange={(e) => handlePartChange(part.id, 'quantity', e.target.value)}
                                                            onBlur={(e) => handlePartBlur(part.id, 'quantity', e.target.value)}
                                                            inputProps={{ min: 1, readOnly: viewMode }}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ width: '60%' }}>
                                                        <TextField
                                                            value={part.description}
                                                            onChange={(e) => handlePartChange(part.id, 'description', e.target.value)}
                                                            onBlur={(e) => handlePartBlur(part.id, 'description', e.target.value)}
                                                            fullWidth
                                                            InputProps={{ readOnly: viewMode }}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ width: '15%' }}>
                                                        <TextField
                                                            value={part.price}
                                                            onChange={(e) => handlePartChange(part.id, 'price', e.target.value)}
                                                            onBlur={(e) => handlePartBlur(part.id, 'price', e.target.value)}
                                                            InputProps={{ readOnly: viewMode }}
                                                        />
                                                    </TableCell>
                                                    {!viewMode && (
                                                        <TableCell sx={{ width: '10%' }}>
                                                            <IconButton onClick={() => handleRemovePartClick(part.id)}>
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        );
                    })
                ) : (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ width: '15%' }}>Quantity</TableCell>
                                    <TableCell sx={{ width: '60%' }}>Part Description</TableCell>
                                    <TableCell sx={{ width: '15%' }}>Price excl.</TableCell>
                                    {!viewMode && <TableCell sx={{ width: '10%' }}>Action</TableCell>}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {parts.map((part) => (
                                    <TableRow key={part.id}>
                                        <TableCell sx={{ width: '15%' }}>
                                            <TextField
                                                type="number"
                                                value={part.quantity}
                                                onChange={(e) => handlePartChange(part.id, 'quantity', e.target.value)}
                                                onBlur={(e) => handlePartBlur(part.id, 'quantity', e.target.value)}
                                                inputProps={{ min: 1, readOnly: viewMode }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ width: '60%' }}>
                                            <TextField
                                                value={part.description}
                                                onChange={(e) => handlePartChange(part.id, 'description', e.target.value)}
                                                onBlur={(e) => handlePartBlur(part.id, 'description', e.target.value)}
                                                fullWidth
                                                InputProps={{ readOnly: viewMode }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ width: '15%' }}>
                                            <TextField
                                                value={part.price}
                                                onChange={(e) => handlePartChange(part.id, 'price', e.target.value)}
                                                onBlur={(e) => handlePartBlur(part.id, 'price', e.target.value)}
                                                InputProps={{ readOnly: viewMode }}
                                            />
                                        </TableCell>
                                        {!viewMode && (
                                            <TableCell sx={{ width: '10%' }}>
                                                <IconButton onClick={() => handleRemovePartClick(part.id)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Typography variant="h6">
                        Total: {formatCurrency(calculateTotal())}
                    </Typography>
                </Box>
                {!viewMode && (
                    <Box sx={{ mt: 2 }}>
                        <Button onClick={handleAddPart} startIcon={<AddIcon />} variant="contained">
                            Add Part
                        </Button>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="outlined">Close</Button>
            </DialogActions>
            <Dialog open={!!partToDelete} onClose={() => setPartToDelete(null)}>
                <DialogTitle>Delete Part</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this part?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPartToDelete(null)}>Cancel</Button>
                    <Button onClick={handleRemovePart} color="error">Delete</Button>
                </DialogActions>
            </Dialog>
        </Dialog>
    );
};

export default PartsPage;