import {
  Avatar,
  Badge,
  Box,
  Grid,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import BlockIcon from "@mui/icons-material/Block";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import { IUser } from "../../Entities/ProfileTemplate";
import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { BlockModal } from "../../Chat/ChatBox/BlockModal";
import { UnfriendModal } from "../../Chat/ChatDrawer/UnfriendModal";
import { UserContext } from "../../Contexts/UserContext";

export default function FriendCard({
  friend,
  profileOwner,
}: {
  friend: IUser;
  profileOwner: IUser;
}) {
  const navigate = useNavigate();

  const [openBlockModal, setOpenBlockModal] = useState(false);
  const [openUnfriend, setOpenUnfriend] = useState(false);
  const { userState } = useContext(UserContext);

  return (
    <Grid
      item
      xs={12}
      sx={{
        boxShadow: 1,
        borderRadius: 5,
      }}
    >
      <ListItem
        disablePadding
        sx={{ backgroundColor: "#C4AE7B", borderRadius: 5, border: 2 }}
        secondaryAction={
          profileOwner.id === userState.id && (
            <Box>
              <IconButton
                onClick={() => {
                  navigate(`/chat/direct/${friend.intraname}`);
                }}
              >
                <ChatIcon />
              </IconButton>

              <IconButton
                onClick={() => {
                  setOpenBlockModal(true);
                }}
              >
                <BlockIcon />
              </IconButton>
              {openBlockModal && (
                <BlockModal
                  open={openBlockModal}
                  closeModal={() => setOpenBlockModal(false)}
                  userToBlock={friend}
                ></BlockModal>
              )}

              <IconButton
                onClick={() => {
                  setOpenUnfriend(true);
                }}
              >
                <PersonRemoveIcon />
              </IconButton>
              {openUnfriend && (
                <UnfriendModal
                  open={openUnfriend}
                  setOpen={setOpenUnfriend}
                  userToUnfriend={friend}
                  deselectFriend={() => {}}
                />
              )}
            </Box>
          )
        }
      >
        <ListItemButton
          sx={{ borderRadius: 5 }}
          onClick={() => navigate(`/profile/${friend.intraname}`)}
        >
          <Badge
            badgeContent=""
            color={
              friend.status === "ONLINE"
                ? "success"
                : friend.status === "IN_GAME"
                ? "warning"
                : "error"
            }
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            overlap="circular"
            sx={{ margin: 2 }}
            variant="dot"
          >
            <Avatar src={friend.picture} sx={{ border: 2 }} />
          </Badge>
          <ListItemText primary={friend.name} />
        </ListItemButton>
      </ListItem>
    </Grid>
  );
}
