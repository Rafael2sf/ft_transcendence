import { Avatar, Button, DialogActions, List, ListItem, ListItemAvatar, ListItemButton, ListItemText } from "@mui/material";
import { useState, useContext } from "react";
import { ChanWithMembers, IChatMember } from "../../../../Entities/ChatTemplates";
import SocketContext from "../../../../Contexts/ChatSocket/Context";
import { BanModal } from "./BanModal";


export function BanSubTab() {

	const [banSelect, setBanSelect] = useState<null | IChatMember>(null);
	const [openBanModal, setOpenBanModal] = useState<boolean>(false);
	const { SocketState } = useContext(SocketContext);

	
	const banList = (SocketState.openedChatRoom as ChanWithMembers).users.map((user) => 
	(SocketState.openedChatRoom as ChanWithMembers).user_role === "OWNER" ?
	(
		<ListItem key={user.user.id} disablePadding>
			<ListItemButton
			  selected={banSelect?.user.id === user.user.id}
			  onClick={() => setBanSelect(user)}
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
			  selected={banSelect?.user.id === user.user.id}
			  onClick={() => setBanSelect(user)}
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
				{banList}
			</List>
			<DialogActions>
				<Button
				  disabled={banSelect === null }
				  color="error"
				  variant="contained"
				  onClick={() => setOpenBanModal(true)}
				>
					Ban
				</Button>
			</DialogActions>
			{openBanModal && banSelect &&
				<BanModal open={openBanModal} closeModal={() => setOpenBanModal(false)} userToBan={banSelect} channelId={SocketState.openedChatRoom?.id as string}></BanModal>
			}
		</div>
	)
}