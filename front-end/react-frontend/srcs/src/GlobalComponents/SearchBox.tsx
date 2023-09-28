import { Alert, Autocomplete, Box, createFilterOptions, Snackbar, styled, TextField } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { url } from "../Constants/ApiPort";
import { IUser } from "../Entities/ProfileTemplate";

const StyledTextField = styled(TextField, {})({
	
	'& .MuiInputBase-root': { 
		'& fieldset':  {
			border: 0,
		},
	},


})

const filterOptions = createFilterOptions({
  matchFrom: 'any',
  stringify: (option: IUser) => option.name + option.intraname,
});

export function SearchBox({boxWidth} : {boxWidth: string})
{

	const [name, setName] = useState<string>('');
	const [searchResult, setSearchResult] = useState<IUser[]>([]);
	const searchBoxAction = (event: React.SyntheticEvent<Element, Event>, value: string | IUser | null) => {
		if (value) {
			if (typeof value !== "string")  
				navigate(`/profile/${value.intraname}`)
		};
	}
	const navigate = useNavigate();
	const [errorMessage, setErrorMessage] = useState("");
	const [openSnack, setOpenSnack] = useState(false);
  
	function handleSnackbarClose(event?: React.SyntheticEvent | Event, reason?: string) {
		if (reason === 'clickaway') return;
		setOpenSnack(false);
		setTimeout(() => setErrorMessage(""), 150);
	};

	useEffect(() => {
		const controller = new AbortController();
		const signal = controller.signal;

		if (name.length > 2) {
			
			axios.get(`${url}/users/search?like=${name}&limit=10&ctx=searchbar`, {
				signal: signal,
			})
			.then((response) =>{
				setSearchResult(response.data);
			})
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
	}, [name]);

	return (
		<Box sx={{width: boxWidth}}>
		<Autocomplete
			options={searchResult}
			getOptionLabel={(option) => typeof option === "string" ? option : option.name}
			isOptionEqualToValue={(option, value) => option.name === value.name}
      filterOptions={filterOptions}
			renderInput={(params) => (
				<StyledTextField 
					{...params}
					InputLabelProps={{ disabled: true}}
					placeholder={'Search other players...'}
					hiddenLabel
					value={name}
					onChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
						setName(event.target.value);
					}}
					size='small'
					sx={{border: 1, borderRadius: 1, boxShadow: 4, overflow: 'hidden'}}
					/>
				)}
			freeSolo
			onChange={searchBoxAction}	
		></Autocomplete> 
		<Snackbar
			autoHideDuration={2000}
			open={openSnack}
			onClose={handleSnackbarClose}
			anchorOrigin={{
				vertical: 'bottom',
				horizontal: 'right',
			}}
		>
			<Alert onClose={handleSnackbarClose} severity={"error"} sx={{ width: '100%' }}>
				{errorMessage}
			</Alert>
		</Snackbar>
	</Box>
	);
}