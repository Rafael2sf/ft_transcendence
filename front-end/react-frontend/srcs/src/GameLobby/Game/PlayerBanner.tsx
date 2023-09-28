import { Alert, Avatar, Box, Snackbar, Typography } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import GameSocketContext from '../../Contexts/GameSocket/GameContext';
import axios from 'axios';
import { url } from '../../Constants/ApiPort';
import { IUser } from '../../Entities/ProfileTemplate';
import WindowDims from '../../Entities/WindowDims';
import { useNavigate } from 'react-router-dom';

interface BannerParams {
	bgType: string,
	bgSrc: string,
	score: number,
	player_id: string | undefined,
	borderRadius: string,
	windowSize: WindowDims
}

export default function PlayerBanner({bgType, bgSrc, score, player_id, borderRadius, windowSize} : BannerParams) {
	
	const { GameSocketState } = useContext(GameSocketContext);
	const [player, setPlayer] = useState<IUser>({
		id: -1,
		intraname: "",
		name: "",
		picture: "",
		ladder: -1 ,
		status: "OFFLINE"
	});
	const navigate = useNavigate();
	const [errorMessage, setErrorMessage] = useState("");
	const [openSnack, setOpenSnack] = useState(false);
  
	function handleSnackbarClose(event?: React.SyntheticEvent | Event, reason?: string) {
		if (reason === 'clickaway') return;
		setOpenSnack(false);
		setTimeout(() => setErrorMessage(""), 150);
	};

	const imageParams = {
		backgroundImage: `url(${`/${bgSrc}_bg.png`})`,
		backgroundRepeat: "no-repeat",
		backgroundSize: "100%",
		backgroundPosition: "center"
	}

	const colorParams = {
		backgroundColor: bgSrc
	}
	
	useEffect(() => {
		const controller = new AbortController();
		const signal = controller.signal;
		
		if (player_id)
		{
			axios.get(`${url}/user/search?intraname=${player_id}`, {
				signal: signal,
			})
			.then((response) => {
				const user: IUser = response.data;
				setPlayer(user);		
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
		
		return () => {
			controller.abort();
		}
	}, [GameSocketState.openedGame?.id]);

	return (
		<Box
			display="flex"
			flexDirection="column"
			alignItems="center"
			width={windowSize.width > 1500 && windowSize.height > 670 ? "200px" : windowSize.width > 760  && windowSize.height > 370 ? "100px" : "50px"}
			height={windowSize.width > 1500 && windowSize.height > 670 ? "612px" : windowSize.width > 760  && windowSize.height > 370 ? "306px" : "153px"}
			borderRadius={borderRadius}
			sx={
				bgType === "image" ? imageParams : colorParams
			}
		>
			<Avatar
				alt={`player_avatar`}
				src={player.picture}
				sx={{
					marginTop: windowSize.width > 1500 && windowSize.height > 670 ? 5 : windowSize.width > 760  && windowSize.height > 370 ? 2.5 : 1.25,
					width: windowSize.width > 1500 && windowSize.height > 670 ? 120 : windowSize.width > 760  && windowSize.height > 370 ? 60 : 30,
					height: windowSize.width > 1500 && windowSize.height > 670 ? 120 : windowSize.width > 760  && windowSize.height > 370 ? 60 : 30,
					position: "absolute",
					border: windowSize.width > 1500 && windowSize.height > 670 ? 6 : windowSize.width > 760  && windowSize.height > 370 ? 3 : 2
				}}
			/>
			<Box margin="auto" width="1">
				<Typography
				variant={windowSize.width > 1500 && windowSize.height > 670 ? "h6" : windowSize.width > 760  && windowSize.height > 370 ? "body2" : "caption"}
				marginBottom={windowSize.width > 1500 && windowSize.height > 670 ? 15 : windowSize.width > 760  && windowSize.height > 370 ? 5: 1}
				width={1}
				display="flex"
				alignItems="center"
				justifyContent="center"
				color="white"
				sx={{
					backgroundColor: "black",
					opacity: "65%"
					}}
				>{player.name}</Typography>
				<Typography
					variant={windowSize.width > 1500 && windowSize.height > 670 ? "h2" : windowSize.width > 760  && windowSize.height > 370 ? "h5" : "body2"}
					width={1}
					display="flex"
					alignItems="center"
					justifyContent="center"
					color="white"
					sx={{
					backgroundColor: "black",
					opacity: "65%"
					}}
				>
					{score ? score : 0}
				</Typography>
			</Box>
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
