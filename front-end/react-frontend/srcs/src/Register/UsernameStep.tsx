import { Alert, Box, Button, Snackbar, TextField, Typography } from '@mui/material'
import axios from 'axios';
import React, { useContext, useState } from 'react'
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { url } from '../Constants/ApiPort';
import KeyboardArrowRightSharpIcon from '@mui/icons-material/KeyboardArrowRightSharp';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import { Logout } from '../GlobalComponents/Logout';

async function registerRequest(
	chosenName: string,
	navigate: NavigateFunction,
	setErrorMessage: (nessage: string) => void, 
	setOpenSnack: () => void,
	nextStep: () => void)
{
	const controller = new AbortController();
	const signal = controller.signal;

	const requestTimeout = setTimeout(() => controller.abort(), 5000);
	try {
		await axios.post(`${url}/auth/signup`, {
			name: chosenName
		}, {
			signal: signal,
		});
		nextStep();
	}
	catch (error: any) {
		if (error.response) {
			// The request was made and the server responded with a status code
			// that falls out of the range of 2xx
			if (error.response.status === 401)
			{
				clearTimeout(requestTimeout);
				navigate("/login");
				return;
			}
			else if (error.response.status === 403)
			{
				clearTimeout(requestTimeout);
				navigate("/");
				return;
			}
			else
			{
				if (error.response.data.message && typeof(error.response.data.message) !== "string")
					setErrorMessage(error.response.data.message[0]);
				else
					setErrorMessage(error.response.data.message ? error.response.data.message : "ERROR");
				setOpenSnack();
			}
		} else if (error.request) {
			// The request was made but no response was received
			// `error.request` is an instance of XMLHttpRequest in the browser and an instance of
			// http.ClientRequest in node.js
			console.log(error.request);
		} else {
			// Something happened in setting up the request that triggered an Error
			console.log('Error: ', error.message);
		}
	}
	clearTimeout(requestTimeout);
}

export default function UsernameStep({nextStep} : {nextStep: () => void}) {

	const [username, setUsername] = useState("");
	const navigate = useNavigate();
	const [errorMessage, setErrorMessage] = useState("");
	const [openSnack, setOpenSnack] = useState(false);
  
	function handleSnackbarClose(event?: React.SyntheticEvent | Event, reason?: string) {
		if (reason === 'clickaway') return;
		setOpenSnack(false);
		setTimeout(() => setErrorMessage(""), 150);
	};

	return (
	<>
		<Typography variant='h6'>Welcome!</Typography>
		<Typography align="justify" >
			Since this is your first time logging in, you will need to choose a unique username that identifies you throughout the website. <br />
			After registering, you will be able to furter customize your profile.<br />
			(The username must contain 6-12 characters that can be lowercase letters, numbers and "-"; It also needs to star with a letter)
		</Typography>
		<TextField 
		  label='name' 
		  variant="outlined"
		  size="small"
		  value={username}
		  error={!username}
		  helperText={!username ? "Required" : ""}
		  onChange={(event) => setUsername(event.target.value)}
		  sx={{m: '2.5rem 0'}}
		/>
		<Box display={"flex"} justifyContent="space-between" width="100%">
			<Button
			  variant="contained"
			  startIcon={<ArrowLeftIcon />}
			  sx={{ border: 2, backgroundColor: "#001C30" }}
			  onClick={async() => await Logout(navigate, (message) => setErrorMessage(message), () => setOpenSnack(true))}>
				Go Back
			</Button>
			<Button
			variant="contained" 
			sx={{ border: 2, backgroundColor: "#001C30" }}
			endIcon={<KeyboardArrowRightSharpIcon sx={{ marginBottom: 0.2}} />}
			onClick={username ?
				async () => {
					await registerRequest(username, navigate, (message) => setErrorMessage(message), () => setOpenSnack(true), nextStep);
				} 
				: 
				() => alert("Introducing a username is mandatory")}
			>
				Avatar Upload
			</Button>
			<Snackbar
			  autoHideDuration={2000}
			  open={openSnack}
			  onClose={handleSnackbarClose}
			  anchorOrigin={{
			  	vertical: 'bottom',
			  	horizontal: 'right',
			  }}
			>
				<Alert onClose={handleSnackbarClose} severity={"error"} sx={{ width: '100%' }}>
					{errorMessage}
				</Alert>
			</Snackbar>

		</Box>
	</>
  )
}
