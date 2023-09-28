import { Alert, Avatar, Box, Grid, IconButton, ListItem, ListItemButton, ListItemText, Snackbar } from '@mui/material';
import { IUser } from '../../Entities/ProfileTemplate';
import { useNavigate } from 'react-router';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import axios from 'axios';
import { url } from '../../Constants/ApiPort';
import { useState } from 'react';

export default function RequestCard({requestTarget, type, requestUpdater} : 
  {
	requestTarget: IUser,
	type: "received" | "sent",
	requestUpdater: (inviteId: number) => void

  }) {
	
	const navigate = useNavigate();
	const [disabled, setDisabled] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [openSnack, setOpenSnack] = useState(false);
  
	function handleSnackbarClose(event?: React.SyntheticEvent | Event, reason?: string) {
		if (reason === 'clickaway') return;
		setOpenSnack(false);
		setTimeout(() => setErrorMessage(""), 150);
	};
	
	async function AcceptRequest() {
		const controller = new AbortController();
		const signal = controller.signal;

		const requestTimeout = setTimeout(() => controller.abort(), 5000);
		try {
			
			const res = await axios.post(`${url}/user/friend/${requestTarget.intraname}/accept`, {}, {
				signal: signal,
				headers: {
					"Authorization": "Bearer 1",
				},
			})
			setErrorMessage(`Request from ${requestTarget.name} was accepted.`);
			setOpenSnack(true);
			requestUpdater(requestTarget.id);
			setTimeout(() => {
				setDisabled(false);
			}, 2000);
		}
		catch (error: any) {
			if (error.response) {
				// The request was made and the server responded with a status code
				// that falls out of the range of 2xx
				if (error.response.status === 401)
				{
					navigate("/login");
				}
				else
				{
					if (error.response.data.message && typeof(error.response.data.message) !== "string")
						setErrorMessage(error.response.data.message[0]);
					else
						setErrorMessage(error.response.data.message ? error.response.data.message : "ERROR");
					setOpenSnack(true);
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
				setDisabled(false);
		}
		clearTimeout(requestTimeout);
	}

	async function DeclineRequest() {
		const controller = new AbortController();
		const signal = controller.signal;

		const requestTimeout = setTimeout(() => controller.abort(), 5000);
		try {
			
			const res = await axios.post(`${url}/user/friend/${requestTarget.intraname}/decline`, {}, {
				signal: signal,
				headers: {
					"Authorization": "Bearer 1",
				},
			})
			setErrorMessage(`Request from ${requestTarget.name} was declined.`);
			setOpenSnack(true);
			requestUpdater(requestTarget.id);
			setTimeout(() => {
				setDisabled(false);
			}, 2000);
		}
		catch (error: any) {
			if (error.response) {
				// The request was made and the server responded with a status code
				// that falls out of the range of 2xx
				if (error.response.status === 401)
				{
					navigate("/login");
				}
				else
				{
					if (error.response.data.message && typeof(error.response.data.message) !== "string")
						setErrorMessage(error.response.data.message[0]);
					else
						setErrorMessage(error.response.data.message ? error.response.data.message : "ERROR");
					setOpenSnack(true);
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
				setDisabled(false);
		}
		clearTimeout(requestTimeout);
	}

	async function CancelRequest() {
		const controller = new AbortController();
		const signal = controller.signal;

		const requestTimeout = setTimeout(() => controller.abort(), 5000);
		try {
			
			const res = await axios.delete(`${url}/user/friend/${requestTarget.intraname}`, {
				signal: signal,
				headers: {
					"Authorization": "Bearer 1",
				},
			})
			setErrorMessage(`Request sent to ${requestTarget.name} was canceled.`);
			setOpenSnack(true);
			requestUpdater(requestTarget.id);
			setTimeout(() => {
				setDisabled(false);
			}, 2000);
		}
		catch (error: any) {
			if (error.response) {
				// The request was made and the server responded with a status code
				// that falls out of the range of 2xx
				if (error.response.status === 401)
				{
					navigate("/login");
				}
				else
				{
					if (error.response.data.message && typeof(error.response.data.message) !== "string")
						setErrorMessage(error.response.data.message[0]);
					else
						setErrorMessage(error.response.data.message ? error.response.data.message : "ERROR");
					setOpenSnack(true);
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
				setDisabled(false);
		}
		clearTimeout(requestTimeout);
	}

	return (
		<Grid
		  item xs={12}
		  sx={{
			boxShadow: 1,
			borderRadius: 5
		  }}
		>
			<ListItem
				disablePadding
				sx={{ backgroundColor: "#C4AE7B", borderRadius: 5, border: 2}}
				secondaryAction={ type === "received" ?
					<Box>
						<IconButton onClick={async () => {setDisabled(true); await AcceptRequest();}} disabled={disabled}>
							<CheckCircleIcon color='success' sx={{ stroke: 'white', strokeWidth: 2 }}/>
						</IconButton>
						
						<IconButton onClick={async () => {setDisabled(true); await DeclineRequest();}} disabled={disabled}>
							<CancelIcon color='error' sx={{ stroke: 'white', strokeWidth: 2 }}/>
						</IconButton>
					</Box>
					:
					<IconButton onClick={async () => {setDisabled(true); await CancelRequest();}} disabled={disabled}>
						<CancelIcon />
					</IconButton>
				}
			>
				<ListItemButton 
					sx={{borderRadius: 5}}
					onClick={() => navigate(`/profile/${requestTarget.intraname}`)}
				>
					  <Avatar sizes='32px 32px' sx={{ margin: 2, border: 2 }} src={requestTarget.picture}/>
					<ListItemText primary={requestTarget.name} />
				</ListItemButton>
			</ListItem>
			<Snackbar
				autoHideDuration={2000}
				open={openSnack}
				onClose={handleSnackbarClose}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'right',
				}}
			>
				<Alert onClose={handleSnackbarClose} severity={errorMessage.indexOf("Request") === 0 ? "success" : "error"} sx={{ width: '100%' }}>
					{errorMessage}
				</Alert>
			</Snackbar>
		</Grid>
	  );
}
