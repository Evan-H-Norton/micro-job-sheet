import React, { useState, useEffect, useContext, useRef } from 'react';
import { Button, useMediaQuery, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Paper, Box, Menu, MenuItem, Slide } from '@mui/material';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import { useTheme } from '@mui/material/styles';
import { db } from './firebase';
import { collection, getDocs, doc, getDoc, updateDoc, setDoc, addDoc } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from './App';
import toast from 'react-hot-toast';
import JobSheetForm from './JobSheetForm';

function NewJobSheetPage() {
    const location = useLocation();
    const orderTypeInputRef = useRef(null);
    const [companies, setCompanies] = useState([]);
    const [companyNameInput, setCompanyNameInput] = useState('');
    const [selectedCompany, setSelectedCompany] = useState(null);

    const [jobNumber, setJobNumber] = useState('');
    const [orderType, setOrderType] = useState(null);
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
    const [outstanding, setOutstanding] = useState('');
    const slideDirection = location.state?.direction || 'up';
    const [confirmNewCompanyDialogOpen, setConfirmNewCompanyDialogOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

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

    const [tasks, setTasks] = useState(taskNames.map(task => ({
        task,
        notes: '',
        check: '',
    })));

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
        const fetchInitialData = async () => {
            if (location.state) {
                const {
                    jobNumber,
                    companyName,
                    companyAddress,
                    companyTelephone,
                    contact,
                } = location.state;

                const companiesCollection = collection(db, 'companyProfiles');
                const companiesSnapshot = await getDocs(companiesCollection);
                const companiesList = companiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const company = companiesList.find(c => c.companyName === companyName);

                if (company) {
                    setSelectedCompany(company);
                    if (contact) {
                        const contactData = company.contacts.find(c => c.name === contact.name);
                        if (contactData) {
                            setSelectedContact(contactData);
                        }
                    }
                }

                setJobNumber(jobNumber);
                setCompanyNameInput(companyName || '');
                setCompanyAddress(companyAddress || '');
                setCompanyTelephone(companyTelephone || '');
                if (contact) {
                    setContactNameInput(contact.name || '');
                    setContactCellphoneInput(contact.cellphone || '');
                    setContactEmailInput(contact.email || '');
                }
            } else {
                const countersRef = doc(db, 'counters', 'jobOrder');
                const countersSnap = await getDoc(countersRef);
                if (countersSnap.exists()) {
                    const data = countersSnap.data();
                    setJobNumber(data.lastJobNumber + 1);
                } else {
                    await setDoc(countersRef, { lastJobNumber: 0 });
                    setJobNumber(1);
                }
            }
        };
        fetchInitialData();
    }, [location.state]);

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

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

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
                direction: 'left',
            }
        });
        handleMenuClose();
    };

    const navigate = useNavigate();

    const proceedToCreateJobSheet = async (existingCompany = null, createNewCompany = true) => {
        let finalCompanyId = existingCompany?.id || null;
        let finalContacts = existingCompany ? [...(existingCompany.contacts || [])] : [];

        if (!existingCompany && createNewCompany) {
            const newCompanyData = {
                companyName: companyNameInput,
                companyAddress: companyAddress,
                companyTelephone: companyTelephone,
                contacts: [],
            };
            const newCompanyRef = await addDoc(collection(db, 'companyProfiles'), newCompanyData);
            finalCompanyId = newCompanyRef.id;
        }

        const newContact = {
            name: contactNameInput,
            cellphone: contactCellphoneInput,
            email: contactEmailInput,
        };

        if (newContact.name) {
            const contactIndex = finalContacts.findIndex(c => c.name === newContact.name);
            if (contactIndex > -1) {
                finalContacts[contactIndex] = newContact;
            } else {
                finalContacts.push(newContact);
            }

            if (finalCompanyId) {
                await updateDoc(doc(db, 'companyProfiles', finalCompanyId), {
                    contacts: finalContacts,
                    companyAddress: companyAddress,
                    companyTelephone: companyTelephone,
                });
            }
        }

        const jobSheetData = {
            jobNumber, orderType, orderValue, date, companyId: finalCompanyId,
            companyName: companyNameInput, companyAddress: companyAddress,
            companyTelephone: companyTelephone, contact: newContact,
            faultComplaint, arrivalTime, departureTime, totalTime,
            workCarriedOut, technicianName, technicianSignature, customerSignature,
            status: 'Open', createdAt: new Date(),
            tasks,
            outstanding,
        };
        
        const promise = addDoc(collection(db, 'jobSheets'), jobSheetData)
            .then(() => {
                const countersRef = doc(db, 'counters', 'jobOrder');
                return updateDoc(countersRef, {
                    lastJobNumber: jobNumber,
                });
            });

        toast.promise(promise, {
            loading: 'Creating job sheet...',
            success: () => {
                navigate('/');
                return 'Job Sheet created successfully!';
            },
            error: 'Failed to create job sheet. Please try again.',
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!companyNameInput) {
            toast.error('Please enter a company name.');
            return;
        }

        const existingCompany = companies.find(comp => comp.companyName.toLowerCase() === companyNameInput.toLowerCase());

        if (existingCompany) {
            proceedToCreateJobSheet(existingCompany, false);
        } else {
            setConfirmNewCompanyDialogOpen(true);
        }
    };

    return (
        <Box sx={{ maxWidth: 'md', margin: 'auto' }}>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                bgcolor: theme.palette.background.paper,
                p: 2
            }}>
                <Button variant="outlined" onClick={() => navigate('/')} sx={{ mt: 2, mb: 2 }}>Back</Button>
                <Button variant="contained" onClick={handleMenuClick}>{isSmallScreen ? '+' : <FlashOnIcon />}</Button>
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                >
                    <MenuItem onClick={handleAddSheet}>Add Sheet</MenuItem>
                </Menu>
            </Box>
            <Slide key={location.key} direction={slideDirection} in={true} mountOnEnter unmountOnExit timeout={300}>
                <Paper sx={{ p: 3, my: 2, mb: 3 }}>
                    <JobSheetForm
                        isEditMode={false}
                        onSubmit={handleSubmit}
                        isSmallScreen={isSmallScreen}
                        orderType={orderType}
                        setOrderType={setOrderType}
                        orderValue={orderValue}
                        setOrderValue={setOrderValue}
                        tasks={tasks}
                        setTasks={setTasks}
                        outstanding={outstanding}
                        setOutstanding={setOutstanding}
                        faultComplaint={faultComplaint}
                        setFaultComplaint={setFaultComplaint}
                        workCarriedOut={workCarriedOut}
                        setWorkCarriedOut={setWorkCarriedOut}
                        arrivalTime={arrivalTime}
                        setArrivalTime={setArrivalTime}
                        departureTime={departureTime}
                        setDepartureTime={setDepartureTime}
                        totalTime={totalTime}
                        technicianName={technicianName}
                        setTechnicianName={setTechnicianName}
                        technicianSignature={technicianSignature}
                        setTechnicianSignature={setTechnicianSignature}
                        customerName={customerName}
                        setCustomerName={setCustomerName}
                        customerSignature={customerSignature}
                        setCustomerSignature={setCustomerSignature}
                        companies={companies}
                        selectedCompany={selectedCompany}
                        handleCompanyChange={handleCompanyChange}
                        companyNameInput={companyNameInput}
                        handleCompanyInputChange={handleCompanyInputChange}
                        companyAddress={companyAddress}
                        setCompanyAddress={setCompanyAddress}
                        companyTelephone={companyTelephone}
                        setCompanyTelephone={setCompanyTelephone}
                        contactNameInput={contactNameInput}
                        setContactNameInput={setContactNameInput}
                        contactCellphoneInput={contactCellphoneInput}
                        setContactCellphoneInput={setContactCellphoneInput}
                        contactEmailInput={contactEmailInput}
                        setContactEmailInput={setContactEmailInput}
                        selectedContact={selectedContact}
                        setSelectedContact={setSelectedContact}
                        orderTypeInputRef={orderTypeInputRef}
                        user={user}
                        showSignaturePad={showSignaturePad}
                        setShowSignaturePad={setShowSignaturePad}
                        signatureTarget={signatureTarget}
                        setSignatureTarget={setSignatureTarget}
                        date={date}
                        setDate={setDate}
                        jobNumber={jobNumber}
                    />
                </Paper>
            </Slide>
            <Dialog
                open={confirmNewCompanyDialogOpen}
                onClose={() => setConfirmNewCompanyDialogOpen(false)}
            >
                <DialogTitle>Create New Company?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        The company "{companyNameInput}" does not exist. Would you like to create a new company profile with the details provided?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={async () => { setConfirmNewCompanyDialogOpen(false); await proceedToCreateJobSheet(null, false); }}>No</Button>
                    <Button onClick={async () => { setConfirmNewCompanyDialogOpen(false); await proceedToCreateJobSheet(null, true); }} autoFocus>
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default NewJobSheetPage;
