import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, Snackbar } from "@mui/material";
import axios from "axios";
import { useState } from "react";
import { url } from "../../Constants/ApiPort";
import { ChanWithMembers } from "../../Entities/ChatTemplates";
import { useNavigate } from "react-router-dom";

export function SetNewOwner({open, setOpen, targetChannel, leaveAndClose}:
	{
		open: boolean,
		setOpen: (value: boolean) => void,
		targetChannel: ChanWithMembers | null,
		leaveAndClose: () => void
	}) {

	const [newOwner, setNewOwner] = useState("");
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
		setNewOwner("");
		setOpen(false);
	};

	async function setOwnerAndLeave() {

		const controller = new AbortController();
		const signal = controller.signal;

		const requestTimeout = setTimeout(() => controller.abort(), 5000);
		setDisabled(true);

		try {

			await axios.patch(`${url}/channels/${targetChannel?.id}/${newOwner}`, {permission: "OWNER"} ,{
				signal: signal,
			})

			if (targetChannel )
			{
				leaveAndClose();
				handleClose();
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


	const ownerOptions = targetChannel?.users.map((user) => (
		<MenuItem key={user.user.id} value={user.user.intraname}>{user.user.name}</MenuItem>
	));

	return (
		<Dialog
		  open={open}
		  onClose={handleClose}
		  aria-labelledby='dialog-title'
		  aria-describedby="alert-dialog-description"
		>
			<DialogTitle id="dialog-title">Choose New Owner</DialogTitle>
			<DialogContent sx={{
			  display: 'flex',
			  flexDirection: "column"
		  }}>
				<Select
				  id="new-owner"
				  value={newOwner}
				  onChange={(event) => setNewOwner(event.target.value)}
				  size='small'
				  sx={{
					justifySelf: 'space-between',
					alignSelf: 'center',
					width: "10rem"
		 		  }}
				>
					{ownerOptions}
				</Select>
			</DialogContent>
			<DialogActions>
				<Button
				onClick={handleClose}
				disabled={disabled}>
					Cancel
				</Button>
				<Button
				onClick={setOwnerAndLeave}
				variant="contained"
				disabled={newOwner === "" || disabled}
				>
					Submit
				</Button>
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
	)
}