import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, Typography } from "@mui/material";
import { unbanUser } from "../../RequestFunctions";
import { IUser } from "../../../../Entities/ProfileTemplate";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function UnbanModal({open, closeModal, userToUnban, channelId, unbanSuccess}:
	{
		open: boolean,
		closeModal: () => void,
		userToUnban: IUser,
		channelId: string,
		unbanSuccess: () => void
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
			<DialogTitle id="dialog-title">Unban User</DialogTitle>
			<DialogContent>
				<Typography paddingRight={1}>Would you like to unban {userToUnban.name} from the channel? They will be able to rejoin the channel:</Typography>
			</DialogContent>
			<DialogActions>
				<Button onClick={closeModal} disabled={disabled}>No</Button>
				<Button
					onClick={async () =>{ 
						setDisabled(true);
						await unbanUser(userToUnban, channelId, navigate, (message) => setErrorMessage(message), () => setOpenSnack(true));
						setTimeout(() =>  closeModal(), 1200);
						unbanSuccess();
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