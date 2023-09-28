import { Box, Button, Container, TextField, Typography } from '@mui/material';
import { Footer } from '../GlobalComponents/Footer';
import { useContext, useState } from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { IExtendedUser, UserContext } from '../Contexts/UserContext';
import axios from 'axios';
import { url } from '../Constants/ApiPort';
import ParticlesWrapper from '../GlobalComponents/ParticlesWrapper';

const hoverBtn = {
  '&:hover': {
    transform: 'scale(1.05)',
    border: 2,
  },
};

export default function Login() {

  return (
    <Container fixed sx={{
	  minHeight: '100vh',
	}}>
		<ParticlesWrapper />
		<Box
			sx={{
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'space-between',
			alignItems: 'center',
			height: 'calc(100vh - 4rem)',
			}}
		>
			<Typography marginTop='4rem' variant='h1'>PONG 2.0</Typography>
			<Button
				sx={{
				border: 1,
				width: '300px',
				height: '50px',
				backgroundImage: 'url(/intra_background.jpg)',
				m: '10vh 0 0 0',
				...hoverBtn,
				}}>
				<a style={{
				width: '100%',
				height: '100%',
				}} href={`${url}/auth/42/login`}> <Typography color='white'> 42 </Typography> </a>
			</Button>
			<Footer />
		</Box>
    </Container>
  );
}
