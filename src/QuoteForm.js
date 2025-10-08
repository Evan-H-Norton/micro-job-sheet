import React from 'react';
import { Typography, TextField, Button, Box, Autocomplete, Grid, Divider, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton } from '@mui/material';
import { AddCircleOutline, RemoveCircleOutline } from '@mui/icons-material';

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
    isEditMode = false,
    viewMode = false,
}) {
    console.log("QuoteForm rendered");

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const handleAddItem = () => {
        setItems([...items, { description: '', quantity: 1, price: 0 }]);
    };

    const handleRemoveItem = (index) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const calculateTotal = () => {
        return items.reduce((total, item) => total + (item.quantity * item.price), 0);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(value);
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

                {/* The 'Comments' title has been removed from above this text field. */}
                <TextField
                    id="comments"
                    label="Comments"
                    multiline
                    rows={4}
                    fullWidth
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    InputProps={{ readOnly: viewMode }}
                />

                <Divider sx={{ my: 3, borderBottomWidth: 8 }} />

                <Typography variant="h6" gutterBottom>Items</Typography>
                <TableContainer component={Paper} sx={{ mb: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Description</TableCell>
                                <TableCell>Quantity</TableCell>
                                <TableCell>Price</TableCell>
                                <TableCell>Total</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((item, index) => (
                                <TableRow key={index}>
                                    {/* The background color is set to a light blue similar to the company logo. */}
                                    <TableCell>
                                        <TextField
                                            value={item.description}
                                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                            fullWidth
                                            InputProps={{ readOnly: viewMode }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value, 10))}
                                            fullWidth
                                            InputProps={{ readOnly: viewMode }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            type="number"
                                            value={item.price}
                                            onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value))}
                                            fullWidth
                                            InputProps={{ readOnly: viewMode }}
                                        />
                                    </TableCell>
                                    <TableCell>{formatCurrency(item.quantity * item.price)}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleRemoveItem(index)} disabled={viewMode}>
                                            <RemoveCircleOutline />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {!viewMode && <Button variant="outlined" onClick={handleAddItem} startIcon={<AddCircleOutline />}>Add Item</Button>}

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Typography variant="h6">Total: {formatCurrency(calculateTotal())}</Typography>
                </Box>

                {!viewMode && <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Button type="submit" variant="contained" color="primary" size="large">
                        {isEditMode ? 'Save Changes' : 'Create Quote'}
                    </Button>
                </Box>}
            </form>
        </Paper>
    );
}

export default QuoteForm;
