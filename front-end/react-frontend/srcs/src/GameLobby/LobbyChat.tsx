import { Alert, Box, Button, Snackbar, Stack, Typography } from '@mui/material';
import axios from 'axios';
import { useContext, useEffect, useRef, useState } from 'react'
import { ChatHistory } from '../Chat/ChatBox/ChatHistory';
import { MESSAGES_ON_OPEN, MESSAGES_PER_REQUEST } from '../Chat/ChatBox/constants';
import { url } from '../Constants/ApiPort';
import SocketContext from '../Contexts/ChatSocket/Context';
import { Message } from '../Entities/ChatTemplates';
import { useNavigate } from 'react-router-dom';
import WindowDims from '../Entities/WindowDims';

interface IRequestParams {
	limit: number;
	offset: number;
  }

export default function LobbyChat({windowSize}: {windowSize:WindowDims}) {
	const [convo, setConvo] = useState<Message[]>([]);
	const limitOffset = useRef<IRequestParams>({
		limit: MESSAGES_PER_REQUEST,
		offset: 0,
	  });
	const { SocketState } = useContext(SocketContext);
	const navigate = useNavigate();
    const id = '00000000-0000-0000-0000-000000000000'
	const [errorMessage, setErrorMessage] = useState("");
	const [openSnack, setOpenSnack] = useState(false);
  
	function handleSnackbarClose(event?: React.SyntheticEvent | Event, reason?: string) {
		if (reason === 'clickaway') return;
		setOpenSnack(false);
		setTimeout(() => setErrorMessage(""), 150);
	};

	 /**Updates the conversation through websockets */
	useEffect(() => {
		if (SocketState.message?.channel_id === id) {
		  limitOffset.current = {
			limit: limitOffset.current.limit,
			offset: limitOffset.current.offset + 1,
		};

		if (SocketState.message)
			setConvo((prev: Message[]) => [
			  SocketState.message as Message,
			  ...prev,
			]);
		}
	}, [SocketState.message]);

	useEffect(() => {

		const controller = new AbortController();
		const signal = controller.signal;

		axios.get(
          `${url}/channels/${id}/history?limit=${MESSAGES_ON_OPEN}&offset=${0}`,
          {
            signal: signal,
          }
        )
        .then((newConvo) => {
          setConvo(newConvo.data);
          limitOffset.current.offset = newConvo.data.length;
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
            console.log("Error: ", error.message);
          }
          if (convo.length) setConvo([]);
        });
		return () => {
			controller.abort();
		}
	  }, []);

	return (
	    <Box
		  borderRight={1}
		  borderLeft={1}
		  order={3}
		  sx={{
			display: 'flex',
			flexDirection: 'column',
			width: windowSize.width > 1080 ? "300px" : "100%",
			maxHeight: windowSize.width > 1080 ? 'calc(100vh - 4rem)' : "300px",
			position: 'relative',
			backgroundImage: `url(${`/newChatBg.jpg`})`,
			backgroundRepeat: "repeat"
		  }}>
			  <Typography width={windowSize.width > 1080 ? "300px" : "100%"} border={3} display="flex" justifyContent="center" variant="h4" sx={{backgroundColor: "#0d283b"}}>General</Typography>
			  <ChatHistory convo={convo} setConvo={setConvo} limitOffset={limitOffset} socketState={SocketState}/>
			  <Stack direction='row' alignSelf="center" width="100%">
				<Button
				aria-label="go to chat"
				onClick={() => navigate("/chat")}
				variant="contained"
				fullWidth
				sx={{margin: 1, border: 2, backgroundColor: "#001C30"}}
				>
					Go To Chat
				</Button>
			</Stack>
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
