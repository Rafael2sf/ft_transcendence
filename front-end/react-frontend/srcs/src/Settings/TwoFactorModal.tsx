import {
	Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { url } from "../Constants/ApiPort";
import { UserContext } from "../Contexts/UserContext";

export default function TwoFactorModal({
  open,
  closeModal,
}: {
  open: boolean;
  closeModal: () => void;
}) {
  const [code, setCode] = useState<string>("");
  const [qrcode, setQrCode] = useState<string>("");
  const [isLoadingQrCode, setIsLoadingQrCode] = useState<boolean>(true);
  const {userState, setUserState} = useContext(UserContext);
  // this will be replaced with a axios request to retrieve the qrcode

  const instructions: string[] = [
    "1. Install Google Authenticator (IOS - ANDROID).",
    "2. In the authenticator app select `+` icon.",
    "3. Select 'Scan a barcode (or QR CODE) and use the phone camera \
to scan this qr code.",
  ];

  async function handleSubmit(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();
    await turnOn2fa();
  }

  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [openSnack, setOpenSnack] = useState(false);

  function handleSnackbarClose(event?: React.SyntheticEvent | Event, reason?: string) {
	  if (reason === 'clickaway') return;
	  setOpenSnack(false);
	  setTimeout(() => setErrorMessage(""), 150);
  };
  
  async function turnOn2fa() {
    const controller = new AbortController();
    const signal = controller.signal;
    const requestTimeout = setTimeout(() => controller.abort(), 5000);

    axios.post(`${url}/auth/2fa/on`, { code  }, { signal: signal })
    .then((response) => {
      setUserState({...userState, is_two_factor_enabled: true });
      closeModal();
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
          console.log('Error: ', error.message);
      }
    })
    .finally(() => {
      clearTimeout(requestTimeout);
    });
  }

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
  
    axios.get(`${url}/auth/2fa/generate`, {
      signal: signal,
    })
    .then((response) => {
      setQrCode(response.data);
      setIsLoadingQrCode(false);
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
        console.log('Error: ', error.message);
        }
    });
    return () => {
      controller.abort();
    }
  }, []);

  return (
    <Dialog open={open} onClose={closeModal} aria-labelledby="dialog-title">
      <DialogTitle id="dialog-title">
        Two-Factor Authentication (2FA)
      </DialogTitle>
      <DialogContent
        sx={{ flexGrow: 1, bgcolor: "background.paper", display: "flex" }}
        dividers
      >
        <Stack direction="column">
          <Stack>
            <Typography variant="h6">
              How to use <Divider />
            </Typography>
            <List sx={{ display: "list-item" }}>
              {instructions.map((elem, i) => (
                <ListItem key={i} sx={{ display: "list-item" }}>
                  <Typography variant="body2">{elem}</Typography>
                </ListItem>
              ))}
            </List>
          </Stack>
          <Stack direction="column" alignItems="center">
            <Typography width="100%" variant="h6">
              Scan QR Code
              <Divider />
            </Typography>
            <Stack marginTop="1rem" direction="row">
              <Box sx={{ maxWidth: "400px" }}>
                {
                  isLoadingQrCode ?
                    <CircularProgress sx={{widht: '100%'}}/>
                  :
                    <img height="auto" width="100%" src={qrcode}></img>
                }
              </Box>
              <Stack
                margin="1rem"
                direction="column"
                alignItems="flex-end"
                justifyContent="space-around"
              >
                <Typography variant="body2">
                  Insert the authentication code being displayed in your mobile device
                </Typography>
                <TextField
                  type="visible"
                  value={code}
                  placeholder="Code"
                  margin="dense"
                  variant="outlined"
                  size="small"
                  onChange={(e) => setCode(e.target.value)}
                />
                <Button disabled={isLoadingQrCode} variant="contained" onClick={handleSubmit}>
                  <Typography  variant="button">Enable 2fa</Typography>
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </DialogContent>
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
