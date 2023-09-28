import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Snackbar, Typography } from "@mui/material";
import { useState } from "react";
import { muteUser } from "../../RequestFunctions";
import { IChatMember } from "../../../../Entities/ChatTemplates";
import { useNavigate } from "react-router-dom";

export function MuteModal({open, closeModal, userToMute, channelId}:
	{
		open: boolean,
		closeModal: () => void,
		userToMute: IChatMember,
		channelId: string
	})
{
	const [muteTime, setMuteTime] = useState("");
	const navigate = useNavigate();
	const [errorMessage, setErrorMessage] = useState("");
	const [openSnack, setOpenSnack] = useState(false);
	const [disabled, setDisabled] = useState(false);
  
	function handleSnackbarClose(event?: React.SyntheticEvent | Event, reason?: string) {
		if (reason === 'clickaway') return;
		setOpenSnack(false);
		setTimeout(() => setErrorMessage(""), 150);
	};
	
	function handleChange(event: SelectChangeEvent) {
		setMuteTime(event.target.value);
	  };

	return (

		<Dialog
			open={open}
			onClose={closeModal}
			aria-labelledby='dialog-title'
		>
			<DialogTitle id="dialog-title">Mute User</DialogTitle>
			<DialogContent sx={{ display: "flex", flexDirection: "column", paddingBottom: 0}}>
				<Typography paddingRight={1}>Would you like to mute {userToMute.user.name}? Choose the amount of time:</Typography>
				<FormControl sx={{ m: 1, width: "9rem", alignSelf: "center" }} size="small">
					<InputLabel size="small"  id="mute-time-selector-label">Time to mute</InputLabel>
					<Select
						labelId="mute-time-selector-label"
						id="mute-time-selector"
						value={muteTime}
						label="Time to mute"
						onChange={handleChange}
					>
						{/* Value is minutes */}
						<MenuItem value={15}>15 minutes</MenuItem>
						<MenuItem value={30}>30 minutes</MenuItem>
						<MenuItem value={60}>1 hour</MenuItem>
						<MenuItem value={120}>2 hours</MenuItem>
						<MenuItem value={240}>4 hours</MenuItem>
					</Select>
				</FormControl>
				<Typography paddingRight={1}>Send mute order?</Typography>
			</DialogContent>
			<DialogActions>
				<Button onClick={closeModal}  disabled={disabled} >No</Button>
				<Button
					onClick={async () => {
						setDisabled(true);
						await muteUser(userToMute, channelId, Number(muteTime), navigate, (message) => setErrorMessage(message), () => setOpenSnack(true));
						setTimeout(() =>  closeModal(), 1200);
					}}
					variant="contained"
					disabled={muteTime === "" || disabled}
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