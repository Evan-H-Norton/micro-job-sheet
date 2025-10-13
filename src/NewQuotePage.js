import React, { useState, useEffect, useContext } from 'react';
import { Button, Box, Paper, Slide, useMediaQuery, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { db } from './firebase';
import { collection, getDocs, doc, runTransaction, getDoc } from 'firebase/firestore';
import { AuthContext } from './App';
import toast from 'react-hot-toast';
import QuoteForm from './QuoteForm';
import QuoteTitle from './QuoteTitle';

function NewQuotePage() {
    const location = useLocation();
    const navigate = useNavigate();
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const slideDirection = location.state?.direction || 'up';

    const [companies, setCompanies] = useState([]);
    const [companyNameInput, setCompanyNameInput] = useState('');
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [date] = useState(new Date().toISOString().slice(0, 10));
    const [companyAddress, setCompanyAddress] = useState('');
    const [companyTelephone, setCompanyTelephone] = useState('');
    const [contactNameInput, setContactNameInput] = useState('');
    const [contactCellphoneInput, setContactCellphoneInput] = useState('');
    const [contactEmailInput, setContactEmailInput] = useState('');
    const [selectedContact, setSelectedContact] = useState(null);
    const [items, setItems] = useState([]);
    const [quoteTitle, setQuoteTitle] = useState('');
    const [comments, setComments] = useState('');
    const [failure, setFailure] = useState('');
    const [cause, setCause] = useState('');
    const [recommendation, setRecommendation] = useState('');
    const [documentType, setDocumentType] = useState('Quotation');
    const [technicianName, setTechnicianName] = useState('');
    const [technicianCellPhoneNumber, setTechnicianCellPhoneNumber] = useState('');
    const [technicianEmail, setTechnicianEmail] = useState('');

    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (user) {
            const fetchUserProfile = async () => {
                const userProfileRef = doc(db, 'userProfiles', user.uid);
                const userProfileSnap = await getDoc(userProfileRef);
                if (userProfileSnap.exists()) {
                    const userProfileData = userProfileSnap.data();
                    setTechnicianName(userProfileData.technicianName || user.displayName || '');
                    setTechnicianCellPhoneNumber(userProfileData.cellPhoneNumber || '');
                    setTechnicianEmail(user.email || '');
                } else {
                    setTechnicianName(user.displayName || '');
                    setTechnicianEmail(user.email || '');
                }
            };
            fetchUserProfile();
        }
    }, [user]);

    useEffect(() => {
        const fetchCompanies = async () => {
            const companiesCollection = collection(db, 'companyProfiles');
            const companiesSnapshot = await getDocs(companiesCollection);
            const companiesList = companiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCompanies(companiesList);
        };
        fetchCompanies();
    }, []);

    const handleCompanyChange = (event, newValue) => {
        setSelectedCompany(newValue);
    };

    const handleCompanyInputChange = (event, newInputValue) => {
        setCompanyNameInput(newInputValue);
        if (!newInputValue || !companies.some(comp => comp.companyName === newInputValue)) {
            setSelectedCompany(null);
        }
    };

    useEffect(() => {
        if (selectedCompany) {
            setCompanyAddress(selectedCompany.companyAddress || '');
            setCompanyTelephone(selectedCompany.companyTelephone || '');
            if (selectedCompany.contacts && selectedCompany.contacts.length === 1) {
                const singleContact = selectedCompany.contacts[0];
                setSelectedContact(singleContact);
                setContactNameInput(singleContact.name || '');
                setContactCellphoneInput(singleContact.cellphone || '');
                setContactEmailInput(singleContact.email || '');
            } else {
                setSelectedContact(null);
                setContactNameInput('');
                setContactCellphoneInput('');
                setContactEmailInput('');
            }
        } else {
            setCompanyAddress('');
            setCompanyTelephone('');
            setSelectedContact(null);
            setContactNameInput('');
            setContactCellphoneInput('');
            setContactEmailInput('');
        }
    }, [selectedCompany]);

    const handleBack = () => {
        navigate('/');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!companyNameInput) {
            toast.error('Please enter a company name.');
            return;
        }

        try {
            await runTransaction(db, async (transaction) => {
                const countersRef = doc(db, 'counters', 'quote');
                const countersSnap = await transaction.get(countersRef);
                let newQuoteNumber;

                if (!countersSnap.exists()) {
                    transaction.set(countersRef, { lastQuoteNumber: 1 });
                    newQuoteNumber = 1;
                } else {
                    const lastQuoteNumber = countersSnap.data().lastQuoteNumber;
                    newQuoteNumber = lastQuoteNumber + 1;
                    transaction.update(countersRef, { lastQuoteNumber: newQuoteNumber });
                }

                let finalCompanyId = selectedCompany?.id || null;

                if (!selectedCompany) {
                    const newCompanyData = {
                        companyName: companyNameInput,
                        companyAddress: companyAddress,
                        companyTelephone: companyTelephone,
                        contacts: [],
                    };
                    const newCompanyRef = doc(collection(db, 'companyProfiles'));
                    transaction.set(newCompanyRef, newCompanyData);
                    finalCompanyId = newCompanyRef.id;
                }

                const newContact = {
                    name: contactNameInput,
                    cellphone: contactCellphoneInput,
                    email: contactEmailInput,
                };

                const quoteData = {
                    quoteNumber: newQuoteNumber,
                    date,
                    quoteTitle,
                    documentType, // Add this line
                    status: 'Valid',
                    companyId: finalCompanyId,
                    companyName: companyNameInput,
                    companyAddress: companyAddress,
                    companyTelephone: companyTelephone,
                    contact: newContact,
                    items,
                    comments,
                    failure,
                    cause,
                    recommendation,
                    technicianName,
                    technicianCellPhoneNumber,
                    technicianEmail,
                    createdAt: new Date(),
                };

                const quoteRef = doc(collection(db, 'quotes'));
                transaction.set(quoteRef, quoteData);
            });

            toast.success('Quote created successfully!');
            navigate('/');

        } catch (error) {
            toast.error('Failed to create quote. Please try again.');
            console.error("Transaction failed: ", error);
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
                <Button variant="outlined" onClick={handleBack} sx={{ mt: 2, mb: 2 }}>Back</Button>
            </Box>
			<Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', borderBottom: '1px solid #ccc', paddingBottom: '10px', color: theme.palette.primary.main }}>
                New Quote
            </Typography>
            <Slide key={location.key} direction={slideDirection} in={true} mountOnEnter unmountOnExit timeout={300}>
                <Paper sx={{ p: 3, my: 2, mb: 3 }}>
                    <QuoteTitle quoteTitle={quoteTitle} setQuoteTitle={setQuoteTitle} documentType={documentType} />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Document Type</InputLabel>
                        <Select
                            value={documentType}
                            onChange={(e) => setDocumentType(e.target.value)}
                            label="Document Type"
                        >
                            <MenuItem value="Quotation">Quotation</MenuItem>
                            <MenuItem value="Report">Report</MenuItem>
                            <MenuItem value="Report and Quotation">Report and Quotation</MenuItem>
                        </Select>
                    </FormControl>
                    <QuoteForm
                        isEditMode={false}
                        onSubmit={handleSubmit}
                        isSmallScreen={isSmallScreen}
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
                        user={user}
                        items={items}
                        setItems={setItems}
                        comments={comments}
                        setComments={setComments}
                        failure={failure}
                        setFailure={setFailure}
                        cause={cause}
                        setCause={setCause}
                        recommendation={recommendation}
                        setRecommendation={setRecommendation}
                        technicianName={technicianName}
                        technicianCellPhoneNumber={technicianCellPhoneNumber}
                        technicianEmail={technicianEmail}
                        documentType={documentType}
                    />
                </Paper>
            </Slide>
        </Box>
    );
}

export default NewQuotePage;
