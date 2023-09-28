import { Avatar, Button, DialogActions, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Typography } from "@mui/material";
import { useState, useContext } from "react";
import { ChanWithMembers, IChatMember } from "../../../../Entities/ChatTemplates";
import SocketContext from "../../../../Contexts/ChatSocket/Context";
import { PromoteModal } from "./PromoteModal";
import { DemoteModal } from "./DemoteModal";


export function OwnerTab() {

	const [memberSelect, setMemberSelect] = useState<null | IChatMember>(null);
	const [openPromoteModal, setOpenPromoteModal] = useState<boolean>(false);
	const [openDemoteModal, setOpenDemoteModal] = useState<boolean>(false);
	const { SocketState } = useContext(SocketContext);

	
	const memberList = (SocketState.openedChatRoom as ChanWithMembers).users.map((user) => 
	(
		<ListItem key={user.user.id} disablePadding>
			<ListItemButton
			  selected={memberSelect?.user.id === user.user.id}
			  onClick={() => setMemberSelect(user)}
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
	));
	
	return (
		<div>
			<List sx={{ maxHeight: "300px", overflowY: "auto"}}>
				{memberList}
			</List>
			<DialogActions>
				<Button
				  disabled={memberSelect === null || (memberSelect !== null && memberSelect.role === "ADMIN")}
				  onClick={() => setOpenPromoteModal(true)}
				  >
					Promote
				</Button>
				<Button
				  disabled={memberSelect === null  || (memberSelect !== null && memberSelect.role === "USER")}
				  color="error"
				  variant="contained"
				  onClick={() => setOpenDemoteModal(true)}
				>
					Demote
				</Button>
			</DialogActions>
			{openPromoteModal && memberSelect &&
				<PromoteModal open={openPromoteModal} closeModal={() => setOpenPromoteModal(false)} userToPromote={memberSelect} channelId={SocketState.openedChatRoom?.id as string}></PromoteModal>
			}
			{openDemoteModal && memberSelect &&
				<DemoteModal open={openDemoteModal} closeModal={() => setOpenDemoteModal(false)} userToDemote={memberSelect} channelId={SocketState.openedChatRoom?.id as string}></DemoteModal>
			}
		</div>
	)
}