import { Avatar, Button, DialogActions, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Typography } from "@mui/material";
import { useState, useContext } from "react";
import { ChanWithMembers, IChatMember } from "../../../../Entities/ChatTemplates";
import SocketContext from "../../../../Contexts/ChatSocket/Context";
import { KickModal } from "./KickModal";


export function KickTab() {

	const [kickSelect, setKickSelect] = useState<null | IChatMember>(null);
	const [openKickModal, setOpenKickModal] = useState<boolean>(false);
	const { SocketState } = useContext(SocketContext);

	
	const kickList = (SocketState.openedChatRoom as ChanWithMembers).users.map((user) => 
	(SocketState.openedChatRoom as ChanWithMembers).user_role === "OWNER" ?
	(
		<ListItem key={user.user.id} disablePadding>
			<ListItemButton
			  selected={kickSelect?.user.id === user.user.id}
			  onClick={() => setKickSelect(user)}
			>
				<ListItemAvatar>
					<Avatar
					alt={`Avatar image`}
					src={user.user.picture}
                	/>
				</ListItemAvatar>
				<ListItemText 
				  primary={user.user.name}
				  secondary={ user.role === "ADMIN" ? "Channel Admin" : "Member"}
				/>
			</ListItemButton>
		</ListItem>
	)
	:
	user.role === "USER" && (
		<ListItem key={user.user.id} disablePadding>
			<ListItemButton
			  selected={kickSelect?.user.id === user.user.id}
			  onClick={() => setKickSelect(user)}
			>
				<ListItemAvatar>
					<Avatar
					alt={`Avatar image`}
					src={user.user.picture}
                	/>
				</ListItemAvatar>
				<ListItemText 
				  primary={user.user.name}
				  secondary={"Member"}
				/>
			</ListItemButton>
		</ListItem>
	)
	);
	
	return (
		<div>
			<List sx={{ maxHeight: "300px", overflowY: "auto"}}>
				{kickList}
			</List>
			<DialogActions>
				<Button
				  disabled={kickSelect === null }
				  color="error"
				  variant="contained"
				  onClick={() => setOpenKickModal(true)}
				>
					Kick
				</Button>
			</DialogActions>
			{openKickModal && kickSelect &&
				<KickModal open={openKickModal} closeModal={() => setOpenKickModal(false)} userToKick={kickSelect} channelId={SocketState.openedChatRoom?.id as string}></KickModal>
			}
		</div>
	)
}