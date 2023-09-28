import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { url } from '../Constants/ApiPort';
import { IUser } from '../Entities/ProfileTemplate';
import { Alert, Avatar, Badge, Box, List, ListItem, Snackbar, Tooltip, Typography } from '@mui/material';
import { IGameResults } from '../Entities/GameTemplates';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useNavigate } from 'react-router-dom';


export default function RecentActivity() {
	const [recentGames, setRecentGames] = useState<JSX.Element[]>([]);
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

			axios.get(`${url}/games?sort=-ended_at&filter[state]=FINISHED&limit=5`, {
				signal: signal,
			})
			.then(response => {
				const gamesList: IGameResults[] = response.data;
				const recentGamesDivs = gamesList.map((game, index) => (
					<ListItem
					  key={index}

					  sx={{ bgcolor: index % 2 === 1 ? '#F4E0B0' : "#C4AE7B", display: "flex", justifyContent: "space-between", paddingY: 0}}
					  >
						<Tooltip
						  title={<Typography variant='caption'>{game.games_users[0].user.name}</Typography>}
						  placement="top-end"
						  arrow
						  enterDelay={100}
						  leaveDelay={200}
						  sx={{fontSize: 24}}
						>
						{ game.games_users[0].won ?
							<Badge
							badgeContent={<EmojiEventsIcon htmlColor='#C6B900' sx={{stroke: 'black', strokeWidth: 0.5, cursor: "pointer" }}/>}
							color="default"
							anchorOrigin={{
								vertical: 'bottom',
								horizontal: 'right',
							}}
							overlap="circular"
							onClick={() => navigate(`/profile/${game.games_users[0].user.intraname}`)}
							>
								<Avatar
                					src={game.games_users[0].user.picture}
									sx={{ width: '48px', height: '48px', cursor: "pointer"}}
									onClick={() => navigate(`/profile/${game.games_users[0].user.intraname}`)}
								></Avatar>
							</Badge>
							:
							<Avatar
								src={game.games_users[0].user.picture}
								sx={{ width: '48px', height: '48px', cursor: "pointer" }}
								onClick={() => navigate(`/profile/${game.games_users[0].user.intraname}`)}
							></Avatar>
						}
						</Tooltip>
						<Box display="flex" width="120px" flexDirection="column" alignItems="center">
							<Typography variant='caption' color="grey" position="absolute">{new Date(game.ended_at).toLocaleString()}</Typography>
							<Typography margin={2} color="grey">
								{game.games_users[0].score === -1 ? "Disc." : game.games_users[0].score} 
								{" - "}
								{game.games_users[1].score === -1 ? "Disc." : game.games_users[1].score}
							</Typography>
						</Box>
						<Tooltip
						  title={<Typography variant='caption'>{game.games_users[1].user.name}</Typography>}
						  placement="top-start"
						  arrow
						  enterDelay={100}
						  leaveDelay={200}
						>
						{ game.games_users[1].won ?
							<Badge
							badgeContent={<EmojiEventsIcon htmlColor='#C6B900' sx={{stroke: 'black', strokeWidth: 0.5, cursor: "pointer" }}/>}
							color="default"
							anchorOrigin={{
								vertical: 'bottom',
								horizontal: 'right',
							}}
							overlap="circular"
							onClick={() => navigate(`/profile/${game.games_users[1].user.intraname}`)}
							>
								<Avatar
									src={game.games_users[1].user.picture}
									sx={{ width: '48px', height: '48px', cursor: "pointer" }}
									onClick={() => navigate(`/profile/${game.games_users[1].user.intraname}`)}
								></Avatar>
							</Badge>
						:
							<Avatar
								src={game.games_users[1].user.picture}
								sx={{ width: '48px', height: '48px', cursor: "pointer"}}
								onClick={() => navigate(`/profile/${game.games_users[1].user.intraname}`)}

							></Avatar>
						}
						</Tooltip>
					</ListItem>
				));
				setRecentGames(recentGamesDivs);
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
		<Typography variant='h5' border={1} width="100%" bgcolor={"background.paper"} display="flex" justifyContent="center">Recent Activity</Typography>
		<List
			sx={{ maxHeight: "250px", minWidth: "400px", overflowY: "auto", padding: 0}}

		>
			{recentGames}
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
