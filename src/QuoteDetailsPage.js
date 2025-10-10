
import React, { useState, useEffect } from 'react';
import { Typography, useMediaQuery, Button, Box, Slide, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import QuoteForm from './QuoteForm';
import QuoteHeader from './QuoteHeader';
import QuoteTitle from './QuoteTitle';


function QuoteDetailsPage() {
  const [quote, setQuote] = useState(null);
  const { id } = useParams();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const slideDirection = location.state?.direction || 'up';

  useEffect(() => {
    const fetchQuote = async () => {
      const docRef = doc(db, 'quotes', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setQuote(docSnap.data());
      }
    };
    fetchQuote();
  }, [id]);

  if (!quote) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 'md', margin: 'auto' }}>
      <Box sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        bgcolor: theme.palette.background.paper,
        p: 2,
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
      }}>
        <Box sx={{ justifySelf: 'start' }}>
          <Button variant="outlined" onClick={() => navigate('/view-quotes')}>Back</Button>
        </Box>
      </Box>
      <Slide key={id} direction={slideDirection} in={true} mountOnEnter unmountOnExit timeout={300}>
        <Paper sx={{ p: 3, mt: 3, mb: 3 }}>
            <QuoteHeader />
            <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', borderBottom: '1px solid #ccc', paddingBottom: '10px', color: theme.palette.primary.main }}>
                {quote.documentType}
            </Typography>
            <QuoteTitle viewMode={true} quoteTitle={quote.quoteTitle} quoteNumber={quote.quoteNumber} documentType={quote.documentType} />
            <QuoteForm
                viewMode={true}
                isSmallScreen={isSmallScreen}
                quoteTitle={quote.quoteTitle}
                items={quote.items}
                comments={quote.comments}
                failure={quote.failure}
                cause={quote.cause}
                recommendation={quote.recommendation}
                documentType={quote.documentType}
                companyNameInput={quote.companyName}
                companyAddress={quote.companyAddress}
                companyTelephone={quote.companyTelephone}
                contactNameInput={quote.contact.name}
                contactCellphoneInput={quote.contact.cellphone}
                contactEmailInput={quote.contact.email}
                date={quote.date}
            />
        </Paper>
      </Slide>
    </Box>
  );
}

export default QuoteDetailsPage;
