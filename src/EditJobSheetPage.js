import React, { useState, useEffect, useContext, useRef } from 'react';
import { Typography, Container, TextField, Button, Box, Autocomplete, Grid, Divider, Paper, useMediaQuery, FormControl, InputLabel, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { db } from './firebase';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from './App';
import SignaturePadWrapper from './SignaturePad';
import toast from 'react-hot-toast';

function EditJobSheetPage() {
    const orderTypeInputRef = useRef(null);
    const { id } = useParams();
    const [companies, setCompanies] = useState([]);
    const [companyNameInput, setCompanyNameInput] = useState('');
    const [selectedCompany, setSelectedCompany] = useState(null);

    const [jobNumber, setJobNumber] = useState('');
    const [orderValue, setOrderValue] = useState('');
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [faultComplaint, setFaultComplaint] = useState('');
    const [arrivalTime, setArrivalTime] = useState('');
    const [departureTime, setDepartureTime] = useState('');
    const [totalTime, setTotalTime] = useState('');
    const [workCarriedOut, setWorkCarriedOut] = useState('');
    const [technicianName, setTechnicianName] = useState('');
    const [technicianSignature, setTechnicianSignature] = useState(null);
    const [showSignaturePad, setShowSignaturePad] = useState(false);
    const [signatureTarget, setSignatureTarget] = useState(null);
    const [customerName, setCustomerName] = useState('');
    const [customerSignature, setCustomerSignature] = useState(null);
    const [orderType, setOrderType] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [outstanding, setOutstanding] = useState('');
    
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (user && user.displayName) {
            setTechnicianName(user.displayName);
        }
    }, [user]);

    const [companyAddress, setCompanyAddress] = useState('');
    const [companyTelephone, setCompanyTelephone] = useState('');
    const [contactNameInput, setContactNameInput] = useState('');
    const [contactCellphoneInput, setContactCellphoneInput] = useState('');
    const [contactEmailInput, setContactEmailInput] = useState('');
    const [selectedContact, setSelectedContact] = useState(null);

    useEffect(() => {
        const fetchCompanies = async () => {
            const companiesCollection = collection(db, 'companyProfiles');
            const companiesSnapshot = await getDocs(companiesCollection);
            const companiesList = companiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCompanies(companiesList);
        };
        fetchCompanies();
    }, []);

    useEffect(() => {
        const fetchJobSheet = async () => {
            const docRef = doc(db, 'jobSheets', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setCompanyNameInput(data.companyName || '');
                setCompanyAddress(data.companyAddress || '');
                setCompanyTelephone(data.companyTelephone || '');
                setContactNameInput(data.contact?.name || '');
                setContactCellphoneInput(data.contact?.cellphone || '');
                setContactEmailInput(data.contact?.email || '');
                setJobNumber(data.jobNumber || '');
                setOrderValue(data.orderValue || '');
                setDate(data.date || new Date().toISOString().slice(0, 10));
                setFaultComplaint(data.faultComplaint || '');
                setArrivalTime(data.arrivalTime || '');
                setDepartureTime(data.departureTime || '');
                setTotalTime(data.totalTime || '');
                setWorkCarriedOut(data.workCarriedOut || '');
                setTechnicianName(data.technicianName || '');
                setTechnicianSignature(data.technicianSignature || null);
                setCustomerName(data.customerName || '');
                setCustomerSignature(data.customerSignature || null);
                setOrderType(data.orderType || 'Order #');
                setTasks(data.tasks || []);
                setOutstanding(data.outstanding || '');

                // Fetch and set the selected company
                const companiesCollection = collection(db, 'companyProfiles');
                const companiesSnapshot = await getDocs(companiesCollection);
                const companiesList = companiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const company = companiesList.find(c => c.companyName === data.companyName);
                if (company) {
                    setSelectedCompany(company);
                    if (data.contact) {
                        const contact = company.contacts.find(c => c.name === data.contact.name);
                        if (contact) {
                            setSelectedContact(contact);
                        }
                    }
                }
            }
        };
        fetchJobSheet();
    }, [id]);

    useEffect(() => {
        if (selectedCompany) {
            setCompanyNameInput(selectedCompany.companyName);
            setCompanyAddress(selectedCompany.companyAddress || '');
            setCompanyTelephone(selectedCompany.companyTelephone || '');
            if (selectedCompany.contacts && selectedCompany.contacts.length > 0) {
                if (selectedCompany.contacts.length > 1) {
                    // Multiple contacts, do nothing until user selects one
                } else {
                    // Single contact, auto-populate
                    const contact = selectedCompany.contacts[0];
                    setContactNameInput(contact.name || '');
                    setContactCellphoneInput(contact.cellphone || '');
                    setContactEmailInput(contact.email || '');
                }
            } else {
                // No contacts, clear fields
                setContactNameInput('');
                setContactCellphoneInput('');
                setContactEmailInput('');
            }
        } else {
            // No company selected, clear all related fields
            setCompanyAddress('');
            setCompanyTelephone('');
            setContactNameInput('');
            setContactCellphoneInput('');
            setContactEmailInput('');
        }
    }, [selectedCompany]);

    useEffect(() => {
        if (arrivalTime && departureTime) {
            const arrival = new Date(`1970-01-01T${arrivalTime}`);
            const departure = new Date(`1970-01-01T${departureTime}`);
            const diff = departure - arrival;

            if (diff > 0) {
                const hours = Math.floor(diff / 1000 / 60 / 60);
                const minutes = Math.floor((diff / 1000 / 60) % 60);
                setTotalTime(`${hours}h ${minutes}m`);
            } else {
                setTotalTime('');
            }
        }
    }, [arrivalTime, departureTime]);

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const handleCompanyChange = (event, newValue) => {
        setSelectedCompany(newValue);
    };

    const handleCompanyInputChange = (event, newInputValue) => {
        setCompanyNameInput(newInputValue);
        if (!newInputValue || !companies.some(comp => comp.companyName === newInputValue)) {
            setSelectedCompany(null);
        }
    };

    const navigate = useNavigate();

    const handleAddSheet = () => {
        navigate('/new-job-sheet', {
            state: {
                jobNumber,
                companyName: companyNameInput,
                companyAddress,
                companyTelephone,
                contact: {
                    name: contactNameInput,
                    cellphone: contactCellphoneInput,
                    email: contactEmailInput,
                },
            }
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const jobSheetRef = doc(db, 'jobSheets', id);
        const jobSheetData = {
            companyName: companyNameInput,
            companyAddress: companyAddress,
            companyTelephone: companyTelephone,
            contact: {
                name: contactNameInput,
                cellphone: contactCellphoneInput,
                email: contactEmailInput,
            },
            date,
            orderType,
            orderValue,
            faultComplaint,
            arrivalTime,
            departureTime,
            totalTime,
            workCarriedOut,
            technicianName,
            technicianSignature,
            customerName,
            customerSignature,
            tasks,
            outstanding,
        };

        const promise = updateDoc(jobSheetRef, jobSheetData);

        toast.promise(promise, {
            loading: 'Updating job sheet...',
            success: () => {
                navigate('/view-job-sheet', { replace: true });
                return 'Job Sheet updated successfully!';
            },
            error: 'Failed to update job sheet. Please try again.',
        });
    };

    return (
        <Container maxWidth="md">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 2 }}>
                <Button variant="outlined" onClick={() => navigate(-1)}>Back</Button>
                <Button variant="contained" onClick={handleAddSheet}>Add Sheet</Button>
            </Box>
            <Paper sx={{ p: 3, mt: 3, mb: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
                    Edit Job Sheet
                </Typography>
                <form onSubmit={handleSubmit}>
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
                                        setTotalTime('');
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
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        inputRef={orderTypeInputRef}
                                        label={orderType || 'Order Type'}
                                        InputProps={{
                                            ...params.InputProps,
                                            readOnly: orderType === 'S.L.A',
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
                            />
                        </Grid>
                        <Grid item width="50%">
                            <TextField
                                id="company-telephone"
                                label="Company Telephone"
                                fullWidth
                                value={companyTelephone}
                                onChange={(e) => setCompanyTelephone(e.target.value)}
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
                            />
                        </>
                    )}

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
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={() => { setSignatureTarget('technician'); setShowSignaturePad(true); }}
                            >
                                {isSmallScreen ? <b>+</b> : "Add Technician Signature"}
                            </Button>
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
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={() => { setSignatureTarget('customer'); setShowSignaturePad(true); }}
                            >
                                {isSmallScreen ? <b>+</b> : "Add Customer Signature"}
                            </Button>
                        </Grid>
                    </Grid>

                    {customerSignature && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle1">Customer Signature Preview:</Typography>
                            <img src={customerSignature} alt="Customer Signature" style={{ border: '1px solid #ccc', maxWidth: '200px', backgroundColor: 'white' }} />
                        </Box>
                    )}

                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Button type="submit" variant="contained" color="primary" size="large">
                            Save Changes
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
}

export default EditJobSheetPage;