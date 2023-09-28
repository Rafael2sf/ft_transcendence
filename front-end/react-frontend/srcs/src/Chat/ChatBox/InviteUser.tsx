import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	DialogContentText,
	Snackbar,
	Alert} from "@mui/material";
import { useState, useContext } from "react";
import { NewMemberForm } from "./NewMemberForm";
import axios from "axios";
import { url } from "../../Constants/ApiPort";
import SocketContext from "../../Contexts/ChatSocket/Context";
import { useNavigate } from "react-router-dom";

interface SimpleUser {
	name: string,
	intraname: string
}

export function InviteUser({ open, closeModal} : {
	open: boolean;
	closeModal: () => void;
})
{
	const [userToInvite, setUserToInvite] = useState<SimpleUser>({name: "", intraname: ""});
	const { SocketState } = useContext(SocketContext);
    const navigate = useNavigate();
	const [disabled, setDisabled] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [openSnack, setOpenSnack] = useState(false);
  
	function handleSnackbarClose(event?: React.SyntheticEvent | Event, reason?: string) {
		if (reason === 'clickaway') return;
		setOpenSnack(false);
		setTimeout(() => setErrorMessage(""), 150);
	};

	function handleClose() {
		setUserToInvite({name: "", intraname: ""});
		closeModal();
	};

	async function inviteUser() {
		const controller = new AbortController();
		const signal = controller.signal;

		const requestTimeout = setTimeout(() => controller.abort(), 5000);
		setDisabled(true);
		try {
			const res = await axios.post(`${url}/channels/${SocketState.openedChatRoom?.id}/invite/${userToInvite.intraname}`, {}, {
				signal: signal,
			})
			setErrorMessage(`You have successfully invited ${userToInvite.name}.`);
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
		}
		clearTimeout(requestTimeout);
		setDisabled(false);
	}

	return (
		<Dialog
		  open={open}
		  onClose={handleClose}
		  aria-labelledby='add-member-title'
		  aria-describedby=""
		>
			<DialogTitle id="add-member-title">Add New Member(s)</DialogTitle>
			<DialogContent sx={{
			  display: 'flex',
			  flexDirection: 'column',
			}}>
				<DialogContentText id="add-member-description">
					Choose which users you would like to invite to join the chat:
				</DialogContentText>
				<NewMemberForm
				  name={userToInvite}
				  nameSetter={(name: string, intraname: string) => setUserToInvite({name, intraname})}
				/>
				{userToInvite.intraname &&
					<DialogContentText
					  marginTop={1}
					  id="add-member-confirmation"
					>
						Would you like to invite {userToInvite.name}?
					</DialogContentText>
				}
			</DialogContent>
			<DialogActions>
				<Button
				  onClick={handleClose}
				  disabled={disabled}
				>
					Cancel
				</Button>
				<Button
				  onClick={inviteUser}
				  variant="contained"
				  disabled={!userToInvite.intraname || disabled}
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
				<Alert onClose={handleSnackbarClose} severity={errorMessage.indexOf("You have successfully") === 0 ? "success" : "error"} sx={{ width: '100%' }}>
					{errorMessage}
				</Alert>
			</Snackbar>
		</Dialog>
	)
}