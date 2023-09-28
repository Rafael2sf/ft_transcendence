import {
	Alert,
  Avatar,
  Button,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Snackbar,
} from "@mui/material";
import { useState, useContext, useEffect } from "react";
import SocketContext from "../../../../Contexts/ChatSocket/Context";
import axios from "axios";
import { url } from "../../../../Constants/ApiPort";
import { UnbanModal } from "./UnbanModal";
import { IChatMember } from "../../../../Entities/ChatTemplates";
import { IUser } from "../../../../Entities/ProfileTemplate";
import { useNavigate } from "react-router-dom";

export function UnbanSubTab() {
  const [unbanSelect, setUnbanSelect] = useState<null | IUser>(null);
  const [openUnbanModal, setOpenUnbanModal] = useState<boolean>(false);
  const [unbanList, setUnbanList] = useState<IChatMember[]>([]);
  const { SocketState } = useContext(SocketContext);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [openSnack, setOpenSnack] = useState(false);

  function handleSnackbarClose(event?: React.SyntheticEvent | Event, reason?: string) {
	  if (reason === 'clickaway') return;
	  setOpenSnack(false);
	  setTimeout(() => setErrorMessage(""), 150);
  };
  
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    axios.get(`${url}/channels/${SocketState.openedChatRoom?.id}?role=BANNED`, {
        signal: signal,
      })
      .then((response) => setUnbanList(response.data.users))
      .catch((error) => {
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
      });
    return () => {
      controller.abort();
    };
  }, []);

  const unbanJSXList = unbanList.map((toUnban) => (
    <ListItem key={toUnban.user.id} disablePadding>
      <ListItemButton
        selected={unbanSelect?.id === toUnban.user.id}
        onClick={() => setUnbanSelect(toUnban.user)}
      >
        <ListItemAvatar>
          <Avatar alt={`Avatar image`} src={toUnban.user.picture} />
        </ListItemAvatar>
        <ListItemText primary={toUnban.user.name} />
      </ListItemButton>
    </ListItem>
  ));

  return (
    <div>
      <List sx={{ maxHeight: "300px", overflowY: "auto" }}>{unbanJSXList}</List>
      <DialogActions>
        <Button
          disabled={unbanSelect === null}
          color="error"
          variant="contained"
          onClick={() => setOpenUnbanModal(true)}
        >
          Unban
        </Button>
      </DialogActions>
      {openUnbanModal && unbanSelect && (
        <UnbanModal
          open={openUnbanModal}
          closeModal={() => setOpenUnbanModal(false)}
          userToUnban={unbanSelect}
          channelId={SocketState.openedChatRoom?.id as string}
          unbanSuccess={() =>
            setUnbanList((prev) => {
              const index = prev.findIndex(
                (element) => element.user.intraname === unbanSelect.intraname
              );
              if (index !== -1) prev.splice(index, 1);
              return prev;
            })
          }
        ></UnbanModal>
      )}
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
    </div>
  );
}
