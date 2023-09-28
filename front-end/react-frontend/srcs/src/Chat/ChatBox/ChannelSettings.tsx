import {
	Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Select,
  SelectChangeEvent,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useContext, useState } from "react";
import SocketContext from "../../Contexts/ChatSocket/Context";
import { ChanWithMembers } from "../../Entities/ChatTemplates";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import axios from "axios";
import { url } from "../../Constants/ApiPort";
import { useNavigate } from "react-router-dom";
import InfoIcon from '@mui/icons-material/Info';

interface SettingsForm {
  newName: string;
  newSetting: string;
  password?: string;
}

export function ChannelSettings({
  open,
  closeModal,
}: {
  open: boolean;
  closeModal: () => void;
}) {
  const { SocketState } = useContext(SocketContext);
  const [visible, setVisible] = useState<string>("password");
  const [formValues, setFormValues] = useState<SettingsForm>({
    newName: (SocketState.openedChatRoom as ChanWithMembers).name,
    newSetting: (SocketState.openedChatRoom as ChanWithMembers).type,
    password: (SocketState.openedChatRoom as ChanWithMembers).type === "PROTECTED" ? "" : undefined,
  });
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [openSnack, setOpenSnack] = useState(false);
  const [nameRulesAnchor, setNameRulesAnchor] = useState<null | HTMLElement>(null);
  const nameRulesOpen = Boolean(nameRulesAnchor);
  const [passwordRulesAnchor, setPasswordRulesAnchor] = useState<null | HTMLElement>(null);
  const passwordRulesOpen = Boolean(passwordRulesAnchor);

  function handleSnackbarClose(event?: React.SyntheticEvent | Event, reason?: string) {
	  if (reason === 'clickaway') return;
	  setOpenSnack(false);
	  setTimeout(() => setErrorMessage(""), 150);
  };

  function handleSettingChange(event: SelectChangeEvent) {
    if (["PRIVATE", "PROTECTED", "PUBLIC"].includes(event.target.value)) {
      setFormValues((oldVal) => ({
        newName: oldVal.newName,
        newSetting: event.target.value,
        password: oldVal.password,
      }));
    }
  }

  function handlePasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFormValues((oldVal) => ({
      newName: oldVal.newName,
      newSetting: oldVal.newSetting,
      password: event.target.value,
    }));
  }

  function handleNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFormValues((oldVal) => ({
      newName: event.target.value,
      newSetting: oldVal.newSetting,
      password: oldVal.password,
    }));
  }

  function handleClickEye() {
    setVisible((oldState: string) => {
      if (oldState === "") return "password";
      else return "";
    });
  }

  async function sendChanges() {
    const controller = new AbortController();
    const signal = controller.signal;

    const requestTimeout = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await axios.patch(
        `${url}/channels/${SocketState.openedChatRoom?.id}`,
        {
          name: formValues.newName,
          type: formValues.newSetting,
          password: formValues.password,
        },
        {
          signal: signal,
        }
      );
	  if (res.status === 204)
	  {
	  	setErrorMessage(`ERROR: No changes were made`);
	  	setOpenSnack(true);
	  }
	  else
	  {
	  	setErrorMessage(`You have successfully updated the channel`);
	  	setOpenSnack(true);
	  }
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
    }
    clearTimeout(requestTimeout);
  }

  function nameInfoClick(event: React.MouseEvent<HTMLElement>) {
	setNameRulesAnchor(event.currentTarget);
  }

function nameInfoClose() {
	setNameRulesAnchor(null);
}

function passInfoClick(event: React.MouseEvent<HTMLElement>) {
	setPasswordRulesAnchor(event.currentTarget);
  }

function passInfoClose() {
	setPasswordRulesAnchor(null);
}

  return (
    <Dialog open={open} onClose={closeModal} aria-labelledby="dialog-title">
      <DialogTitle id="dialog-title">Channel Settings</DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", paddingBottom: 0 }}
      >
        <Typography paddingRight={1}>
          Select new settings for the channel:
        </Typography>
        <FormControl
          sx={{ m: 1, width: "20rem", alignSelf: "center" }}
          size="small"
        >
          <Stack marginY={1}>
            <TextField
              id="newName"
              variant="outlined"
              value={formValues.newName}
              error={!formValues.newName}
              helperText={!formValues.newName ? "Required" : ""}
              size="small"
              onChange={handleNameChange}
			  InputProps={{
				endAdornment:
				  <InputAdornment position='end' style={{cursor: 'pointer'}}>
					<IconButton
					  color="inherit"
					  aria-label="rules"
					  onClick={nameInfoClick}
					>
						<InfoIcon />
					</IconButton>
				  </InputAdornment>
				}}
            />
			<Menu 
				anchorEl={nameRulesAnchor}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'center'
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'left'
				}}
				open={nameRulesOpen}
				onClose={nameInfoClose}
				PaperProps={{
				style: {
				width: '10ch',
				paddingLeft: "12px"
				},
				}}
			>
				<Typography  variant='caption'>- 6 to 12 chars <br/>- Lowercase letters, numbers or "-" <br/>- Start with letter</Typography>
			</Menu>
		  </Stack>
          <Select
            id="new-setting-selector"
            value={formValues.newSetting}
            label=""
            onChange={handleSettingChange}
            placeholder={"Choose one:"}
          >
            <MenuItem value={"PUBLIC"}>Public</MenuItem>
            <MenuItem value={"PROTECTED"}>Protected</MenuItem>
            <MenuItem value={"PRIVATE"}>Private</MenuItem>
          </Select>
          {formValues.newSetting === "PROTECTED" && (
            <Stack marginTop={1}>
              <TextField
                id="password"
                type={visible}
                variant="outlined"
                value={formValues.password}
                error={!formValues.password}
                helperText={!formValues.password ? "Required" : ""}
                size="small"
                onChange={handlePasswordChange}
                placeholder={"Password"}
                InputProps={{
                  endAdornment:
					<Box display="flex">
						<IconButton onClick={handleClickEye}>
							{visible ? <VisibilityIcon/> : <VisibilityOffIcon/>}
						</IconButton>
						<IconButton
						  color="inherit"
						  aria-label="rules"
						  onClick={passInfoClick}
						>
							<InfoIcon />
						</IconButton>
					</Box>
                }}
              />
			  	<Menu 
					anchorEl={passwordRulesAnchor}
					anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'center'
					}}
					transformOrigin={{
					vertical: 'top',
					horizontal: 'left'
					}}
					open={passwordRulesOpen}
					onClose={passInfoClose}
					PaperProps={{
					style: {
					width: '10ch',
					paddingLeft: "12px"
					},
					}}
				>
					<Typography  variant='caption'>- 8 to 32 chars <br/>- Letters and numbers <br/>- At least one number</Typography>
				</Menu>
            </Stack>
          )}
        </FormControl>
        <Typography paddingRight={1}>Change the channel's settings?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeModal}>No</Button>
        <Button
          onClick={async () => {
            await sendChanges();
          }}
          variant="contained"
          disabled={
            formValues.newSetting === "" ||
            (formValues.newSetting === "PROTECTED" && !formValues.password) ||
            formValues.newName === ""
          }
        >
          Yes
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
		<Alert onClose={handleSnackbarClose} severity={errorMessage.indexOf("You have successfully") === 0 ? "success" : "error"} sx={{ width: '100%' }}>
			{errorMessage}
        </Alert>
	  </Snackbar>
    </Dialog>
  );
}
