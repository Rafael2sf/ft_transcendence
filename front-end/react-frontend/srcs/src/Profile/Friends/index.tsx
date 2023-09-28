import { Alert, Box, Grid, Pagination, Snackbar, Typography } from '@mui/material';
import axios from 'axios';
import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { url } from '../../Constants/ApiPort';
import SocketContext from '../../Contexts/ChatSocket/Context';
import { IUser } from '../../Entities/ProfileTemplate';
import WindowDims from '../../Entities/WindowDims';
import FriendCard from './FriendCard';
import { useLocation } from 'react-router-dom';

export default function Friends({ windowSize, profileOwner }: { windowSize: WindowDims, profileOwner: IUser }) {

	const { SocketState } = useContext(SocketContext);
	const [page, setPage] = useState<number>(1);
	const [friendsList, setFriendsList] = useState<IUser[]>([]);
	const [friendCardList, setFriendCardList] = useState<JSX.Element[]>([]);
	const initialRender = useRef<boolean>(true);
	const navigate = useNavigate();
	const location = useLocation();
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
		
		axios.get(`${url}/user/${profileOwner.intraname}/friends`, {
			signal: signal,
		})
		.then((response) => {
			const resList: IUser[] = response.data;
			setFriendsList(resList);
			const firstDivList = resList.slice((page - 1) * 7, page * 7).map( (friend, index) => (
				<FriendCard key={index} profileOwner={profileOwner} friend={friend}></FriendCard>
			))
			setFriendCardList(firstDivList);
		})
		.catch((error) => {
			if (error.response) {
				// The request was made and the server responded with a status code
				// that falls out of the range of 2xx
				if (error.response.status === 401)
				{
					navigate("/login");
					return;
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
		
		if (friendsList.length !== 0)
		{
			const newList = friendsList.slice((page - 1) * 7, page * 7).map( (friend, index) => (
				<FriendCard key={index} friend={friend} profileOwner={profileOwner}></FriendCard>
			))
			setFriendCardList(newList);
			if (page > 0 && newList.length === 0)
				setPage((oldVal) => oldVal - 1);
		} else setFriendCardList([]);
	}, [page, friendsList]);

	useEffect(() => {
		
		if (friendsList.length !== 0 && initialRender.current === false)
		{
			const newList = SocketState.DMs.map( (chatFriend) => chatFriend.friend )
			setFriendsList(newList);
		}
		initialRender.current = false;

	}, [SocketState.DMs]);
	
	return (
		<Box display="flex" flexDirection="column" alignItems="center" height="100%">
			<Typography variant='h5'>FRIEND LIST</Typography>
			<Box display="flex" flexDirection="column" alignItems="center" height="100%" width="100%" >
				<Grid container rowGap={1}  paddingY={1} sx={{width: '100%', maxHeight: windowSize.width >= 900 ? "74vh" : "270px", overflowY: "auto"}} >
					{friendCardList}
				</Grid>
			</Box>
			<Pagination
			sx={{ m: 1, display: "flex", justifyContent: "center" }}
			count={Math.ceil(friendsList.length / 7)}
			variant='outlined'
			color='primary'
			onChange={(e, value) => setPage(value)}
			/>
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
