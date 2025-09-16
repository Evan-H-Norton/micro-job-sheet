import React, { useState, useEffect, useContext, useRef } from 'react';
import { Container, Button, Box, useMediaQuery, Slide, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { db } from './firebase';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { AuthContext } from './App';
import toast from 'react-hot-toast';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import JobSheetForm from './JobSheetForm';

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
    const [jobSheets, setJobSheets] = useState([]);
    const [currentSheetIndex, setCurrentSheetIndex] = useState(0);
    const location = useLocation();
    const slideDirection = location.state?.direction || 'up';
    
    
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

                const jobSheetsCollection = collection(db, 'jobSheets');
                const jobSheetsSnapshot = await getDocs(jobSheetsCollection);
                const allJobSheets = jobSheetsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const relatedJobSheets = allJobSheets.filter(sheet => sheet.jobNumber === data.jobNumber);
                setJobSheets(relatedJobSheets);
                const newIndex = relatedJobSheets.findIndex(sheet => sheet.id === id);
                setCurrentSheetIndex(newIndex);

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

    const handleNavigateSheet = (direction) => {
        const newIndex = currentSheetIndex + direction;
        if (newIndex >= 0 && newIndex < jobSheets.length) {
            const slideDir = direction === 1 ? 'left' : 'right';
            navigate(`/job-sheet/edit/${jobSheets[newIndex].id}`, { state: { direction: slideDir } });
        }
    };

    return (
        <Container maxWidth="md">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 2 }}>
                <Button variant="outlined" onClick={() => navigate('/view-job-sheet')}>Back</Button>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Button variant="outlined" onClick={() => handleNavigateSheet(-1)} disabled={currentSheetIndex === 0}>
                        <ArrowBack />
                    </Button>
                    <Button variant="outlined" disabled>{currentSheetIndex + 1}</Button>
                    <Button variant="outlined" onClick={() => handleNavigateSheet(1)} disabled={currentSheetIndex === jobSheets.length - 1}>
                        <ArrowForward />
                    </Button>
                </Box>
                <Button variant="contained" onClick={handleAddSheet}>{isSmallScreen ? '+' : 'Add Sheet'}</Button>
            </Box>
            <Slide key={id} direction={slideDirection} in={true} mountOnEnter unmountOnExit timeout={300}>
                <Paper sx={{ p: 3, mt: 3, mb: 3 }}>
                    <JobSheetForm
                        isEditMode={true}
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
        </Container>
    );
}

export default EditJobSheetPage;