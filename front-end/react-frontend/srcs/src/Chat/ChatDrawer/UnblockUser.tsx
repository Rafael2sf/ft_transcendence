import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, Typography } from "@mui/material";
import axios from "axios";
import { url } from "../../Constants/ApiPort";
import { IUser } from "../../Entities/ProfileTemplate";
import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import SocketContext from "../../Contexts/ChatSocket/Context";

export function UnblockUser({open, closeModalCleanup, userToUnblock}:
	{
		open: boolean,
		closeModalCleanup: () => void,
		userToUnblock: IUser | null,
	})
{
	const navigate = useNavigate();
	const { SocketDispatch, SocketState } = useContext(SocketContext);	
	const [errorMessage, setErrorMessage] = useState("");
	const [openSnack, setOpenSnack] = useState(false);
	const [disabled, setDisabled] = useState(false);
  
	function handleSnackbarClose(event?: React.SyntheticEvent | Event, reason?: string) {
		if (reason === 'clickaway') return;
		setOpenSnack(false);
		setTimeout(() => setErrorMessage(""), 150);
		setDisabled(false);
	};
	
	async function unblockRequest() {

		const controller = new AbortController();
		const signal = controller.signal;

		const requestTimeout = setTimeout(() => controller.abort(), 5000);
		setDisabled(true);

		try {
			const res = await axios.delete(`${url}/user/block/${userToUnblock?.intraname}`, {
				signal: signal,
			})
			SocketDispatch({type: "update_blocked", payload: SocketState.blockedUsers.filter((blockedUser) => blockedUser.intraname !== userToUnblock?.intraname)});
			setErrorMessage(`You have successfully unblocked ${userToUnblock?.name}. You will now be able to see their messages in public groups.`);
			setOpenSnack(true);
			setTimeout(() =>  {closeModalCleanup(); setDisabled(false);}, 1200);
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

		<Dialog
			open={open}
			onClose={closeModalCleanup}
			aria-labelledby='dialog-title'
		>
			<DialogTitle id="dialog-title">Unblock user</DialogTitle>
			<DialogContent>
				<Typography paddingRight={1}>Would you like to unblock this user? You will be able to see their messages in group channels:</Typography>
			</DialogContent>
			<DialogActions>
				<Button onClick={closeModalCleanup} disabled={disabled}>Cancel</Button>
				<Button
					onClick={unblockRequest}
					variant="contained"
					disabled={disabled}
				>
					Unblock
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