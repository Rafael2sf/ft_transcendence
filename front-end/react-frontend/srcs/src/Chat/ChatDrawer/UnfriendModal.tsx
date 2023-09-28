import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, Typography } from "@mui/material";
import axios from "axios";
import { url } from "../../Constants/ApiPort";
import { IUser } from "../../Entities/ProfileTemplate";
import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import SocketContext from "../../Contexts/ChatSocket/Context";

export function UnfriendModal({open, setOpen, userToUnfriend, deselectFriend}:
	{
		open: boolean,
		setOpen: (value: boolean) => void,
		userToUnfriend: IUser | null,
		deselectFriend: () => void,
	})
{
	const navigate = useNavigate();
	const { SocketDispatch } = useContext(SocketContext);
	const [disabled, setDisabled] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [openSnack, setOpenSnack] = useState(false);
  
	function handleSnackbarClose(event?: React.SyntheticEvent | Event, reason?: string) {
		if (reason === 'clickaway') return;
		setOpenSnack(false);
		setTimeout(() => setErrorMessage(""), 150);
		setDisabled(false);
	};
	
	if (userToUnfriend === null)
		return <></>;

	async function unfriendRequest() {
		
		const controller = new AbortController();
		const signal = controller.signal;
		
		const requestTimeout = setTimeout(() => controller.abort(), 5000);
		setDisabled(true);
		try {
			const res = await axios.delete(`${url}/user/friend/${userToUnfriend?.intraname}`, {
				signal: signal,
			})
			SocketDispatch({ type: 'unfriend', payload: userToUnfriend?.intraname as string});
			setErrorMessage(`You have successfully unfriended ${userToUnfriend?.name}.`);
			setOpenSnack(true);
			setTimeout(() =>  handleClose(), 1200);

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

	function handleClose() {
		deselectFriend();
		setOpen(false);
	}

	return (

		<Dialog
			open={open}
			onClose={handleClose}
			aria-labelledby='dialog-title'
		>
			<DialogTitle id="dialog-title">Unfriend User</DialogTitle>
			<DialogContent>
				<Typography paddingRight={1}>Would you like to unfriend this user? You will not be able to communicate with each other directly:</Typography>
			</DialogContent>
			<DialogActions>
				<Button onClick={handleClose} disabled={disabled}>Cancel</Button>
				<Button
					onClick={unfriendRequest}
					variant="contained"
					disabled={disabled}
				>
					Unfriend
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
				<Alert onClose={handleSnackbarClose} severity={errorMessage.indexOf("You have successfully") === 0 ? "success" : "error"} sx={{ width: '100%' }}>
					{errorMessage}
				</Alert>
			</Snackbar>
		</Dialog>
	)
}