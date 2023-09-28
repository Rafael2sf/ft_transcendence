import { Alert, Button, Snackbar, Typography } from '@mui/material';
import KeyboardArrowRightSharpIcon from '@mui/icons-material/KeyboardArrowRightSharp';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { url } from '../Constants/ApiPort';
import RegisterImageUpload from './RegisterImageUpload';
import { useContext, useState } from 'react';
import { IExtendedUser, UserContext } from '../Contexts/UserContext';
import { Logout } from '../GlobalComponents/Logout';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';

async function GetMyselfRequest(
	navigate: NavigateFunction,
	setUserState: React.Dispatch<React.SetStateAction<IExtendedUser>>,
	setErrorMessage: (nessage: string) => void, 
	setOpenSnack: () => void)
{
	const controller = new AbortController();
	const signal = controller.signal;
	
	const requestTimeout = setTimeout(() => controller.abort(), 5000);
	try {
		const userRes = await axios.get(`${url}/user`, {
			signal: signal,
		});
		setUserState({...userRes.data, requestFinished: true});
		navigate("/");
	}
	catch (error: any) {
		if (error.response) {
			// The request was made and the server responded with a status code
			// that falls out of the range of 2xx
			if (error.response.status === 401)
			{
				clearTimeout(requestTimeout);
				navigate("/login");
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

export default function AvatarStep() {
	
	const navigate = useNavigate();
	const {setUserState} = useContext(UserContext);
	const [errorMessage, setErrorMessage] = useState("");
	const [openSnack, setOpenSnack] = useState(false);

	function handleSnackbarClose(event?: React.SyntheticEvent | Event, reason?: string) {
		if (reason === 'clickaway') return;
		setOpenSnack(false);
		setTimeout(() => setErrorMessage(""), 150);
	};

	return (
		<>
			<Typography variant='h6'>Avatar Upload (optional)</Typography>
			<RegisterImageUpload />
			<Typography align="justify" >
				Choose an avatar. If you don't want to, a default one will be provided. <br />
				After the upload, click on "Done!" to finish your registration<br />
			</Typography>
			<Button
			  variant="contained" 
			  sx={{ border: 2, backgroundColor: "#001C30" }}
			  endIcon={<KeyboardArrowRightSharpIcon sx={{ marginBottom: 0.2}} />}
			  onClick={() => GetMyselfRequest(navigate, setUserState, (message) => setErrorMessage(message), () => setOpenSnack(true))}
			>
				Done!
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
		</>
	  )
}
