import { PropsWithChildren, useEffect, useReducer, useState, useContext } from "react";
import {
  Channel,
  DM,
  RoleType,
} from "../../Entities/ChatTemplates";
import { Message } from "../../Entities/ChatTemplates";
import { useSocket } from "../../Hooks/useSocket";
import {
  defaultSocketContextState,
  SocketContextProvider,
  SocketReducer,
} from "./Context";
import axios from "axios";
import { url } from "../../Constants/ApiPort";
import { useNavigate } from "react-router-dom";
import { IUser } from "../../Entities/ProfileTemplate";
import { UserContext } from "../UserContext";
import { Alert, Snackbar } from "@mui/material";

export interface ISocketContextComponentProps extends PropsWithChildren {}

//Same as IChatMember
interface UserRole {
  user: IUser;
  role: RoleType;
  muted: number | undefined;
}

export interface ChannelEvent {
  channel_id: string;
  user: UserRole;
}

export interface UpdateFriendRoom {
  intraname: string;
  status: "ONLINE" | "OFFLINE";
}

export interface ChannelEventWithID extends ChannelEvent {
	my_id: number;
}

export interface ChannelActionWithEvent extends ChannelAction {
	event: string;
}

export interface ChannelAction {
  channel_id: string;
  user: UserRole;
  target: UserRole;
  seconds?: number;
}

function SocketContextComponent(props: ISocketContextComponentProps) {
  const { userState } = useContext(UserContext);
  const { children } = props;
  const [SocketState, SocketDispatch] = useReducer(
    SocketReducer,
    defaultSocketContextState
  );
  const [loading, setLoading] = useState(true);

  const socket = useSocket(`ws://${import.meta.env.VITE_BASEURL}:3000`, {
    reconnectionAttempts: 5,
    reconnectionDelay: 5000,
    autoConnect: false,
    withCredentials: true,
    path: "/chat",
  });
  const navigate = useNavigate();

  function StartListeners() {
	  
	  /**Connection failure due to lack of auth */
	socket.on("connect_error", (err) => {
		console.error(err instanceof Error); // true
		console.error(err.message); // not authorized
		// navigate("/login");
	});
	
    /**Reconnect event */
    socket.io.on("reconnect", (attempt) => {
      console.error("Reconnected on attempt: " + attempt);
      // SendHandshake();
    });
	
    /**Reconnect attempt event */
    socket.io.on("reconnect_attempt", (attempt) => {
		console.error("Reconnection attempt: " + attempt);
    });

    /**Reconnect error */
    socket.io.on("reconnect_error", (error) => {
		console.error("Error on reconnection: ", error);
    });
	
    /**Reconnect failed */
    socket.io.on("reconnect_failed", () => {
		console.error("Reconnection failure");
		alert("We are unable to connect you right now.");
    });
	

	/** Message event */
	socket.on("channel.message.create", (message: Message) => {
	  SocketDispatch({ type: "message_received", payload: message });
	});

	socket.on("direct.message.create", (message: Message) => {
	  SocketDispatch({ type: "message_received", payload: message });
	});

    /**Join room*/
    socket.on("channel.room.join.ack", (channel: Channel) => {
      SocketDispatch({ type: "add_channel", payload: channel });
    });

    /**Join friend room*/
    socket.on("direct.room.join", (intraname: string) => {
      SocketDispatch({ type: "update_friendroom", payload: { intraname, status: 'ONLINE' } });
    });

    // /**Friend is online*/
    socket.on("direct.room.leave", (intraname: string) => {
      SocketDispatch({ type: "update_friendroom", payload: { intraname, status: 'OFFLINE' }  });
    });

    /**Friend is offline*/
    socket.on("direct.room.join.ack", (friendRoom: DM) => {
      SocketDispatch({ type: "add_friendroom", payload: friendRoom });
    });

    /**Someone is now online in opened channel*/
    socket.on("channel.room.join", (roomJoin: ChannelEvent) => {
      SocketDispatch({ type: "update_room_member", payload: { ...roomJoin, my_id: userState.id } });
    });

    /**Someone is now offline in opened channel*/
    socket.on("channel.room.leave", (roomLeave: ChannelEvent) => {
      SocketDispatch({ type: "update_room_member", payload: { ...roomLeave, my_id: userState.id } });
    });

    /**Changed privacy setting of opened channel*/
    socket.on("channel.update", (newConfig: Channel) => {
      SocketDispatch({ type: "update_channel", payload: newConfig });
    });

    /**Notice of a deleted channel*/
    socket.on("channel.delete", (data: ChannelEvent) => {
      SocketDispatch({ type: "remove_channel", payload: data.channel_id });
    });

    /**Notice of a deleted DM*/
    socket.on("direct.delete", (intraname: string) => {
      SocketDispatch({ type: "unfriend", payload: intraname });
    });

    /**Someone joined opened channel*/
    socket.on("channel.user.join", (newJoiner: ChannelEvent) => {
      SocketDispatch({ type: "update_members_list", payload: { 
		channel_id: newJoiner.channel_id,
		user: newJoiner.user,
		my_id: userState.id}});
    });

    /**Someone's role changed in opened channel*/
    socket.on("channel.user.update", (newRole: ChannelEvent) => {
      SocketDispatch({ type: "update_room_member", payload: { ...newRole, my_id: userState.id } });
    });

    /**Someone left opened channel*/
    socket.on("channel.user.leave", (leavingUser: ChannelEvent) => {
      SocketDispatch({ type: "update_members_list", payload: { 
		channel_id: leavingUser.channel_id,
		user: leavingUser.user,
		my_id: userState.id}});
    });

    /**Someone in the opened channel was muted*/
    socket.on("channel.user.mute", (muteUser: ChannelAction) => {
      muteUser.target.muted = Date.now() + (muteUser.seconds || 1) * 1000;
      const converter: ChannelEvent = {
        channel_id: muteUser.channel_id,
        user: muteUser.target,
      };
      SocketDispatch({ type: "update_room_member", payload: { ...converter, my_id: userState.id } });
    });

    /**Someone in the opened channel was unmuted*/
    socket.on("channel.user.unmute", (unmuteUser: ChannelAction) => {
      unmuteUser.target.muted = undefined;
      const converter: ChannelEvent = {
        channel_id: unmuteUser.channel_id,
        user: unmuteUser.target,
      };
      SocketDispatch({ type: "update_room_member", payload: { ...converter, my_id: userState.id } });
    });

    /**Someone in the opened channel was kicked*/
    socket.on("channel.user.kick", (kickUser: ChannelAction) => {
      const converter: ChannelEventWithID = {
        channel_id: kickUser.channel_id,
        user: kickUser.target,
		my_id: userState.id
      };
      SocketDispatch({ type: "update_members_list", payload: { ...converter, event: 'kicked' } });
    });

    /**Someone in the opened channel was banned*/
    socket.on("channel.user.ban", (banUser: ChannelAction) => {
      const converter: ChannelEventWithID = {
        channel_id: banUser.channel_id,
        user: banUser.target,
		my_id: userState.id

      };
      SocketDispatch({ type: "update_members_list", payload: { ...converter, event: 'banned' } });
    });

    /**Someone invited this user to join a channel*/
    socket.on("channel.invite", (payload: { channel_id: string }) => {
      socket.emit("channel.room.join", payload.channel_id);
    });
  }

  const [errorMessage, setErrorMessage] = useState("");
  const [openSnack, setOpenSnack] = useState(false);

  function handleSnackbarClose(event?: React.SyntheticEvent | Event, reason?: string) {
	  if (reason === 'clickaway') return;
	  setOpenSnack(false);
	  setTimeout(() => setErrorMessage(""), 150);
  };

  async function getBlockedUsers() {
    const controller = new AbortController();
    const signal = controller.signal;
    const requestTimeout = setTimeout(() => controller.abort(), 5000);

    try {
      const res = await axios.get(`${url}/user/blocked/me`, {
        signal: signal,
      });
      SocketDispatch({ type: "update_blocked", payload: res.data });
    } catch (error: any) {
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
    }
    clearTimeout(requestTimeout);
  }

  useEffect(() => {
    /** Connect to websocket */
    socket.connect();

    /** Save the socket in context*/
    SocketDispatch({ type: "update_socket", payload: socket });

    /** Start event listeners*/
    StartListeners();

    // /** Send handshake */
    // SendHandshake();

    /** Get all blocked users */
    getBlockedUsers();

    setLoading(false);
  }, []);

  if (loading) return <p>Loading Socket IO....</p>;

  return (
    <SocketContextProvider value={{ SocketState, SocketDispatch }}>
      {children}
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
    </SocketContextProvider>
  );
}

export default SocketContextComponent;
