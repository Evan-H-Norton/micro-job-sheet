import React from 'react';
import { Typography, TextField, Button, Box, Autocomplete, Grid, Divider, Paper, FormControl, InputLabel, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Checkbox, FormControlLabel, IconButton } from '@mui/material';
import { TextareaAutosize } from '@mui/base/TextareaAutosize';
import { styled } from '@mui/system';
import { AddCircleOutline, RemoveCircleOutline } from '@mui/icons-material';
import SignaturePadWrapper from './SignaturePad';

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

function JobSheetForm({
    jobSheetData,
    onJobSheetDataChange,
    onSubmit,
    isSmallScreen,
    orderType,
    setOrderType,
    orderValue,
    setOrderValue,
    tasks,
    setTasks,
    outstanding,
    setOutstanding,
    status,
    invoiceNumber,
    setInvoiceNumber,
    faultComplaint,
    setFaultComplaint,
    workCarriedOut,
    setWorkCarriedOut,
    arrivalTime,
    setArrivalTime,
    departureTime,
    setDepartureTime,
    totalTime,
    labourCharge,
    setLabourCharge,
    technicianName,
    setTechnicianName,
    technicianSignature,
    setTechnicianSignature,
    customerName,
    setCustomerName,
    customerSignature,
    setCustomerSignature,
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
    orderTypeInputRef,
    user,
    showSignaturePad,
    setShowSignaturePad,
    signatureTarget,
    setSignatureTarget,
    date,
    setDate,
    jobNumber,
    isEditMode = false,
    viewMode = false,
    callout,
    setCallout,
    collectionDelivery,
    setCollectionDelivery,
    noCharge,
    setNoCharge,
    remote,
    setRemote,
    partsCharge,
}) {



    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(value);
    };

    const formatJobNumber = (jobNumber) => {
        if (!jobNumber) return '';
        return `J-${String(jobNumber).padStart(4, '0')}`;
    };

    return (
        <Paper sx={{ p: 3, mt: 3, mb: 3 }}>
            <form onSubmit={onSubmit}>
                <Grid container display="flex" gap={2} flexWrap="nowrap">
                    <Grid item width="33.333%">
                        <TextField
                            id="job-number"
                            label={isSmallScreen ? "Job #" : "Job Number"}
                            value={formatJobNumber(jobNumber)}
                            InputProps={{ readOnly: true }}
                            fullWidth
                        />
                    </Grid>
                    <Grid item width={isSmallScreen && !orderType ? '41.666%' : '33.333%'}>
                        <Autocomplete
                            options={['Order #', 'S.L.A']}
                            value={orderType}
                            onChange={(event, newValue) => {
                                setOrderType(newValue);
                                setOrderValue('');
                                if (newValue === 'S.L.A') {
                                    orderTypeInputRef.current.blur();
                                    if (tasks.length === 0) {
                                        const taskNames = [
                                            'Client Logbook Check',
                                            'OS S/P(s) Update',
                                            'AS S/P(s) Update',
                                            'Sys *.tmp cleanup (All)',
                                            'Anti-Virus Update',
                                            'Data Backup Check',
                                            'Internet/Mail Check',
                                            'NAS - Check / Update',
                                            'Unifi - Check / Update',
                                        ];
                                        setTasks(taskNames.map(task => ({
                                            task,
                                            notes: '',
                                            check: '',
                                        })));
                                    }
                                    setFaultComplaint('');
                                    setWorkCarriedOut('');
                                } else if (newValue === 'Order #') {
                                    setTasks([]);
                                    setOutstanding('');
                                }
                            }}
                            onInputChange={(event, newInputValue, reason) => {
                                if (reason === 'input' && orderType === 'Order #') {
                                    setOrderValue(newInputValue);
                                }
                            }}
                            inputValue={orderValue}
                            freeSolo
                            readOnly={viewMode}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    inputRef={orderTypeInputRef}
                                    label={orderType || 'Order Type'}
                                    InputProps={{
                                        ...params.InputProps,
                                        readOnly: orderType === 'S.L.A' || viewMode,
                                    }}
                                />
                            )}
                            fullWidth
                        />
                    </Grid>
                    <Grid item width="33.333%">
                        <TextField
                            id="date"
                            label="Date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            InputProps={{ readOnly: viewMode }}
                            fullWidth
                        />
                    </Grid>
                </Grid>

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

                {orderType === 'Order #' ? (
                    <>
                        <StyledTextarea
                            id="fault-complaint"
                            aria-label="Fault/Complaint"
                            minRows={4}
                            placeholder="Fault/Complaint"
                            value={faultComplaint}
                            onChange={(e) => setFaultComplaint(e.target.value)}
                            readOnly={viewMode}
                        />
                        <StyledTextarea
                            id="work-carried-out"
                            aria-label="Work Carried Out"
                            minRows={4}
                            placeholder="Work Carried Out"
                            value={workCarriedOut}
                            onChange={(e) => setWorkCarriedOut(e.target.value)}
                            readOnly={viewMode}
                        />

                    </>
                ) : (
                    <>
                        <TableContainer component={Paper} sx={{ my: 3 }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Task</TableCell>
                                        <TableCell>Additional Notes</TableCell>
                                        <TableCell>Check</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {tasks.map((row, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{row.task}</TableCell>
                                            <TableCell>
                                                <TextField
                                                    value={row.notes}
                                                    onChange={(e) => {
                                                        const newTasks = [...tasks];
                                                        newTasks[index].notes = e.target.value;
                                                        setTasks(newTasks);
                                                    }}
                                                    fullWidth
                                                    InputProps={{ readOnly: viewMode }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <FormControl fullWidth>
                                                    <InputLabel id={`check-label-${index}`}>Check</InputLabel>
                                                    <Select
                                                        labelId={`check-label-${index}`}
                                                        id={`check-select-${index}`}
                                                        value={row.check}
                                                        label="Check"
                                                        readOnly={viewMode}
                                                        onChange={(e) => {
                                                            const newTasks = [...tasks];
                                                            newTasks[index].check = e.target.value;
                                                            setTasks(newTasks);
                                                        }}
                                                    >
                                                        <MenuItem value="Yes">Yes</MenuItem>
                                                        <MenuItem value="No">No</MenuItem>
                                                        <MenuItem value="Verify">Verify</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <StyledTextarea
                            id="outstanding"
                            aria-label="Outstanding"
                            minRows={4}
                            placeholder="Outstanding"
                            value={outstanding}
                            onChange={(e) => setOutstanding(e.target.value)}
                            readOnly={viewMode}
                        />
                    </>
                )}

                <Grid container display="flex" gap={2} flexWrap="nowrap" sx={{ mt: 2 }}>
                    <Grid item width="33.333%">
                        <TextField
                            id="arrival-time"
                            label="Arrival Time"
                            type="time"
                            fullWidth
                            value={arrivalTime}
                            onChange={(e) => setArrivalTime(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            InputProps={{ readOnly: viewMode }}
                        />
                    </Grid>
                    <Grid item width="33.333%">
                        <TextField
                            id="departure-time"
                            label="Departure Time"
                            type="time"
                            fullWidth
                            value={departureTime}
                            onChange={(e) => setDepartureTime(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ min: arrivalTime }}
                            InputProps={{ readOnly: viewMode }}
                        />
                    </Grid>
                    <Grid item width="33.333%">
                        <TextField
                            id="total-time"
                            label="Total Time"
                            fullWidth
                            value={totalTime}
                            InputProps={{ readOnly: true }}
                        />
                    </Grid>
                </Grid>

                <Grid container spacing={2} sx={{ mt: 2, alignItems: 'center' }}>
                    <Grid item>
                        <Typography variant="subtitle1">Travel Type:</Typography>
                    </Grid>
                    <Grid item>
                        <FormControlLabel
                            control={<Checkbox checked={callout} onChange={(e) => setCallout(e.target.checked)} />}
                            label="Callout"
                            disabled={viewMode || remote}
                        />
                    </Grid>
                    <Grid item>
                        <FormControlLabel
                            control={<Checkbox checked={collectionDelivery} onChange={(e) => setCollectionDelivery(e.target.checked)} />}
                            label="Collection/Delivery"
                            disabled={viewMode || remote || callout}
                        />
                    </Grid>
                    <Grid item>
                        <FormControlLabel
                            control={<Checkbox checked={noCharge} onChange={(e) => setNoCharge(e.target.checked)} />}
                            label="No Charge"
                            disabled={viewMode}
                        />
                    </Grid>
                    <Grid item>
                        <FormControlLabel
                            control={<Checkbox checked={remote} onChange={(e) => setRemote(e.target.checked)} />}
                            label="Remote"
                            disabled={viewMode || callout || collectionDelivery}
                        />
                    </Grid>
                </Grid>
                <Grid container display="flex" gap={2} flexWrap={isSmallScreen ? "wrap" : "nowrap"} sx={{ mt: 2 }}>
                    <Grid item width={isSmallScreen ? "100%" : (status === 'Open' ? "100%" : "50%")}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <IconButton onClick={() => {
                                const currentValue = parseFloat(labourCharge) || 0;
                                setLabourCharge(Math.max(0, currentValue - 0.5) + 'h');
                            }} disabled={viewMode}><RemoveCircleOutline /></IconButton>
                            <TextField
                                id="labour-charge"
                                label="Labour Charge"
                                value={labourCharge}
                                onChange={(e) => setLabourCharge(e.target.value)}
                                InputProps={{ readOnly: viewMode }}
                                fullWidth
                            />
                            <IconButton onClick={() => {
                                const currentValue = parseFloat(labourCharge) || 0;
                                setLabourCharge((currentValue + 0.5) + 'h');
                            }} disabled={viewMode}><AddCircleOutline /></IconButton>
                        </Box>
                    </Grid>
                    
                    {(status === 'Pending Invoice' || status === 'Invoiced' || status === 'In Progress') && (
                    <Grid item width={isSmallScreen ? "100%" : "50%"}>
                        <TextField
                            id="invoiceNumber"
                            label="Invoice Number"
                            fullWidth
                            value={invoiceNumber}
                            onChange={(e) => setInvoiceNumber(e.target.value)}
                            InputProps={{ readOnly: viewMode }}
                        />
                    </Grid>
                    )}
                </Grid>
                <Typography variant="caption" display="block" sx={{ mt: 2, textAlign: 'center', fontStyle: 'italic' }}>
                    All prices contained in this document are Exclusive of VAT unless otherwise specified
                </Typography>

                <Divider sx={{ my: 3, borderBottomWidth: 8 }} />



                <Grid container spacing={2} sx={{ mt: 2, alignItems: 'center', flexWrap: 'nowrap' }}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            id="technician-name"
                            label="Technician Name"
                            fullWidth
                            value={technicianName}
                            onChange={(e) => setTechnicianName(e.target.value)}
                            disabled={!!user?.displayName}
                            InputProps={{ readOnly: viewMode }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        {!viewMode && <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => { setSignatureTarget('technician'); setShowSignaturePad(true); }}
                        >
                            {isSmallScreen ? <b>+</b> : "Add Technician Signature"}
                        </Button>}
                    </Grid>
                </Grid>

                {showSignaturePad && (
                    <SignaturePadWrapper
                        onSave={(data) => {
                            if (signatureTarget === 'technician') {
                                setTechnicianSignature(data);
                            } else if (signatureTarget === 'customer') {
                                setCustomerSignature(data);
                            }
                            setShowSignaturePad(false);
                        }}
                        onClose={() => setShowSignaturePad(false)}
                    />
                )}

                {technicianSignature && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1">Technician Signature Preview:</Typography>
                        <img src={technicianSignature} alt="Technician Signature" style={{ border: '1px solid #ccc', maxWidth: '200px', backgroundColor: 'white' }} />
                    </Box>
                )}

                <Grid container spacing={2} sx={{ mt: 2, alignItems: 'center', flexWrap: 'nowrap' }}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            id="customer-name"
                            label="Customer Name"
                            fullWidth
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            InputProps={{ readOnly: viewMode }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        {!viewMode && <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => { setSignatureTarget('customer'); setShowSignaturePad(true); }}
                        >
                            {isSmallScreen ? <b>+</b> : "Add Customer Signature"}
                        </Button>}
                    </Grid>
                </Grid>

                {customerSignature && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1">Customer Signature Preview:</Typography>
                        <img src={customerSignature} alt="Customer Signature" style={{ border: '1px solid #ccc', maxWidth: '200px', backgroundColor: 'white' }} />
                    </Box>
                )}

                {!viewMode && <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Button type="submit" variant="contained" color="primary" size="large">
                        {isEditMode ? 'Save Changes' : 'Create Job Sheet'}
                    </Button>
                </Box>}
            </form>
        </Paper>
    );
}

export default JobSheetForm;