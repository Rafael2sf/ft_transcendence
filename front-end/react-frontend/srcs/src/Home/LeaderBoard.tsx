import { Alert, Avatar, Box, List, ListItem, Snackbar, Typography } from '@mui/material'
import axios from 'axios';
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { url } from '../Constants/ApiPort';
import { IUser } from '../Entities/ProfileTemplate';

export default function LeaderBoard() {

	const [leaderboard, setLeaderboard] = useState<JSX.Element[]>([]);
	const navigate = useNavigate();
	const [errorMessage, setErrorMessage] = useState("");
	const [openSnack, setOpenSnack] = useState(false);
  
	function handleSnackbarClose(event?: React.SyntheticEvent | Event, reason?: string) {
		if (reason === 'clickaway') return;
		setOpenSnack(false);
		setTimeout(() => setErrorMessage(""), 150);
	};

	const medalList: JSX.Element[] = [<Avatar alt="gold" src="GoldMedalPNG.png" />,<Avatar alt="silver" src="SilverMedalPNG.png" />, <Avatar alt="bronze" src="BronzeMedalPNG.png" />];

	useEffect(() => {
		const controller = new AbortController();
		const signal = controller.signal;

			axios.get(`${url}/users/search?limit=10&ctx=leaderboard`, {
				signal: signal,
			})
			.then(response => {
				const userList: IUser[] = response.data;
				const leaderboardDivs = userList.map((user, index) => (
					<ListItem key={index} sx={{ bgcolor: index % 2 === 1 ? '#F4E0B0' : "#C4AE7B", display: "flex", justifyContent: "space-between", }}>
						{index < 3 ? medalList[index] : <Typography color="grey" width="40px" sx={{display: "flex", justifyContent: "center", alignItems: "center"}}>{index + 1}</Typography>}	
						<Typography color="grey">{user.name}</Typography>	
						<Typography color="grey">{Math.sqrt(user.ladder * 0.2).toFixed(2) }</Typography>	
					</ListItem>
				));
				setLeaderboard(leaderboardDivs);
			})
			.catch ((error) => {
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
			
			return () => {
				setTimeout(() => controller.abort(), 5000);
			}
		}, []);
		
  return (
	<Box
	  zIndex={1}
	  sx={{
	    display: 'flex',
		flexDirection: "column",
	    justifyContent: 'center',
	    alignItems: 'center',
	    border: 1,
	    margin: 3,
	}}
    >
		<Typography variant='h5' border={1} width="100%" bgcolor={"background.paper"} display="flex" justifyContent="center">Leaderboard</Typography>
		<List
		sx={{ maxHeight: "250px", minWidth: "400px", overflowY: "auto", padding: 0}}
		>
			{leaderboard}
		</List>
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
  )
}
