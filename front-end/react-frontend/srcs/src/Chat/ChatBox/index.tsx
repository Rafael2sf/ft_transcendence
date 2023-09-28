import {
	Alert,
  Box,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import { useEffect, useState, useRef, useContext } from "react";
import { ChatHistory } from "./ChatHistory";
import SocketContext from "../../Contexts/ChatSocket/Context";
import { Message } from "../../Entities/ChatTemplates";
import { DM, ChanWithMembers } from "../../Entities/ChatTemplates";

import { url } from "../../Constants/ApiPort";
import axios from "axios";
import ChatMenu from "./ChatMenu";
import ChatInput from "./ChatInput";
import { MESSAGES_ON_OPEN, MESSAGES_PER_REQUEST } from "./constants";
import { useNavigate } from 'react-router-dom';


interface IRequestParams {
  limit: number;
  offset: number;
}

export default function ChatBox() {
  const [convo, setConvo] = useState<Message[]>([]);
  const initialRender = useRef(true);
  const { SocketState } = useContext(SocketContext);
  const limitOffset = useRef<IRequestParams>({
    limit: MESSAGES_PER_REQUEST,
    offset: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [openSnack, setOpenSnack] = useState(false);

  function handleSnackbarClose(event?: React.SyntheticEvent | Event, reason?: string) {
	  if (reason === 'clickaway') return;
	  setOpenSnack(false);
	  setTimeout(() => setErrorMessage(""), 150);
  };

  /**Updates the conversation through websockets */
  useEffect(() => {
    if (initialRender.current) initialRender.current = false;
    else if (
      (SocketState.openedChatRoom instanceof ChanWithMembers &&
        SocketState.message?.channel_id === SocketState.openedChatRoom.id) ||
      (SocketState.openedChatRoom instanceof DM &&
        SocketState.message?.channel_id ===
          SocketState.openedChatRoom.friend.intraname)
    ) {
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

  /**Fetches both the channel's history and its members */
  useEffect(() => {
    setIsLoading(true);
    const controller = new AbortController();
    const signal = controller.signal;

    if (initialRender.current) initialRender.current = false;
    else if (SocketState.openedChatRoom instanceof ChanWithMembers) {
      axios.get(
          `${url}/channels/${SocketState.openedChatRoom.id}/history?limit=${MESSAGES_ON_OPEN}&offset=${0}`,
          {
            signal: signal,
          }
        )
        .then((newConvo) => {
          setConvo(newConvo.data);
          setIsLoading(false);
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
    } else if (SocketState.openedChatRoom) {
      setIsLoading(true);
      axios.get(
          `${url}/direct/${SocketState.openedChatRoom.friend.intraname}/history?limit=${MESSAGES_ON_OPEN}&offset=${0}`,
          {
            signal: signal,
          }
        )
        .then((newConvo) => {
          setConvo(newConvo.data);
          setIsLoading(false);
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
    }
    return () => {
      controller.abort();
    };
  }, [SocketState.openedChatRoom, SocketState.blockedUsers]);

  if (SocketState.openedChatRoom === null) {
    return  (
      <Box sx={{
		flexGrow: 1, 
		backgroundImage: `url(${`/newChatBg.jpg`})`,
		backgroundRepeat: "repeat",
		}}
		padding={1}
		>
		
		<em>Please select a channel</em>
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

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "calc(100vh - 4rem)",
		  backgroundImage: `url(${`/newChatBg.jpg`})`,
		  backgroundRepeat: "repeat"
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{
	  display: 'flex', 
	  flexDirection: 'column', 
	  flexGrow: 1, 
	  maxHeight:'calc(100vh - 4rem)', 
	  position: 'relative',
	  backgroundImage: `url(${`/newChatBg.jpg`})`,
	  backgroundRepeat: "repeat"
	}}>
		<ChatMenu socketState={SocketState} />
		<ChatHistory convo={convo} setConvo={setConvo} limitOffset={limitOffset} socketState={SocketState}/>
		<ChatInput socketState={SocketState} />
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
