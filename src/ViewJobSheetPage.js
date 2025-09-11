import React, { useState, useEffect } from 'react';
import { Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Box } from '@mui/material';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

function ViewJobSheetPage() {
  const [jobSheets, setJobSheets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobSheets = async () => {
      const jobSheetsCollection = collection(db, 'jobSheets');
      const jobSheetsSnapshot = await getDocs(jobSheetsCollection);
      const jobSheetsList = jobSheetsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJobSheets(jobSheetsList);
    };
    fetchJobSheets();
  }, []);

  const filteredJobSheets = jobSheets.filter(sheet =>
    sheet.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sheet.jobNumber.toString().includes(searchTerm) ||
    sheet.orderNumber.toString().includes(searchTerm) ||
    sheet.technicianName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
        <Button variant="outlined" onClick={() => navigate(-1)}>Back</Button>
      </Box>
      <TextField
        label="Search"
        variant="outlined"
        fullWidth
        margin="normal"
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Job Number</TableCell>
              <TableCell>Order Number</TableCell>
              <TableCell>Company Name</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Technician</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredJobSheets.map((sheet) => (
              <TableRow key={sheet.id}>
                <TableCell>{sheet.jobNumber}</TableCell>
                <TableCell>{sheet.orderNumber}</TableCell>
                <TableCell>{sheet.companyName}</TableCell>
                <TableCell>{sheet.date}</TableCell>
                <TableCell>{sheet.technicianName}</TableCell>
                <TableCell>
                  <Button variant="contained" onClick={() => navigate(`/job-sheet/${sheet.id}`)}>View</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default ViewJobSheetPage;
