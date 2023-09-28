import {
	Alert,
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
	InputAdornment,
	Menu,
	MenuItem,
	Select,
	SelectChangeEvent,
	Snackbar,
	Stack,
	TextField,
	Typography } from '@mui/material';
import { useContext, useRef, useState } from 'react';
import SocketContext from '../../Contexts/ChatSocket/Context';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { url } from '../../Constants/ApiPort';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import InfoIcon from '@mui/icons-material/Info';

interface ChannelForm {
	name: string;
	type: "PUBLIC" | "PROTECTED" | "PRIVATE";
	password?: string;
}

export function CreateChannel({open, setOpen}: { open: boolean, setOpen: (value: boolean) => void}) {
	
	const [formValues, setFormValues] = useState<ChannelForm>({
		name: '',
		type: 'PUBLIC',
		password: '',
	});
	const { SocketState } = useContext(SocketContext);
	const [visible, setVisible] = useState<string>("password");
	const disableSubmit = useRef<boolean>(true);
	const navigate = useNavigate();
	const [errorMessage, setErrorMessage] = useState("");
	const [openSnack, setOpenSnack] = useState(false);
	const [disabled, setDisabled] = useState(false);
    const [nameRulesAnchor, setNameRulesAnchor] = useState<null | HTMLElement>(null);
	const nameRulesOpen = Boolean(nameRulesAnchor);
	const [passwordRulesAnchor, setPasswordRulesAnchor] = useState<null | HTMLElement>(null);
	const passwordRulesOpen = Boolean(passwordRulesAnchor);

	function handleSnackbarClose(event?: React.SyntheticEvent | Event, reason?: string) {
		if (reason === 'clickaway') return;
		setOpenSnack(false);
		setTimeout(() => setErrorMessage(""), 150);
		setDisabled(false);
	};

	if (!formValues.name || (formValues.type === "PROTECTED" && !formValues.password))
		disableSubmit.current = true;
	else
		disableSubmit.current = false;

	function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
		
		setFormValues({
			...formValues,
			[event.target.id] : event.target.value,
		});
	};
	
	function handleTypeChange(event: SelectChangeEvent<"PUBLIC" | "PROTECTED" | "PRIVATE">) {
		setFormValues({
			...formValues,
			type : event.target.value as "PUBLIC" | "PROTECTED" | "PRIVATE",
		});
	};
	
	function handleClose() {
		setOpen(false);
		setFormValues({
			name: '',
			type: 'PUBLIC',
			password: '',
		});
		disableSubmit.current = false;
	};

	function handleClickEye() {
		setVisible((oldState: string) => {
			if (oldState === "")
				return "password";
			else
				return "";
		});
	}

	async function createNewChannel() {
		
		const controller = new AbortController();
		const signal = controller.signal;

		const requestTimeout = setTimeout(() => controller.abort(), 5000);

		setDisabled(true);

		if (formValues.type !== "PROTECTED")
			delete formValues.password;
		try {
			
			// On success, returns a Channel object
			const res = await axios.post(`${url}/channels`, formValues, {
				signal: signal,
			})
			SocketState.socket?.emit('channel.room.join', res.data.id);
			setErrorMessage(`Success! Channel: ${formValues.name} was created!`);
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
	};

	function nameInfoClick(event: React.MouseEvent<HTMLElement>) {
		setNameRulesAnchor(event.currentTarget);
	  }
	
	function nameInfoClose() {
		setNameRulesAnchor(null);
	}

	function passInfoClick(event: React.MouseEvent<HTMLElement>) {
		setPasswordRulesAnchor(event.currentTarget);
	  }
	
	function passInfoClose() {
		setPasswordRulesAnchor(null);
	}

	return (
		<Dialog
		  open={open}
		  onClose={handleClose}
		  aria-labelledby='dialog-title'
		>
		  <DialogTitle id="dialog-title">Channel Settings</DialogTitle>
		  <DialogContent sx={{
			  display: 'flex',
			  flexDirection: 'column',
		  }}>
				<Stack direction='row' marginY={1} justifyContent="space-between" alignItems="center">
					<Typography paddingRight={1}>Channel name:</Typography>
					<TextField
					  autoFocus
					  id='name'
					  variant='outlined'
					  error={!formValues.name}
					  helperText={ !formValues.name ? "Required" : ""}
					  size='small'
					  value={formValues.name}
					  onChange={handleChange}
					  InputProps={{
						endAdornment:
						  <InputAdornment position='end' style={{cursor: 'pointer'}}>
							<IconButton
							  color="inherit"
							  aria-label="rules"
							  onClick={nameInfoClick}
							>
								<InfoIcon />
							</IconButton>
						  </InputAdornment>
						}}
					/>
					<Menu 
					  anchorEl={nameRulesAnchor}
					  anchorOrigin={{
					  	vertical: 'top',
					  	horizontal: 'center'
					  }}
					  transformOrigin={{
					  	vertical: 'bottom',
					  	horizontal: 'right'
					  }}
					  open={nameRulesOpen}
					  onClose={nameInfoClose}
					  PaperProps={{
					  	style: {
					  	width: '10ch',
					  	paddingLeft: "12px"
					  	},
					  }}
					>
						<Typography  variant='caption'>- 6 to 12 chars <br/>- Lowercase letters, numbers or "-" <br/>- Start with letter</Typography>
					</Menu>
				</Stack>
				<Stack direction='row' marginY={1} justifyContent="space-between" alignItems="center">
					<Typography paddingRight={1}>Channel type:</Typography>
					<Select
					  id="type" 
					  value={formValues.type}
					  onChange={handleTypeChange}
					  size='small'
					>
						<MenuItem value="PUBLIC">Public</MenuItem>
						<MenuItem value="PROTECTED">Protected</MenuItem>
						<MenuItem value="PRIVATE">Private</MenuItem>
					</Select>
				</Stack>
				{formValues.type === "PROTECTED" && 
					<Stack  direction='row' marginY={1} justifyContent="space-between" alignItems="center">
						<Typography paddingRight={1}>Password:</Typography>
						<TextField 
						id='password'
						type={visible}
						variant='outlined'
						value={formValues.password}
						error={!formValues.password}
						helperText={ !formValues.password ? "Required" : ""}
						size='small'
						onChange={handleChange}
						InputProps={{
							endAdornment:
								<Box display="flex">
									<IconButton onClick={handleClickEye}>
										{visible ? <VisibilityIcon/> : <VisibilityOffIcon/>}
									</IconButton>
									<IconButton
									  color="inherit"
									  aria-label="rules"
									  onClick={passInfoClick}
									>
										<InfoIcon />
									</IconButton>
								</Box>
						}}	
						></TextField>
						<Menu 
						  anchorEl={passwordRulesAnchor}
						  anchorOrigin={{
						  	vertical: 'top',
						  	horizontal: 'center'
						  }}
						  transformOrigin={{
						  	vertical: 'bottom',
						  	horizontal: 'right'
						  }}
						  open={passwordRulesOpen}
						  onClose={passInfoClose}
						  PaperProps={{
						  	style: {
						  	width: '10ch',
						  	paddingLeft: "12px"
						  	},
						  }}
						>
							<Typography  variant='caption'>- 8 to 32 chars <br/>- Letters and numbers <br/>- At least one number</Typography>
						</Menu>
					</Stack>
				}
		  </DialogContent>
		  <DialogActions>
			  <Button disabled={disabled} onClick={handleClose}>Cancel</Button>
			  <Button
			    onClick={createNewChannel}
			    variant="contained"
			    disabled={disableSubmit.current || disabled}>
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