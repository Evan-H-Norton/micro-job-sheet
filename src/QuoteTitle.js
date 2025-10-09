import React from 'react';
import { Grid, Typography, TextField, Box } from '@mui/material';

function QuoteTitle({ quoteTitle, setQuoteTitle, quoteNumber, viewMode = false }) {
    const currentDate = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = currentDate.toLocaleDateString('en-GB', options);

    const paddedQuoteNumber = quoteNumber ? String(quoteNumber).padStart(4, '0') : null;

    return (
        <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2, mt: 2, p: 1, border: '1px solid grey', borderRadius: '5px' }}>
            {/* The background color is set to a dark blue similar to the company logo. */}
            <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h6" color="primary">
                        {paddedQuoteNumber ? `Q-${paddedQuoteNumber}` : 'Quote'}
                        {viewMode && quoteTitle && ` - ${quoteTitle}`}
                    </Typography>
                    {!viewMode &&
                        <TextField
                            variant="standard"
                            value={quoteTitle}
                            onChange={(e) => setQuoteTitle(e.target.value)}
                            sx={{ ml: 1 }}
                            InputProps={{
                                disableUnderline: false
                            }}
                        />
                    }
                </Box>
            </Grid>
            <Grid item xs={6} sx={{ textAlign: 'right' }}>
                <Typography variant="h6">{formattedDate}</Typography>
            </Grid>
        </Grid>
    );
}

export default QuoteTitle;
