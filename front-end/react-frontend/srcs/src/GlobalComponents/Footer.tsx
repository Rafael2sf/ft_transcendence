import { Box, Typography } from '@mui/material';

export function Footer() {
  return (
    <Box
      component='footer'
      sx={{
        display: 'flex',
        flexDirection: 'column',
        borderTop: 1,
        borderColor: 'divider',
        p: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100px'
      }}
    >
      <div>
      <div>
        <Typography variant='caption'>42 Lisbon</Typography>
        <Typography margin={1} variant='caption'>ft_transcendence</Typography>
      </div>
        <img src='nest_logo.png' width='42px'></img>
        <img src='postgres_logo.png' width='42px'></img>
        <img src='prisma_logo.png' width='42px'></img>
        <img src='react_logo.png' width='42px'></img>
      </div>
    </Box>
  );
}
