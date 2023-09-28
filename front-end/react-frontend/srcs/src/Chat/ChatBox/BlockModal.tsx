import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, Typography } from "@mui/material";
import { useContext, useState } from "react";
import SocketContext from "../../Contexts/ChatSocket/Context";
import { blockUser } from "./RequestFunctions";
import { useNavigate } from "react-router-dom";
import { IUser } from "../../Entities/ProfileTemplate";

export function BlockModal({open, closeModal, userToBlock}:
	{
		open: boolean,
		closeModal: () => void,
		userToBlock: IUser,
	})
{
	const { SocketDispatch } = useContext(SocketContext);
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
			<DialogTitle id="dialog-title">Block User</DialogTitle>
			<DialogContent>
				<Typography paddingRight={1}>Would you like to block {userToBlock.name}? Their messages won't be shown to you and, if you were friends, you will automatically unfriend them:</Typography>
			</DialogContent>
			<DialogActions>
				<Button onClick={closeModal} disabled={disabled}>Cancel</Button>
				<Button
					disabled={disabled}
					onClick={async () => {
						setDisabled(true);
						await blockUser(userToBlock, SocketDispatch, navigate, (message: string) => setErrorMessage(message), () => setOpenSnack(true));
						setTimeout(() =>  closeModal(), 1200);
					}}
					variant="contained"
				>
					Block
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