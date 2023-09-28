import { Alert, Box, Grid, Snackbar, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { url } from "../../Constants/ApiPort";
import { IAchievement, IAchievementUser, IUser } from "../../Entities/ProfileTemplate";
import WindowDims from "../../Entities/WindowDims";
import AchievementCard from "./AchievementCard";

export default function Achievements({profileOwner, windowSize}: {profileOwner: IUser, windowSize: WindowDims}) {

	const [achievementsList, setAchievementsList] = useState<IAchievement[]>([]);
	const [achievementsJSX, setAchievementsJSX] = useState<JSX.Element[]>([]);
	const firstRender = useRef(true);
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
		
		axios.get(`${url}/achievements`, {
			signal: signal,
			headers: {
				"Authorization": "Bearer 1",
			}
		})
		.then((response) => {
			const resList: IAchievement[] = response.data;
			setAchievementsList(resList);
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

		return () => {
			setTimeout(() => controller.abort(), 5000);
		}
	}, []);

	useEffect(() => {

		if (firstRender.current === false)
		{

			const controller = new AbortController();
			const signal = controller.signal;
				
			axios.get(`${url}/user/${profileOwner.id}/achievements`, {
				signal: signal,
				headers: {
					"Authorization": "Bearer 1",
				}
			})
			.then((response) => {
				const resList: IAchievementUser[] = response.data;
				const divList = achievementsList.map((achievementItem) => (
					<AchievementCard
					  key={achievementItem.id}
					  achievement={achievementItem}
					  gotIt={resList.find((userAchievement) => userAchievement.achievement_id === achievementItem.id) === undefined ? false : true}
					/>
				));
				divList.sort((a, b) => (a.props.gotIt === true ? 0 : 1) - (b.props.gotIt === true ? 0 : 1) );
				setAchievementsJSX(divList);
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
	
			return () => {
				setTimeout(() => controller.abort(), 5000);
			}
		}
		else
			firstRender.current = false;
	}, [achievementsList, profileOwner]);
	
	return (
		<Box display="flex" flexDirection="column" alignItems="center" height="100%">
			<Typography variant='h5'>ACHIEVEMENTS</Typography>
			<Box display="flex" flexDirection="column" alignItems="center" height="100%" width="100%" >
				<Grid
				  container
				  alignItems="stretch"
				  rowGap={1}
				  paddingY={1}
				  sx={{
					width: '100%',
					maxHeight: windowSize.width >= 900 ? "80vh" : "270px",
					overflowY: "auto"}} >
					{achievementsJSX}
				</Grid>
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
