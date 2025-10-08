import React from 'react';
import { Grid, Typography } from '@mui/material';

function QuoteHeader() {
    return (
        <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
            <Grid item>
                <Typography variant="h5" color="primary">Microfusion cc</Typography>
		<Typography variant="h6" color="primary">Business IT Service Provider</Typography>
                <Typography>27 Norfolk Street, Sherwood</Typography>
                <Typography>Port Elizabeth, 6025</Typography>
                <Typography>Phone: (041) 379-4357</Typography>
                <Typography>Company REG: CK97/26879/23</Typography>
		<Typography>VAT Number: 4770165837</Typography>
            </Grid>
            <Grid item>
                <img src="/logo512.png" alt="Company Logo" style={{ width: 150, height: 'auto' }} />
            </Grid>
        </Grid>
    );
}

export default QuoteHeader;
