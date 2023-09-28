import { Button } from '@mui/material'
import { useContext, useState } from 'react'
import SocketContext from '../../Contexts/ChatSocket/Context';
import { ChanWithMembers } from '../../Entities/ChatTemplates';
import { NewGameOrJoinModal } from '../../GameLobby/LobbyActions/NewGameOrJoinModal';
import { GameScope } from '../../Entities/GameTemplates';

export default function GameInviteButton({muteChecker} : {muteChecker: string}) {

	const { SocketState } = useContext(SocketContext);
	const inviteBody = "Hey, want to play a game of Pong! Care to join me?"
	const [newGameOpen, setNewGameOpen] = useState(false);

	function sendMessage(gameId: number) {
		if (SocketState.openedChatRoom)
		{
			if (SocketState.openedChatRoom instanceof ChanWithMembers) {
        SocketState.socket?.emit("channel.message.create", { "text": inviteBody, "channel_id": SocketState.openedChatRoom.id, "game_id": gameId});
      }
			else
				SocketState.socket?.emit("direct.message.create", { "text": inviteBody, "intraname": SocketState.openedChatRoom?.friend.intraname, "game_id": gameId});
		}
	};

	return (
		<>
			<Button
			aria-label="Game Invite"
			variant="contained"
      onClick={() => setNewGameOpen(true)}
			sx={{ marginX: 0.5, backgroundColor: "#001C30", height: "73px"}}
			// onClick={() => GetInviteGame(message.game_id as number)}
      disabled={muteChecker.indexOf("You have been muted") === 0}
			>
				Game Invite
			</Button>
			{ newGameOpen &&
				<NewGameOrJoinModal
        scope={GameScope.PRIVATE}
				open={newGameOpen}
				closeModal={() => setNewGameOpen(false)}
				sendInvite={(gameCreated: number) => sendMessage(gameCreated)}
				isFirstPlayer={true}
			/>
		}
		</>
	)
}
