import { Alert, Box, CircularProgress, Snackbar } from "@mui/material";
import { PropsWithChildren, useContext, useEffect, useReducer, useState } from "react";
import { IGameEvent, IGameObject, ILadderUpdate } from "../../Entities/GameTemplates";
import { useSocket } from "../../Hooks/useSocket";
import {
  defaultGameSocketContextState,
  GameSocketContextProvider,
  GameSocketReducer,
} from "./GameContext";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";

export interface IGameSocketContextComponentProps extends PropsWithChildren {
	gameId: number;
  userId: number;
}

function GameSocketContextComponent(props: IGameSocketContextComponentProps) {
  const { children } = props;

  const [GameSocketState, GameSocketDispatch] = useReducer(
    GameSocketReducer,
    defaultGameSocketContextState
  );
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const socket = useSocket(`ws://${import.meta.env.VITE_BASEURL}:3000`, {
    reconnectionAttempts: 5,
    reconnectionDelay: 5000,
    autoConnect: false,
    query: { gameId: props.gameId },
	  withCredentials: true,
    path: "/lobby",
  });
  const navigate = useNavigate();
  const { userState, setUserState } = useContext(UserContext);


	function handleSnackbarClose(event?: React.SyntheticEvent | Event, reason?: string) {
		if (reason === 'clickaway') return;
		setOpen(false);
	  };

  function StartListeners() {

	/**Connection failure due to lack of auth */
	socket.on("connect_error", (err) => {
		console.log(err instanceof Error); // true
		console.log(err.message); // not authorized
		// navigate("/login");
	});

	/**Reconnect event */
    socket.io.on("reconnect", (attempt) => {
      console.info("Reconnected on attempt: " + attempt);
    });

    /**Reconnect attempt event */
    socket.io.on("reconnect_attempt", (attempt) => {
      console.info("Reconnection attempt: " + attempt);
    });

    /**Reconnect error */
    socket.io.on("reconnect_error", (error) => {
      console.info("Error on reconnection: ", error);
    });

    /**Reconnect failed */
    socket.io.on("reconnect_failed", () => {
      console.info("Reconnection failure");
      alert("We are unable to connect you right now.");
    });

	socket.on("game.update.spectators", (newSpectator: IGameEvent) => {
		GameSocketDispatch({ type: "update_game_spectators", payload: newSpectator });
	});

	socket.on("game.update", (gameUpdate: IGameObject) => {
		GameSocketDispatch({ type: "update_game_render", payload: gameUpdate });
	});

  socket.on("error", () => {

		GameSocketDispatch({ type: "error", payload: null});
	});

	socket.on("game.achievement", (gameUpdate: IGameObject) => {
		setOpen(true);
	});

	socket.on("game.winner.update", (ladderUpdate: ILadderUpdate) => {
		if (userState.id === ladderUpdate.user_id)
			setUserState((user) => {return {...user, ladder: ladderUpdate.new_ladder}});
	});
  }

  useEffect(() => {
    /** Connect to websocket */
    socket.connect();

    /** Save the socket in context*/
    GameSocketDispatch({ type: "update_socket", payload: socket });

    /** Start event listeners*/
    StartListeners();

    // /** Send handshake */
    // SendHandshake();

    setLoading(false);
  }, []);

  if (loading) return <Box height="100vh" width="100vw" display="flex" sx={{justifyContent: "center", alignItems: "center"}} ><CircularProgress /></Box>;

  return (
    <GameSocketContextProvider value={{ GameSocketState: GameSocketState, GameSocketDispatch: GameSocketDispatch }}>
      {children}
	  <Snackbar
		autoHideDuration={2000}
		open={open}
		onClose={handleSnackbarClose}
		anchorOrigin={{
			vertical: 'bottom',
			horizontal: 'right',
		}}
	  >
		<Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
			Achievement unlocked! Check your profile
        </Alert>
	  </Snackbar>
    </GameSocketContextProvider>
  );
}

export default GameSocketContextComponent;
