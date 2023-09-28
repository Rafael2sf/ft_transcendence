import { Box, Step, StepLabel, Stepper, Typography } from '@mui/material';
import { useState } from 'react';
import AvatarStep from './AvatarStep';
import UsernameStep from './UsernameStep';

const steps = ['Login', 'Register', 'Upload Avatar', 'Done!'];

export default function Register() {

  const [currentStep, setCurrentStep] = useState(1);
  
  return (
	<Box
	width="100%"
	display="flex"
	justifyContent="center"
	alignItems="center"
	overflow='auto'
	sx={{ backgroundImage: `url(${`/lobbyBg.jpg`})`, height: '100vh', paddingY:"4rem"}}
	>
		<Box 
		  sx={{
			margin:"auto",
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			border: 2,
			borderRadius: 5,
			backgroundColor: "rgba(173, 182, 196, 0.4)",
			width: "50vw",
			minWidth: "400px",
			padding: 3,
		  }}
		>
			<Typography variant='h4'>Register</Typography>
			<Stepper activeStep={currentStep} alternativeLabel sx={{ marginY: 4}}>
			{steps.map((label) => (
				<Step key={label}>
				<StepLabel>{label}</StepLabel>
				</Step>
			))}
			</Stepper>
			{ currentStep === 1 ?
				<UsernameStep nextStep={() => setCurrentStep(2)} ></UsernameStep>
				:
				<AvatarStep />
			}
		</Box>
	</Box>
  );
}
