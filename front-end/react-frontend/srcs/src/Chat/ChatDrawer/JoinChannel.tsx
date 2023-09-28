import {
	Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Channel } from "../../Entities/ChatTemplates";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useState } from "react";
import { url } from "../../Constants/ApiPort";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface CustomError {
  statusCode: number;
  message: string;
  error: string;
}

export function JoinChannel({
  open,
  closeModal,
  channelToJoin,
}: {
  open: boolean;
  closeModal: () => void;
  channelToJoin: Channel;
}) {
  const [visible, setVisible] = useState<string>("password");
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [openSnack, setOpenSnack] = useState(false);
  const [disabled, setDisabled] = useState(false);

  function handleSnackbarClose(event?: React.SyntheticEvent | Event, reason?: string) {
	  if (reason === 'clickaway') return;
	  setOpenSnack(false);
	  setTimeout(() => setErrorMessage(""), 150);
	  setDisabled(false);
  };

  async function joinChannel() {
    const controller = new AbortController();
    const signal = controller.signal;

	setDisabled(true);

	const requestTimeout = setTimeout(() => controller.abort(), 5000);
    try {
      let res: Response;

      if (channelToJoin == null) throw Error("No channel was selected");
      else {
        res = await axios.post(
          `${url}/channels/${channelToJoin.id}/join`,
          channelToJoin.type === "PROTECTED" ? { password: password } : {},
          {
            signal: signal,
          }
        );
      }
	  setErrorMessage(`Success! You joined ${channelToJoin.name}!`);
	  setOpenSnack(true);
	  setTimeout(() =>  closeModal(), 1200);
    } catch (error: any) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
		if (error.response.status === 401)
		{
			navigate("/login");
			return;
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
	  setDisabled(false);
    }
    clearTimeout(requestTimeout);
  }

  function handleClickEye() {
    setVisible((oldState: string) => {
      if (oldState === "") return "password";
      else return "";
    });
  }

  return (
    <Dialog
      open={open}
      onClose={closeModal}
      aria-labelledby="dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="dialog-title">Join Channel</DialogTitle>
      <DialogContent>
        {channelToJoin?.type === "PROTECTED" ? (
          <Stack>
            <DialogContentText id="alert-dialog-description">
              Would you like to join the channel {channelToJoin?.name}?
            </DialogContentText>
            <Stack
              direction="row"
              marginY={1}
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography paddingRight={1}>Password:</Typography>
              <TextField
                id="password"
                type={visible}
                variant="outlined"
                value={password}
                error={!password}
                helperText={!password ? "Required" : ""}
                size="small"
                onChange={(
                  event: React.ChangeEvent<
                    HTMLTextAreaElement | HTMLInputElement
                  >
                ) => setPassword(event.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment
                      position="end"
                      onClick={handleClickEye}
                      style={{ cursor: "pointer" }}
                    >
                      {visible ? <VisibilityIcon /> : <VisibilityOffIcon />}
                    </InputAdornment>
                  ),
                }}
              ></TextField>
            </Stack>
          </Stack>
        ) : (
          <DialogContentText id="alert-dialog-description">
            Would you like to join the channel {channelToJoin.name}?
          </DialogContentText>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={closeModal} disabled={disabled}>Cancel</Button>
        <Button onClick={joinChannel} variant="contained" disabled={disabled}>
          Submit
        </Button>
      </DialogActions>
	  <Snackbar
			autoHideDuration={2000}
			open={openSnack}
			onClose={handleSnackbarClose}
			anchorOrigin={{
				vertical: 'bottom',
				horizontal: 'right',
			}}
		>
			<Alert onClose={handleSnackbarClose} severity={errorMessage.indexOf("Success!") === 0 ? "success" : "error"} sx={{ width: '100%' }}>
				{errorMessage}
			</Alert>
		</Snackbar>
    </Dialog>
  );
}
