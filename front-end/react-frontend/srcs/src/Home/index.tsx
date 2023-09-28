import { NavLink, useNavigate } from 'react-router-dom';
import { Footer } from '../GlobalComponents/Footer';
import { Box, Button, Container, Grid, Paper, Typography } from '@mui/material';
import WindowDims from '../Entities/WindowDims';
import ParticlesWrapper from '../GlobalComponents/ParticlesWrapper';
import LeaderBoard from './LeaderBoard';
import RecentActivity from './RecentActivity';

const gridItemStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minWidth: '42px',
  minHeight: '42px',
};

export default function Home({ windowSize }: { windowSize: WindowDims }) {

	const navigate = useNavigate();
  return (
    <Container fixed sx={{
		pt: '4rem',
		minHeight: '100vh',
	}}>
		<ParticlesWrapper />
		<Box
		  display="flex"
		  flexDirection="column"
		  sx={{
			justifyContent: 'space-between',
			alignItems: 'center',
			minHeight: 'calc(100vh - 4rem - 100px)',
			mt: '1rem',
			}}
		>

			<Typography variant='h1'>PONG 2.0</Typography>
			<Box
				sx={{
				display: 'flex',
				flexDirection: windowSize.width > 1000 ? 'row' : 'column',
				justifyContent: 'space-between',
				alignItems: 'center',
				}}
			>
				<LeaderBoard />
				<Grid
				  maxWidth='300px'
				  minWidth="150px"
				  container
				  gap={0.1}
				  direction={windowSize.width > 1000 ? "column" : "row"}
				  zIndex={1}
				>
					<Grid item xs={5.95} sx={{ ...gridItemStyle }}>
						<Button
						  aria-label="go to lobby"
						  onClick={() => navigate('/lobby')}
						  variant="contained"
						  fullWidth
						  sx={{margin: 1, border: 2, backgroundColor: "#001C30"}}
						>
							Play
						</Button>
					</Grid>
					<Grid item xs={5.95} sx={{ ...gridItemStyle}}>
						<Button
						  aria-label="go to chat"
						  onClick={() => navigate('/chat')}
						  variant="contained"
						  fullWidth
						  sx={{margin: 1, border: 2, backgroundColor: "#001C30"}}
						>
							Chat
						</Button>
					</Grid>
				</Grid>
				<RecentActivity/>
			</Box>
			<Footer />
		</Box>
    </Container>
  );
}
