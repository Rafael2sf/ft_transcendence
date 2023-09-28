import { Container, Typography } from '@mui/material';

export default function NotFound() {
  return (
    <Container
      sx={{
        bgcolor: 'background.default',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Typography variant='h2'>404</Typography>
      <Typography variant='h4'>Page Not Found</Typography>
    </Container>
  );
}
