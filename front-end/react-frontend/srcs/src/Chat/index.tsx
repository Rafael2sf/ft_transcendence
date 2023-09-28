import { useContext, useEffect, useState } from "react";
import { ChannelDrawer } from "./ChatDrawer/ChannelDrawer";
import { NavBar } from "../GlobalComponents/NavBar";
import ChatBox from "./ChatBox";
import { Alert, Box, Snackbar } from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import WindowDims from "../Entities/WindowDims";
import { ChatDrawer } from "./ChatDrawer";
import { ChanWithMembers, DM } from "../Entities/ChatTemplates";
import { useLocation, useNavigate } from "react-router-dom";
import { url } from "../Constants/ApiPort";
import axios from "axios";
import { FriendDrawer } from "./ChatDrawer/FriendsDrawer";
import SocketContext from "../Contexts/ChatSocket/Context";
import { IUser } from "../Entities/ProfileTemplate";

const drawerWidth = 200;

export default function Chat({ windowSize }: { windowSize: WindowDims }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [channelsOpened, setChannelsOpened] = useState(() => {
    if (windowSize.width > 700) return true;
    return false;
  });
  const [friendsOpened, setFriendsOpened] = useState(() => {
    if (windowSize.width > 900) return true;
    return false;
  });
  const { SocketDispatch, SocketState } = useContext(SocketContext);
  const [errorMessage, setErrorMessage] = useState("");
  const [open, setOpen] = useState(false);

  function handleSnackbarClose(event?: React.SyntheticEvent | Event, reason?: string) {
	if (reason === 'clickaway') return;
	setOpen(false);
	setTimeout(() => setErrorMessage(""), 150);
};

  useEffect(() => {
	
	let id = location.pathname.slice(6);
	const controller = new AbortController();
	const signal = controller.signal;


	if (id.indexOf("channels") === 0) {
		
		// Defines limit and offset for getting channel members
		id += "?limit=100&offset=0";
		axios.get(`${url}/${id}`, {
			signal: signal,
		})
		.then((response) => {
			SocketDispatch({ type: 'update_opened_chatroom', payload: new ChanWithMembers(response.data)});
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
					setOpen(true);
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
			navigate(`/chat`);
		});
		
	}
	else if (id.indexOf("direct") === 0) {
		
		const openedDM = SocketState.DMs.find((DM) => DM.friend.intraname === id.slice(7)) ?? null;
		const newDM = {
			id: openedDM?.id as number,
			friend: openedDM?.friend as IUser,
		}
		SocketDispatch({ type: 'update_opened_chatroom', payload: openedDM ? new DM(newDM) : null});
	}
	else
		SocketDispatch({ type: 'update_opened_chatroom', payload: null});

	return () => {
		controller.abort();
	}
  }, [location]);

  //Responsiveness dependent on window size
  useEffect(() => {
    if (windowSize.width > 900) {
      if (!friendsOpened) setFriendsOpened(true);
      if (!channelsOpened) setChannelsOpened(true);
    } else if (windowSize.width > 700) {
      if (friendsOpened) setFriendsOpened(false);
      if (!channelsOpened) setChannelsOpened(true);
    } else if (windowSize.width > 0) {
      if (friendsOpened) setFriendsOpened(false);
      if (channelsOpened) setChannelsOpened(false);
    }
  }, [windowSize.width]);

  function handleChannelsOpen() {
    setChannelsOpened((prev: boolean) => !prev);
  }

  function handleFriendsOpen() {
    setFriendsOpened((prev: boolean) => !prev);
  }

  return (
    <Box
	  display="flex"
	  width="100%"
	  flexDirection="column"
	  marginTop='4rem'
	>
		<Box
		className="chat"
		sx={{
			flexGrow: "1",
			display: "flex",
			...(channelsOpened &&
			windowSize.width > 700 && {
				ml: `${drawerWidth}px`,
				width: `100% - ${drawerWidth}px`,
			}),
			...(friendsOpened &&
			windowSize.width > 900 && {
				mr: `${drawerWidth}px`,
				width: `100% - ${drawerWidth}px`,
			}),
			bgcolor: 'background.default',
			minHeight: 'calc(100vh - 4rem)'
		}}
		>
		<ChatDrawer
			showArrow={windowSize.width <= 700}
			isOpened={channelsOpened}
			handleDrawerState={handleChannelsOpen}
			title="Channels"
			tooltipPlacement="right"
			drawerAnchor="left"
			Arrow={ArrowForwardIosIcon}
			bgColor={"#C4AE7B"}
		>
			<ChannelDrawer
			setSelector={(channel) => {
		if (channel)
		navigate(`/chat/channels/${channel?.id}`);
		else
		navigate(`/chat`);
		}}
			drawerCloser={handleChannelsOpen}
			columnName="Channels"
			/>
		</ChatDrawer>
		<ChatBox />
		<ChatDrawer
			showArrow={windowSize.width <= 900}
			isOpened={friendsOpened}
			handleDrawerState={handleFriendsOpen}
			title="Friends"
			tooltipPlacement="left"
			drawerAnchor="right"
			Arrow={ArrowBackIosNewIcon}
			bgColor={"#C4AE7B"}
		>
			<FriendDrawer
			setSelector={(dm) => {
		if (dm)
		navigate(`/chat/direct/${dm?.friend.intraname}`);
		else
		navigate(`/chat`);
		}}
			drawerCloser={handleFriendsOpen}
			columnName="Friends"
			/>
		</ChatDrawer>
		</Box>
		<Snackbar
		autoHideDuration={2000}
		open={open}
		onClose={handleSnackbarClose}
		anchorOrigin={{
			vertical: 'bottom',
			horizontal: 'right',
		}}
	  >
		<Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
			{errorMessage}
        </Alert>
	  </Snackbar>
    </Box>
  );
}
