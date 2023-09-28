import { Alert, Grid, Pagination, Snackbar, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { Box } from '@mui/system'
import React, { useEffect, useState } from 'react'
import { url } from '../../Constants/ApiPort';
import axios from 'axios';
import { IRequestsObject, IUser } from '../../Entities/ProfileTemplate';
import RequestCard from './RequestCard';
import WindowDims from '../../Entities/WindowDims';
import ReceivedRequests from './ReceivedRequests';
import SentRequests from './SentRequests';
import { useNavigate } from 'react-router-dom';

export default function FriendRequests({ windowSize} : {windowSize: WindowDims}) {

	const [receivedOrSent, setReceivedOrSent] = useState<"received" | "sent">("received");
	const [invites, setInvites] = useState<IRequestsObject>({
		sent: [],
		received: []
	});
	const navigate = useNavigate();
	const [errorMessage, setErrorMessage] = useState("");
	const [openSnack, setOpenSnack] = useState(false);
  
	function handleSnackbarClose(event?: React.SyntheticEvent | Event, reason?: string) {
		if (reason === 'clickaway') return;
		setOpenSnack(false);
		setTimeout(() => setErrorMessage(""), 150);
	};
	
	useEffect(() => {

		const controller = new AbortController();
		const signal = controller.signal;
		
		axios.get(`${url}/user/invites/me`, {
			signal: signal,
			headers: {
				"Authorization": "Bearer 1",
			}
		})
		.then((response) => {
			const resList: IRequestsObject = response.data;
			setInvites(resList);
		})
		.catch((error) => {
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
		});
	}, []);

	return (
		<Box display="flex" flexDirection="column" alignItems="center" height="100%">
			<Typography variant='h5'>FRIEND REQUESTS</Typography>
			<Box width= "100%" display="flex" justifyContent="center" marginBottom={2}>
				<ToggleButtonGroup
					orientation="horizontal"
					size="small"
					exclusive 
					onChange={(e, newVal) =>{ if (newVal) setReceivedOrSent(newVal);}}
					value={receivedOrSent}
				>
					<ToggleButton value={"received"} sx={{ fontSize: 24}} >Received</ToggleButton>
					<ToggleButton value={"sent"} sx={{ fontSize: 24}} >Sent</ToggleButton>
				</ToggleButtonGroup>
			</Box>
			{receivedOrSent === "received" && 
				<ReceivedRequests
				  windowSize={windowSize}
				  receivedRequests={invites.received}
				  updateReceived={(inviteId: number) => {
					const newReceived = invites.received.filter((receivedInvite) => receivedInvite.id !== inviteId);
					setInvites((oldVal) => { return {...oldVal, received: newReceived} })
				  }}
				/>}
			{receivedOrSent === "sent" && 
				<SentRequests
				  windowSize={windowSize}
				  sentRequests={invites.sent}
				  updateSent={(inviteId: number) => {
					const newSent = invites.sent.filter((sentInvite) => sentInvite.id !== inviteId);
					setInvites((oldVal) => { return {...oldVal, sent: newSent} })
				  }}
				/>}
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
	)
}
