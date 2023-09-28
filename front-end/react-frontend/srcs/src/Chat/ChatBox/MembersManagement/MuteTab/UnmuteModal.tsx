import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, Typography } from "@mui/material";
import { IChatMember } from "../../../../Entities/ChatTemplates";
import { unmuteUser } from "../../RequestFunctions";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function UnmuteModal({open, closeModal, userToUnmute, channelId}:
	{
		open: boolean,
		closeModal: () => void,
		userToUnmute: IChatMember,
		channelId: string
	})
{
	const navigate = useNavigate();
	const [errorMessage, setErrorMessage] = useState("");
	const [openSnack, setOpenSnack] = useState(false);
	const [disabled, setDisabled] = useState(false);
  
	function handleSnackbarClose(event?: React.SyntheticEvent | Event, reason?: string) {
		if (reason === 'clickaway') return;
		setOpenSnack(false);
		setTimeout(() => setErrorMessage(""), 150);
	};
	
	return (

		<Dialog
			open={open}
			onClose={closeModal}
			aria-labelledby='dialog-title'
		>
			<DialogTitle id="dialog-title">Unmute User</DialogTitle>
			<DialogContent>
				<Typography paddingRight={1}>Would you like to unmute {userToUnmute.user.name}?</Typography>
			</DialogContent>
			<DialogActions>
				<Button onClick={closeModal}  disabled={disabled} >No</Button>
				<Button
					onClick={async () =>{
						setDisabled(true);
						await unmuteUser(userToUnmute, channelId, navigate, (message) => setErrorMessage(message), () => setOpenSnack(true));
						setTimeout(() =>  closeModal(), 1200);
					}}
					variant="contained"
					disabled={disabled}
				>
					Yes
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