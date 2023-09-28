import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, Typography } from "@mui/material";
import { changeUserRole } from "../../RequestFunctions";
import { IChatMember } from "../../../../Entities/ChatTemplates";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function PromoteModal({open, closeModal, userToPromote, channelId}:
	{
		open: boolean,
		closeModal: () => void,
		userToPromote: IChatMember,
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
			<DialogTitle id="dialog-title">Promote User</DialogTitle>
			<DialogContent>
				<Typography paddingRight={1}>Would you like to promote {userToPromote.user.name} to administrator of this channel?</Typography>
			</DialogContent>
			<DialogActions>
				<Button onClick={closeModal} disabled={disabled}>No</Button>
				<Button
					onClick={async () =>{ 
						setDisabled(true);
						await changeUserRole(userToPromote, "ADMIN", channelId, navigate, (message) => setErrorMessage(message), () => setOpenSnack(true));
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