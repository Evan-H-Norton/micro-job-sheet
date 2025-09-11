import React from 'react';
import { Container, Button, Stack } from '@mui/material';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <Container maxWidth="sm">
      <Stack spacing={2} direction="column" sx={{ mt: 8 }}>
        <Button variant="contained" component={Link} to="/new-job-sheet">
          New Job Sheet
        </Button>
        <Button variant="contained" component={Link} to="/view-job-sheet">
          View Job Sheet
        </Button>
        <Button variant="contained" component={Link} to="/company-profiles">
          Company Profiles
        </Button>
      </Stack>
    </Container>
  );
}

export default HomePage;
