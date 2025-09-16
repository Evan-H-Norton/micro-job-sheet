import React from 'react';
import { Typography, TextField, Button, Box, Autocomplete, Grid, Divider, Paper, FormControl, InputLabel, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import SignaturePadWrapper from './SignaturePad';

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
}) {

    return (
        <Paper sx={{ p: 3, mt: 3, mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
                {viewMode ? 'Job Sheet Details' : (isEditMode ? 'Edit Job Sheet' : 'New Job Sheet')}
            </Typography>
            <form onSubmit={onSubmit}>
                <Grid container display="flex" gap={2} flexWrap="nowrap">
                    <Grid item width="33.333%">
                        <TextField
                            id="job-number"
                            label={isSmallScreen ? "Job #" : "Job Number"}
                            value={jobNumber}
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
                                    setArrivalTime('');
                                    setDepartureTime('');
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
                        <TextField
                            id="fault-complaint"
                            label="Fault / Complaint"
                            fullWidth
                            multiline
                            rows={4}
                            value={faultComplaint}
                            onChange={(e) => setFaultComplaint(e.target.value)}
                            InputProps={{ readOnly: viewMode }}
                        />

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

                        <TextField
                            id="work-carried-out"
                            label="Work Carried Out"
                            fullWidth
                            sx={{ mt: 2 }}
                            multiline
                            rows={4}
                            value={workCarriedOut}
                            onChange={(e) => setWorkCarriedOut(e.target.value)}
                            InputProps={{ readOnly: viewMode }}
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

                        <TextField
                            id="outstanding"
                            label="Outstanding"
                            fullWidth
                            multiline
                            rows={4}
                            value={outstanding}
                            onChange={(e) => setOutstanding(e.target.value)}
                            sx={{ mt: 2 }}
                            InputProps={{ readOnly: viewMode }}
                        />
                    </>
                )}

                <Divider sx={{ my: 3, borderBottomWidth: 8 }} />

                {(status === 'Pending Invoice' || status === 'Invoiced') && (
                    <Grid container spacing={2} sx={{ mt: 2, alignItems: 'center', flexWrap: 'nowrap' }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                id="invoiceNumber"
                                label="Invoice Number"
                                fullWidth
                                value={invoiceNumber}
                                onChange={(e) => setInvoiceNumber(e.target.value)}
                                InputProps={{ readOnly: viewMode }}
                            />
                        </Grid>
                    </Grid>
                )}

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