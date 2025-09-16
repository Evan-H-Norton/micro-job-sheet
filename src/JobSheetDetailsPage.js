import React, { useState, useEffect } from 'react';
import { Typography, Container, useMediaQuery, Button, Box, Slide, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { db } from './firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import JobSheetForm from './JobSheetForm';

function JobSheetDetailsPage() {
  
  const [jobSheet, setJobSheet] = useState(null);
  const [jobSheets, setJobSheets] = useState([]);
  const [currentSheetIndex, setCurrentSheetIndex] = useState(0);
  const location = useLocation();
  const slideDirection = location.state?.direction || 'up';
  
  
  
  const { id } = useParams();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobSheet = async () => {
      const docRef = doc(db, 'jobSheets', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setJobSheet(data);

        const jobSheetsCollection = collection(db, 'jobSheets');
        const jobSheetsSnapshot = await getDocs(jobSheetsCollection);
        const allJobSheets = jobSheetsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const relatedJobSheets = allJobSheets.filter(sheet => sheet.jobNumber === data.jobNumber);
        setJobSheets(relatedJobSheets);
        const newIndex = relatedJobSheets.findIndex(sheet => sheet.id === id);
        setCurrentSheetIndex(newIndex);
        
      }
    };
    fetchJobSheet();
  }, [id]);

  const handleNavigateSheet = (direction) => {
    const newIndex = currentSheetIndex + direction;
    if (newIndex >= 0 && newIndex < jobSheets.length) {
        const slideDir = direction === 1 ? 'left' : 'right';
        navigate(`/job-sheet/${jobSheets[newIndex].id}`, { state: { direction: slideDir } });
    }
};

  if (!jobSheet) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', my: 2 }}>
        <Box sx={{ justifySelf: 'start' }}>
          <Button variant="outlined" onClick={() => navigate('/view-job-sheet')}>Back</Button>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifySelf: 'center' }}>
            <Button variant="outlined" onClick={() => handleNavigateSheet(-1)} disabled={currentSheetIndex === 0}>
                <ArrowBack />
            </Button>
            <Button variant="outlined" disabled>{currentSheetIndex + 1}</Button>
            <Button variant="outlined" onClick={() => handleNavigateSheet(1)} disabled={currentSheetIndex === jobSheets.length - 1}>
                <ArrowForward />
            </Button>
        </Box>
        <Box sx={{ justifySelf: 'end' }}>
          {jobSheet.status !== 'Invoiced' && jobSheet.status !== 'Cancelled' && (
            <Button variant="contained" onClick={() => navigate(`/job-sheet/edit/${id}`, { state: { direction: 'up' } })}>{isSmallScreen ? '+' : 'Edit'}</Button>
          )}
        </Box>
      </Box>
      <Slide key={id} direction={slideDirection} in={true} mountOnEnter unmountOnExit timeout={300}>
        <Paper sx={{ p: 3, mt: 3, mb: 3 }}>
            <JobSheetForm
                viewMode={true}
                isSmallScreen={isSmallScreen}
                orderType={jobSheet.orderType}
                orderValue={jobSheet.orderValue}
                tasks={jobSheet.tasks}
                outstanding={jobSheet.outstanding}
                faultComplaint={jobSheet.faultComplaint}
                workCarriedOut={jobSheet.workCarriedOut}
                arrivalTime={jobSheet.arrivalTime}
                departureTime={jobSheet.departureTime}
                totalTime={jobSheet.totalTime}
                technicianName={jobSheet.technicianName}
                technicianSignature={jobSheet.technicianSignature}
                customerName={jobSheet.customerName}
                customerSignature={jobSheet.customerSignature}
                companyNameInput={jobSheet.companyName}
                companyAddress={jobSheet.companyAddress}
                companyTelephone={jobSheet.companyTelephone}
                contactNameInput={jobSheet.contact.name}
                contactCellphoneInput={jobSheet.contact.cellphone}
                contactEmailInput={jobSheet.contact.email}
                date={jobSheet.date}
                jobNumber={jobSheet.jobNumber}
            />
        </Paper>
      </Slide>
    </Container>
  );
}

export default JobSheetDetailsPage;