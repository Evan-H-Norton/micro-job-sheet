import React, { useState, useEffect } from 'react';
import { Typography, Container, TextField, Grid, Divider, Paper, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useParams } from 'react-router-dom';

function JobSheetDetailsPage() {
  const [jobSheet, setJobSheet] = useState(null);
  const { id } = useParams();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchJobSheet = async () => {
      const docRef = doc(db, 'jobSheets', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setJobSheet(docSnap.data());
      }
    };
    fetchJobSheet();
  }, [id]);

  if (!jobSheet) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3, mt: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
          Job Sheet Details
        </Typography>
        <form>
          <Grid container display="flex" gap={2} flexWrap="nowrap">
            <Grid item width="33.333%">
              <TextField
                label={isSmallScreen ? "Job #" : "Job Number"}
                value={jobSheet.jobNumber}
                InputProps={{ readOnly: true }}
                fullWidth
              />
            </Grid>
            <Grid item width="33.333%">
              <TextField
                label={isSmallScreen ? "Order #" : "Order Number"}
                value={jobSheet.orderNumber}
                InputProps={{ readOnly: true }}
                fullWidth
              />
            </Grid>
            <Grid item width="33.333%">
              <TextField
                label="Date"
                type="date"
                value={jobSheet.date}
                InputLabelProps={{ shrink: true }}
                InputProps={{ readOnly: true }}
                fullWidth
              />
            </Grid>
          </Grid>

          <Grid container display="flex" gap={2} flexWrap="nowrap" sx={{ mt: 2 }}>
            <Grid item width="50%">
              <TextField
                label="Company Name"
                value={jobSheet.companyName}
                InputProps={{ readOnly: true }}
                fullWidth
              />
            </Grid>
            <Grid item width="50%">
              <TextField
                label="Contact Name"
                fullWidth
                value={jobSheet.contact.name}
                InputProps={{ readOnly: true }}
              />
            </Grid>
          </Grid>
          
          <Grid container display="flex" gap={2} flexWrap="nowrap" sx={{ mt: 2 }}>
            <Grid item width="50%">
              <TextField
                label="Contact Cellphone"
                fullWidth
                value={jobSheet.contact.cellphone}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item width="50%">
              <TextField
                label="Contact Email"
                type="email"
                fullWidth
                value={jobSheet.contact.email}
                InputProps={{ readOnly: true }}
              />
            </Grid>
          </Grid>
          
          <Grid container display="flex" gap={2} flexWrap="nowrap" sx={{ mt: 2 }}>
            <Grid item width="50%">
              <TextField
                label="Company Address"
                fullWidth
                value={jobSheet.companyAddress}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item width="50%">
              <TextField
                label="Company Telephone"
                fullWidth
                value={jobSheet.companyTelephone}
                InputProps={{ readOnly: true }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3, borderBottomWidth: 8 }} />

          <TextField
              label="Fault / Complaint"
              fullWidth
              multiline
              rows={4}
              value={jobSheet.faultComplaint}
              InputProps={{ readOnly: true }}
          />

          <Grid container display="flex" gap={2} flexWrap="nowrap" sx={{ mt: 2 }}>
              <Grid item width="33.333%">
                  <TextField
                      label="Arrival Time"
                      type="time"
                      fullWidth
                      value={jobSheet.arrivalTime}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{ readOnly: true }}
                  />
              </Grid>
              <Grid item width="33.333%">
                  <TextField
                      label="Departure Time"
                      type="time"
                      fullWidth
                      value={jobSheet.departureTime}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{ readOnly: true }}
                  />
              </Grid>
              <Grid item width="33.333%">
                  <TextField
                      label="Total Time"
                      fullWidth
                      value={jobSheet.totalTime}
                      InputProps={{ readOnly: true }}
                  />
              </Grid>
          </Grid>

          <TextField
              label="Work Carried Out"
              fullWidth
              sx={{ mt: 2 }}
              multiline
              rows={4}
              value={jobSheet.workCarriedOut}
              InputProps={{ readOnly: true }}
          />

          <Divider sx={{ my: 3, borderBottomWidth: 8 }} />

          <Grid container spacing={2} sx={{ mt: 2, alignItems: 'center', flexWrap: 'nowrap' }}>
              <Grid item xs={12} sm={6}>
                  <TextField
                      label="Technician Name"
                      fullWidth
                      value={jobSheet.technicianName}
                      InputProps={{ readOnly: true }}
                  />
              </Grid>
              <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  {jobSheet.technicianSignature && (
                      <img src={jobSheet.technicianSignature} alt="Technician Signature" style={{ border: '1px solid #ccc', maxWidth: '200px', backgroundColor: 'white' }} />
                  )}
              </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mt: 2, alignItems: 'center', flexWrap: 'nowrap' }}>
              <Grid item xs={12} sm={6}>
                  <TextField
                      label="Customer Name"
                      fullWidth
                      value={jobSheet.customerName}
                      InputProps={{ readOnly: true }}
                  />
              </Grid>
              <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  {jobSheet.customerSignature && (
                      <img src={jobSheet.customerSignature} alt="Customer Signature" style={{ border: '1px solid #ccc', maxWidth: '200px', backgroundColor: 'white' }} />
                  )}
              </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}

export default JobSheetDetailsPage;