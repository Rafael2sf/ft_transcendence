import { Alert, Autocomplete, AutocompleteInputChangeReason, Box, Paper, Snackbar, styled, TextField, Typography } from "@mui/material";
import { PropsWithChildren, useEffect, useState } from "react";
import { Channel } from "../../Entities/ChatTemplates";
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { url } from "../../Constants/ApiPort";
import { JoinChannel } from "./JoinChannel";

function CustomPaper(props: PropsWithChildren ) {
	return (
	  <Paper 
		sx={{
		  backgroundColor: "#356688",
		  borderRadius: "12px",
		  "& .MuiAutocomplete-listbox": {
			  border: "solid white 2px",
			  borderBottom: 0,
			  borderRadius: "12px",
			  paddingY: 0,
		  },
		  "& .MuiAutocomplete-listbox .MuiAutocomplete-option.Mui-focused": {
			bgcolor: "#90caf9",
		  },
		  "& .MuiAutocomplete-option": {
			  borderBottom: "solid white 2px",
		  },
		  "& .MuiAutocomplete-endAdornment": {
		  }
		}}
	  >
		{props.children}
	  </Paper>
	);
  }

  
  export function ChannelSearch()
{
	const [searchResult, setSearchResult] = useState<Channel[]>([]);
	const [channelName, setChannelName] = useState<string>('');
	const navigate = useNavigate();
	const [channelToJoin, setChannelToJoin] = useState<Channel | null>(null);
	const [errorMessage, setErrorMessage] = useState("");
	const [openSnack, setOpenSnack] = useState(false);
  
	function handleSnackbarClose(event?: React.SyntheticEvent | Event, reason?: string) {
		if (reason === 'clickaway') return;
		setOpenSnack(false);
		setTimeout(() => setErrorMessage(""), 150);
	};

	const searchBoxAction = (event: React.SyntheticEvent<Element, Event>, value: string | Channel | null) => {
		  
		if (value) {
			if (typeof value !== "string")
				setChannelToJoin(value);
		}
	};

	useEffect(() => {
		const controller = new AbortController();
		const signal = controller.signal;

		if (channelName.length > 2) {
			axios.get(`${url}/channels?name=${channelName}&limit=10&offset=0`, {
				signal: signal,
			})
			.then((response) => setSearchResult(response.data))
			.catch((error) => {
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
			});
		}
		else
			setSearchResult([]);
		return () => {
			controller.abort();
		}
	}, [channelName]);

	return (
		<Box flexGrow={1} padding={1} sx={{width: "100%"}}>
			<Autocomplete
				options={searchResult}
				getOptionLabel={(option) => typeof option === "string" ? option : option.name}
				isOptionEqualToValue={(option, value) => option.name === value.name}
				PaperComponent={CustomPaper}
				renderOption={(props, option) =>(
					<li {...props} >
						<Box
						width="100%"
						display={'flex'}
						justifyContent="space-between"
						alignItems="center"
						sx={{
							'& svg': {
								opacity: "0.4",
							},
						}}
						>
							<Typography>{option.name}</Typography>
							{option.type === "PROTECTED" ? <LockIcon fontSize="small"/> : <LockOpenIcon fontSize="small"/>}					
						</Box>
					</li>
				)}
				renderInput={(params) => (
					<TextField 
						{...params}
						InputLabelProps={{ disabled: true}}
						placeholder={"Join Channel"}
						hiddenLabel
						value={channelName}
						size='small'
						sx={{ borderRadius: 1}}
						/>
					)}
				onChange={searchBoxAction}	
				onInputChange={(event: React.SyntheticEvent<Element, Event>, value:  string, reason: AutocompleteInputChangeReason) => {
					setChannelName(value);
					if (reason === "clear")
						setSearchResult([]);
				}}
			></Autocomplete> 
			{ channelToJoin && <JoinChannel
			  open={channelToJoin !== null}
			  closeModal={() => setChannelToJoin(null)}
			  channelToJoin={channelToJoin}
			/>}
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
		</Box>
	);
}