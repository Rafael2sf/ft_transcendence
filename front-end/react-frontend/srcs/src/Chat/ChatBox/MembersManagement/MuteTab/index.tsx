import {
  Avatar,
  Button,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { useState, useContext } from "react";
import {
  ChanWithMembers,
  IChatMember,
} from "../../../../Entities/ChatTemplates";
import { MuteModal } from "./MuteModal";
import { UnmuteModal } from "./UnmuteModal";
import SocketContext from "../../../../Contexts/ChatSocket/Context";

export function MuteTab() {
  const [muteSelect, setMuteSelect] = useState<null | IChatMember>(null);
  const [openMuteModal, setOpenMuteModal] = useState<boolean>(false);
  const [openUnmuteModal, setOpenUnmuteModal] = useState<boolean>(false);
  const { SocketState } = useContext(SocketContext);

  const muteList = (SocketState.openedChatRoom as ChanWithMembers).users.map(
    (user) =>
      (SocketState.openedChatRoom as ChanWithMembers).user_role === "OWNER" ? (
        <ListItem key={user.user.id} disablePadding>
          <ListItemButton
            selected={muteSelect?.user.id === user.user.id}
            onClick={() => setMuteSelect(user)}
          >
            <ListItemAvatar>
              <Avatar alt={`Avatar image`} src={user.user.picture} />
            </ListItemAvatar>
            <ListItemText
              primary={user.user.name}
              secondary={
                user.muted ? new Date(user.muted).toLocaleString() : "N/A"
              }
            />
          </ListItemButton>
        </ListItem>
      ) : (
        user.role === "USER" && (
          <ListItem key={user.user.id} disablePadding>
            <ListItemButton
              selected={muteSelect?.user.id === user.user.id}
              onClick={() => setMuteSelect(user)}
            >
              <ListItemAvatar>
                <Avatar alt={`Avatar image`} src={user.user.picture} />
              </ListItemAvatar>
              <ListItemText
                primary={user.user.name}
                secondary={
                  user.muted ? new Date(user.muted).toLocaleString() : "N/A"
                }
              />
            </ListItemButton>
          </ListItem>
        )
      )
  );

  return (
    <div>
      <List sx={{ maxHeight: "300px", overflowY: "auto" }}>{muteList}</List>
      <DialogActions>
        <Button
          disabled={
            muteSelect === null ||
            (muteSelect !== null && muteSelect.muted === undefined)
          }
          onClick={() => setOpenUnmuteModal(true)}
        >
          Unmute
        </Button>
        <Button
          disabled={muteSelect === null}
          color="error"
          variant="contained"
          onClick={() => setOpenMuteModal(true)}
        >
          Mute
        </Button>
      </DialogActions>
      {openMuteModal && muteSelect && (
        <MuteModal
          open={openMuteModal}
          closeModal={() => setOpenMuteModal(false)}
          userToMute={muteSelect}
          channelId={SocketState.openedChatRoom?.id as string}
        ></MuteModal>
      )}
      {openUnmuteModal && muteSelect && (
        <UnmuteModal
          open={openUnmuteModal}
          closeModal={() => setOpenUnmuteModal(false)}
          userToUnmute={muteSelect}
          channelId={SocketState.openedChatRoom?.id as string}
        ></UnmuteModal>
      )}
    </div>
  );
}
