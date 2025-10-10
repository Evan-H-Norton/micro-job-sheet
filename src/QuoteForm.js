import React from 'react';
import { Typography, TextField, Button, Box, Autocomplete, Grid, Divider, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { TextareaAutosize } from '@mui/base/TextareaAutosize';
import { styled } from '@mui/system';
import { AddCircleOutline, RemoveCircleOutline } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const blue = {
    100: '#DAECFF',
    200: '#b6daff',
    400: '#3399FF',
    500: '#007FFF',
    600: '#0072E5',
    900: '#003A75',
};

const grey = {
    50: '#F3F6F9',
    100: '#E5EAF2',
    200: '#DAE2ED',
    300: '#C7D0DD',
    400: '#B0B8C4',
    500: '#9DA8B7',
    600: '#6B7A90',
    700: '#434D5B',
    800: '#303740',
    900: '#1C2025',
};

const StyledTextarea = styled(TextareaAutosize)(
    ({ theme }) => `
    width: 100%;
    font-family: IBM Plex Sans, sans-serif;
    font-size: 0.875rem;
    font-weight: 400;
    line-height: 1.5;
    padding: 8px 12px;
    border-radius: 8px;
    color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
    background: ${theme.palette.mode === 'dark' ? '#2e2e2e' : '#fff'};
    border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
    box-shadow: 0px 2px 2px ${theme.palette.mode === 'dark' ? grey[900] : grey[50]};
    resize: none;

    &:hover {
      border-color: ${blue[400]};
    }

    &:focus {
      border-color: ${blue[400]};
      box-shadow: 0 0 0 3px ${theme.palette.mode === 'dark' ? blue[600] : blue[200]};
    }

    // firefox
    &:focus-visible {
      outline: 0;
    }
  `,
);

function QuoteForm({
    onSubmit,
    isSmallScreen,
    companies,
    selectedCompany,
    handleCompanyChange,
    companyNameInput,
    handleCompanyInputChange,
    companyAddress,
    setCompanyAddress,
    companyTelephone,
    setCompanyTelephone,
    contactNameInput,
    setContactNameInput,
    contactCellphoneInput,
    setContactCellphoneInput,
    contactEmailInput,
    setContactEmailInput,
    selectedContact,
    setSelectedContact,
    user,
    items,
    setItems,
    comments,
    setComments,
    failure,
    setFailure,
    cause,
    setCause,
    recommendation,
    setRecommendation,
    documentType,
    isEditMode = false,
    viewMode = false,
}) {
    const theme = useTheme();
    const [openDeleteConfirmation, setOpenDeleteConfirmation] = React.useState(false);
    const [itemToDelete, setItemToDelete] = React.useState(null);

    const confirmDeleteItem = () => {
        if (itemToDelete !== null) {
            const newItems = [...items];
            newItems.splice(itemToDelete, 1);
            setItems(newItems);
            setItemToDelete(null);
        }
        setOpenDeleteConfirmation(false);
    };

    console.log("QuoteForm rendered");

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        if (field === 'quantity') {
            const intValue = parseInt(value, 10);
            newItems[index][field] = isNaN(intValue) ? 1 : Math.max(1, intValue);
        } else if (field === 'price') {
            const floatValue = parseFloat(value);
            newItems[index][field] = isNaN(floatValue) ? 0 : Math.max(0, floatValue);
        } else {
            newItems[index][field] = value;
        }
        setItems(newItems);
    };

    const handleAddItem = () => {
        setItems([...items, { description: '', quantity: 1, price: 0 }]);
    };

    const handleRemoveItem = (index) => {
        setItemToDelete(index);
        setOpenDeleteConfirmation(true);
    };

    const calculateTotal = () => {
        return items.reduce((total, item) => total + (item.quantity * item.price), 0);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(value);
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
        }
    };

    return (
        <Paper sx={{ p: 3, mt: 3, mb: 3 }}>
            <form onSubmit={onSubmit}>

                <Grid container display="flex" gap={2} flexWrap="nowrap" sx={{ mt: 2 }}>
                    <Grid item width="50%">
                        <Autocomplete
                            freeSolo
                            options={companies}
                            getOptionLabel={(option) => option.companyName || ''}
                            value={selectedCompany}
                            onChange={handleCompanyChange}
                            inputValue={companyNameInput}
                            onInputChange={handleCompanyInputChange}
                            readOnly={viewMode}
                            renderInput={(params) => (
                                <TextField {...params} label="Company Name" fullWidth required />
                            )}
                        />
                    </Grid>
                    <Grid item width="50%">
                        {selectedCompany && selectedCompany.contacts && selectedCompany.contacts.length > 1 ? (
                            <Autocomplete
                                options={selectedCompany.contacts}
                                getOptionLabel={(option) => option.name || ''}
                                value={selectedContact}
                                readOnly={viewMode}
                                onChange={(event, newValue) => {
                                    setSelectedContact(newValue);
                                    if (newValue) {
                                        setContactNameInput(newValue.name || '');
                                        setContactCellphoneInput(newValue.cellphone || '');
                                        setContactEmailInput(newValue.email || '');
                                    } else {
                                        setContactNameInput('');
                                        setContactCellphoneInput('');
                                        setContactEmailInput('');
                                    }
                                }}
                                renderInput={(params) => <TextField {...params} label="Contact Name" fullWidth />}
                            />
                        ) : (
                            <TextField
                                id="contact-name"
                                label="Contact Name"
                                fullWidth
                                value={contactNameInput}
                                onChange={(e) => setContactNameInput(e.target.value)}
                                InputProps={{ readOnly: viewMode }}
                            />
                        )}
                    </Grid>
                </Grid>
                
                <Grid container display="flex" gap={2} flexWrap="nowrap" sx={{ mt: 2 }}>
                    <Grid item width="50%">
                        <TextField
                            id="contact-cellphone"
                            label="Contact Cellphone"
                            fullWidth
                            value={contactCellphoneInput}
                            onChange={(e) => setContactCellphoneInput(e.target.value)}
                            InputProps={{ readOnly: viewMode }}
                        />
                    </Grid>
                    <Grid item width="50%">
                        <TextField
                            id="contact-email"
                            label="Contact Email"
                            type="email"
                            fullWidth
                            value={contactEmailInput}
                            onChange={(e) => setContactEmailInput(e.target.value)}
                            InputProps={{ readOnly: viewMode }}
                        />
                    </Grid>
                </Grid>
                
                <Grid container display="flex" gap={2} flexWrap="nowrap" sx={{ mt: 2 }}>
                    <Grid item width="50%">
                        <TextField
                            id="company-address"
                            label="Company Address"
                            fullWidth
                            value={companyAddress}
                            onChange={(e) => setCompanyAddress(e.target.value)}
                            InputProps={{ readOnly: viewMode }}
                        />
                    </Grid>
                    <Grid item width="50%">
                        <TextField
                            id="company-telephone"
                            label="Company Telephone"
                            fullWidth
                            value={companyTelephone}
                            onChange={(e) => setCompanyTelephone(e.target.value)}
                            InputProps={{ readOnly: viewMode }}
                        />
                    </Grid>
                </Grid>

                <Divider sx={{ my: 3, borderBottomWidth: 8 }} />

                {documentType.includes('Report') && (
                    <Box sx={{ border: '1px solid grey', borderRadius: '5px', p: 2, my: 2 }}>
                        <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', color: theme.palette.primary.main, textDecoration: 'underline' }}>Report</Typography>
                        <Typography variant="h6" gutterBottom>Failure</Typography>
                        <StyledTextarea
                            id="failure"
                            aria-label="Failure"
                            minRows={3}
                            placeholder="Describe the failure..."
                            value={failure}
                            onChange={(e) => setFailure(e.target.value)}
                            readOnly={viewMode}
                        />

                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Cause</Typography>
                        <StyledTextarea
                            id="cause"
                            aria-label="Cause"
                            minRows={3}
                            placeholder="Describe the cause..."
                            value={cause}
                            onChange={(e) => setCause(e.target.value)}
                            readOnly={viewMode}
                        />

                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Recommendation</Typography>
                        <StyledTextarea
                            id="recommendation"
                            aria-label="Recommendation"
                            minRows={3}
                            placeholder="Enter recommendations..."
                            value={recommendation}
                            onChange={(e) => setRecommendation(e.target.value)}
                            readOnly={viewMode}
                        />
                    </Box>
                )}

                {documentType.includes('Quotation') && (
                    <Box sx={{ border: '1px solid grey', borderRadius: '5px', p: 2, my: 2 }}>
                        <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', color: theme.palette.primary.main, textDecoration: 'underline' }}>Quotation</Typography>
                        <StyledTextarea
                            id="comments"
                            aria-label="Comments"
                            minRows={4}
                            placeholder="Add comments here..."
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            readOnly={viewMode}
                        />

                        <Divider sx={{ my: 3, borderBottomWidth: 8 }} />

                        <Typography variant="h6" gutterBottom>Items</Typography>
                        <TableContainer component={Paper} sx={{ mb: 2 }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ width: '55%' }}>Description</TableCell>
                                        <TableCell>Quantity</TableCell>
                                        <TableCell sx={{ minWidth: 100 }}>Price</TableCell>
                                        <TableCell sx={{ padding: 0 }}>Total</TableCell>
                                        {!viewMode && <TableCell sx={{ padding: 0 }}></TableCell>}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {items.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                                                <TextField
                                                    value={item.description}
                                                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                    onKeyDown={handleKeyDown}
                                                    fullWidth
                                                    multiline
                                                    InputProps={{ readOnly: viewMode }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                    onKeyDown={handleKeyDown}
                                                    InputProps={{ readOnly: viewMode }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ minWidth: 100 }}>
                                                <TextField
                                                    type="number"
                                                    value={item.price}
                                                    onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                                                    onKeyDown={handleKeyDown}
                                                    InputProps={{ readOnly: viewMode }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ padding: 0 }}>{formatCurrency(item.quantity * item.price)}</TableCell>
                                            {!viewMode && (
                                                <TableCell sx={{ padding: 0 }}>
                                                    <IconButton onClick={() => handleRemoveItem(index)}>
                                                        <RemoveCircleOutline />
                                                    </IconButton>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {!viewMode && <Button variant="outlined" onClick={handleAddItem} startIcon={<AddCircleOutline />}>Add Item</Button>}

                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                            <Typography variant="h6">Total: {formatCurrency(calculateTotal())}</Typography>
                        </Box>
                        <Typography variant="caption" display="block" sx={{ mt: 2, textAlign: 'center', fontStyle: 'italic' }}>
                            Due to fluctuations in exchange rates, Microfusion is unable to guarantee pricing beyond the validity period of the quotation or while stocks remain available. Prices are subject to change without prior notice. Should any quoted items be placed on back order, the prevailing rate of exchange will continue to apply.
                        </Typography>
                    </Box>
                )}

                {!viewMode && <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Button type="submit" variant="contained" color="primary" size="large">
                        {isEditMode ? 'Save Changes' : 'Create Quote'}
                    </Button>
                </Box>}
            </form>
        <Dialog
            open={openDeleteConfirmation}
            onClose={() => setOpenDeleteConfirmation(false)}
        >
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Are you sure you want to delete this item?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpenDeleteConfirmation(false)}>Cancel</Button>
                <Button onClick={confirmDeleteItem} autoFocus>
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
        </Paper>
    );
}

export default QuoteForm;
