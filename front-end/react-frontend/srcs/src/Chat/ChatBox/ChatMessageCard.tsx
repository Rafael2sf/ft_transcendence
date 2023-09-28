import { Box, Stack, Typography, styled, Button } from "@mui/material";
import axios from "axios";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { url } from "../../Constants/ApiPort";
import SocketContext from "../../Contexts/ChatSocket/Context";
import { Message } from "../../Entities/ChatTemplates";
import { GameScope, IGameResults } from "../../Entities/GameTemplates";
import { NewGameOrJoinModal } from "../../GameLobby/LobbyActions/NewGameOrJoinModal";

const StyledTypography = styled(Typography)({
  "&:hover": {
    cursor: "pointer",
    textDecoration: "underline",
  },
});

export const ChatMessageCard = ({
  message,
  memberNameClick,
}: {
  message: Message;
  memberNameClick: any;
}) => {

	const navigate = useNavigate();
	const [joinGameOpen, setJoinGameOpen] = useState(false);
  const [isGameDead, setIsGameDead] = useState(true);

  function IsGameOpen() {
    const controller = new AbortController();
		const signal = controller.signal;
		const requestTimeout = setTimeout(() => controller.abort(), 5000);

    if (message.game_id === null)
      return ;

    axios.get(`${url}/games_sessions/${message.game_id}`, {
      signal: signal,
    })
    .then(response => {
      setIsGameDead(false);
    })
    .catch ((error) => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 401)
        {
          navigate("/login");
          return;
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
    clearTimeout(requestTimeout);
  }

  IsGameOpen();

	function GetInviteGame(game_id: number) {

		const controller = new AbortController();
		const signal = controller.signal;
		const requestTimeout = setTimeout(() => controller.abort(), 5000);

		axios.get(`${url}/games_sessions/${game_id}`, {
			signal: signal,
		})
		.then((response) => {
			const game: IGameResults = response.data;
			if (game.state === "WAITING_FOR_PLAYERS")
				setJoinGameOpen(true);
			else
				navigate(`/lobby/${game.id}`);
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
				else if (error.response.status === 404) {}
					// setIsGameDead(true);
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
		clearTimeout(requestTimeout);
	}

	return (
		<Box
			key={message.id}
			borderRadius="12px"
			sx={{
			backgroundColor: "#D5D7D9",
			boxShadow: 4,
			}}
			margin={1}
			padding={1}
		>
			<Stack border="0px" direction="row" spacing={1}>
			<img
								src={message.sender.picture}
								alt='profile_image'
								style={{ borderRadius: '50%', textAlign: "center", lineHeight: "48px"}}
								width='48px'
								height='48px'
							/>
			<Stack>
				<Stack direction="row" alignItems="center">
				<StyledTypography
					id={message.sender.name}
					marginTop={1}
					sx={{ fontWeight: "bold" }}
					color="success.dark"
					onClick={(event) =>
					memberNameClick(event, message.id, message.sender)
					}
				>
					{message.sender.name}:
				</StyledTypography>
				</Stack>
				<Typography
				variant="body1"
				color="black"
				sx={{ wordWrap: "anywhere" }}
				>
				{message.text}
				</Typography>
			</Stack>
			</Stack>
			<Box
				display="flex"
        width="100%"
				justifyContent={message.game_id !== null ? "space-between" : "flex-end"}
				alignItems="flex-end"
			>
				{ message.game_id !== null &&
				<>
					<Button
						aria-label="Join game"
						variant="outlined"
						sx={{ paddingY: 0, backgroundColor: "#001C30"}}
						disabled={isGameDead}
						onClick={() => GetInviteGame(message.game_id as number)}
					>
						{isGameDead ? "Game Finished" : "Join Game"}
					</Button>
					{ joinGameOpen &&
						<NewGameOrJoinModal
              scope={GameScope.PRIVATE}
							open={joinGameOpen}
							closeModal={() => setJoinGameOpen(false)}
							isFirstPlayer={false}
							sendInvite={null}
						/>
					}
				</>
				}
				<Typography
					variant="caption"
					color="black"
				>
					{new Date(message.createdAt).toLocaleString()}
				</Typography>
			</Box>
		</Box>
)};
