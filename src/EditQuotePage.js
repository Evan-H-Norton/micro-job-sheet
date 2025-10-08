
import React, { useState, useEffect, useContext } from 'react';
import { Button, Box, useMediaQuery, Slide, Paper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { db } from './firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { AuthContext } from './App';
import toast from 'react-hot-toast';
import QuoteForm from './QuoteForm';
import QuoteTitle from './QuoteTitle';
function EditQuotePage() {
    const { id } = useParams();
    const [companies] = useState([]);
    const [companyNameInput, setCompanyNameInput] = useState('');
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [companyAddress, setCompanyAddress] = useState('');
    const [companyTelephone, setCompanyTelephone] = useState('');
    const [contactNameInput, setContactNameInput] = useState('');
    const [contactCellphoneInput, setContactCellphoneInput] = useState('');
    const [contactEmailInput, setContactEmailInput] = useState('');
    const [selectedContact, setSelectedContact] = useState(null);
    const [items, setItems] = useState([]);
    const [quoteTitle, setQuoteTitle] = useState('');
    const [comments, setComments] = useState('');
    const location = useLocation();
    const slideDirection = location.state?.direction || 'up';

    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchQuote = async () => {
            const docRef = doc(db, 'quotes', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setCompanyNameInput(data.companyName || '');
                setCompanyAddress(data.companyAddress || '');
                setCompanyTelephone(data.companyTelephone || '');
                setContactNameInput(data.contact?.name || '');
                setContactCellphoneInput(data.contact?.cellphone || '');
                setContactEmailInput(data.contact?.email || '');
                setDate(data.date || new Date().toISOString().slice(0, 10));
                setItems(data.items || []);
                setQuoteTitle(data.quoteTitle || '');
                setComments(data.comments || '');
            }
        };
        fetchQuote();
    }, [id]);

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();

    const handleCompanyChange = (event, newValue) => {
        setSelectedCompany(newValue);
    };

    const handleCompanyInputChange = (event, newInputValue) => {
        setCompanyNameInput(newInputValue);
        if (!newInputValue || !companies.some(comp => comp.companyName === newInputValue)) {
            setSelectedCompany(null);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const quoteRef = doc(db, 'quotes', id);
        const quoteData = {
            companyName: companyNameInput,
            companyAddress: companyAddress,
            companyTelephone: companyTelephone,
            contact: {
                name: contactNameInput,
                cellphone: contactCellphoneInput,
                email: contactEmailInput,
            },
            date,
            items,
            quoteTitle,
            comments,
        };

        const promise = updateDoc(quoteRef, quoteData);

        toast.promise(promise, {
            loading: 'Updating quote...',
            success: () => {
                navigate('/');
                return 'Quote updated successfully!';
            },
            error: 'Failed to update quote. Please try again.',
        });
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
                <Button variant="outlined" onClick={() => navigate('/view-quotes')}>Back</Button>
            </Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', borderBottom: '1px solid #ccc', paddingBottom: '10px', color: theme.palette.primary.main }}>
                Edit Quote
            </Typography>
            <Slide key={id} direction={slideDirection} in={true} mountOnEnter unmountOnExit timeout={300}>
                <Paper sx={{ p: 3, my: 2, mb: 3 }}>
                    <QuoteTitle quoteTitle={quoteTitle} setQuoteTitle={setQuoteTitle} />
                    <QuoteForm
                        isEditMode={true}
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
                    />
                </Paper>
            </Slide>
        </Box>
    );
}

export default EditQuotePage;
