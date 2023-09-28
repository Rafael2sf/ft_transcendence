import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar } from "@mui/material";
import axios from "axios";
import { useState } from "react";
import { url } from "../../Constants/ApiPort";
import { Channel, ChanWithMembers } from "../../Entities/ChatTemplates";
import { SetNewOwner } from "./SetNewOwner";
import { useNavigate } from "react-router-dom";

export function RemoveChannel({open, setOpen, channelToDelete, deselectChannel}:
	{
		open: boolean,
		setOpen: (value: boolean) => void,
		channelToDelete: React.MutableRefObject<Channel | null>,
		deselectChannel: (value: Channel | null) => void,
	}) {
	
	const [openOwnerChange, setOpenOwnerChange] = useState(false);
	const [membersList, setMembersList] = useState<ChanWithMembers | null>(null);
	const navigate = useNavigate();
	const [errorMessage, setErrorMessage] = useState("");
	const [openSnack, setOpenSnack] = useState(false);
	const [disabled, setDisabled] = useState(false);
  
	function handleSnackbarClose(event?: React.SyntheticEvent | Event, reason?: string) {
		if (reason === 'clickaway') return;
		setOpenSnack(false);
		setTimeout(() => setErrorMessage(""), 150);
		setDisabled(false);
	};

	function handleClose() {
		channelToDelete.current = null;
		deselectChannel(null);
		setOpen(false);
	};

	async function leaveChannel() {
		
		const controller = new AbortController();
		const signal = controller.signal;

		const requestTimeout = setTimeout(() => controller.abort(), 5000);

		setDisabled(true);
		
		try {
			
			await axios.delete(`${url}/channels/${channelToDelete.current?.id}/join`, {
				signal: signal,
			})

			if (channelToDelete.current )
			{
				setErrorMessage(`Success! You left the channel: ${channelToDelete.current.name}!`);
				setOpenSnack(true);
				setTimeout(() =>  handleClose(), 1200);
			}
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
	};


	async function deleteChannel() {
		
		const controller = new AbortController();
		const signal = controller.signal;

		const requestTimeout = setTimeout(() => controller.abort(), 5000);
		setDisabled(true);
		try {
			
			await axios.delete(`${url}/channels/${channelToDelete.current?.id}`, {
				signal: signal,
			})
			if (channelToDelete.current )
			{
				setErrorMessage(`Success! Channel: ${channelToDelete.current.name} was deleted!`);
				setOpenSnack(true);
				setTimeout(() =>  handleClose(), 1200);
			}
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
	};

	async function getChannelMembers() {

		const controller = new AbortController();
		const signal = controller.signal;

		const requestTimeout = setTimeout(() => controller.abort(), 5000);
		try {

			const res = await axios.get(`${url}/channels/${channelToDelete.current?.id}?limit=50&offset=0`, {
				signal: signal,
			});
			setMembersList(new ChanWithMembers(res.data));
			setOpenOwnerChange(true);
		} 
		catch (error: any) {

			if (error.response) {
				// The request was made and the server responded with a status code
				// that falls out of the range of 2xx
				if (error.response.status === 401)
				{
					navigate("/login");
					return;
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
		};
		clearTimeout(requestTimeout);
	}

	return (
		<Box>
			<Dialog
			open={open}
			onClose={handleClose}
			aria-labelledby='dialog-title'
			aria-describedby="alert-dialog-description"
			>
				{channelToDelete.current?.user_role !== "OWNER" ?
					<DialogTitle id="dialog-title">Leave this channel?</DialogTitle>
				:
					<DialogTitle id="dialog-title">Leave/Delete this channel?</DialogTitle>
				}
				<DialogContent>
					{channelToDelete.current?.user_role !== "OWNER" ?
						<DialogContentText id="alert-dialog-description">
							Are you sure you want to leave the channel {channelToDelete.current?.name}?
						</DialogContentText>
					:
						<DialogContentText id="alert-dialog-description">
							If you choose to leave the channel {channelToDelete.current?.name}, you must choose a new owner from the members list.
							If you choose to delete it, the channel WILL be removed from every member's channel list:
						</DialogContentText>
					}
				</DialogContent>
				<DialogActions>
					<Button
					onClick={handleClose}
					disabled={disabled}>
						Cancel
					</Button>
					<Button
					onClick={channelToDelete.current?.user_role === "OWNER" ? getChannelMembers : leaveChannel}
					variant="contained"
					disabled={disabled}
					>
						Leave Channel
					</Button>
					{channelToDelete.current?.user_role === "OWNER" &&
						<Button
						variant="contained"
						color="error"
						onClick={deleteChannel}
						disabled={disabled}
						>
							Delete Channel
						</Button>
					}
				</DialogActions>
				<Snackbar
					autoHideDuration={2000}
					open={openSnack}
					onClose={handleSnackbarClose}
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'right',
					}}
				>
					<Alert onClose={handleSnackbarClose} severity={errorMessage.indexOf("Success!") === 0 ? "success" : "error"} sx={{ width: '100%' }}>
						{errorMessage}
					</Alert>
				</Snackbar>
			</Dialog>
			{openOwnerChange && <SetNewOwner open={openOwnerChange} setOpen={setOpenOwnerChange} targetChannel={membersList} leaveAndClose={() => leaveChannel()}/>}
		</Box>
	)
}