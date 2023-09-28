import { Alert, Box, Button, Snackbar, TextField, Typography } from "@mui/material";
import KeyboardArrowRightSharpIcon from "@mui/icons-material/KeyboardArrowRightSharp";
import { NavigateFunction, useNavigate } from "react-router-dom";
import axios from "axios";
import { url } from "../Constants/ApiPort";
import { useRef, useState } from "react";
import { MuiOtpInput } from "mui-one-time-password-input";
import useWindowDimensions from "../Hooks/useWindowDimensions";
import { Logout } from "../GlobalComponents/Logout";
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';

async function verifyCode(
  code: string,
  navigate: NavigateFunction,
  setOtp: React.Dispatch<React.SetStateAction<string>>,
  setDisplayError: React.Dispatch<React.SetStateAction<boolean>>,
  setErrorMessage: (nessage: string) => void, 
  setOpenSnack: () => void
) {
  const controller = new AbortController();
  const signal = controller.signal;

  const requestTimeout = setTimeout(() => controller.abort(), 5000);
  try {
    await axios.post(
      `${url}/auth/2fa/validate`,
      {
        code,
      },
      {
        signal: signal,
      }
    );
    navigate(0);
  } catch (error: any) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx

	  if (error.response.status === 403)
      	setDisplayError(true);
	  else if (error.response.status === 401)
	  {
	  	navigate("/login");
	  }
	  else
	  {
	  	if (error.response.data.message && typeof(error.response.data.message) !== "string")
	  		setErrorMessage(error.response.data.message[0]);
	  	else
	  		setErrorMessage(error.response.data.message ? error.response.data.message : "ERROR");
	  	setOpenSnack();
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
  setOtp("");
  clearTimeout(requestTimeout);
}

export default function Login2fa() {
  const [otp, setOtp] = useState<string>("");
  const [isDisabled, setDisabled] = useState<boolean>(false);
  const [displayError, setDisplayError] = useState<boolean>(false);
  const navigate = useNavigate();
  const dimensions = useWindowDimensions();
  const [errorMessage, setErrorMessage] = useState("");
  const [openSnack, setOpenSnack] = useState(false);

  function handleSnackbarClose(event?: React.SyntheticEvent | Event, reason?: string) {
	  if (reason === 'clickaway') return;
	  setOpenSnack(false);
	  setTimeout(() => setErrorMessage(""), 150);
  };

  function matchIsNumeric(text: string) {
    const isNumber = typeof text === "number";
    return isNumber || !isNaN(Number(text));
  }

  const validateChar = (value: string, index: number) => {
    return matchIsNumeric(value);
  };

  const handleComplete = async (value: string) => {
    setDisabled(true);
    await verifyCode(
		value,
		navigate,
		setOtp,
		setDisplayError,
		(message) => setErrorMessage(message), 
		() => setOpenSnack(true)
	);
    setDisabled(false);
  };

  const handleChange = (newValue: string) => {
    if (displayError === true) setDisplayError(false);
    setOtp(newValue);
  };


  return (
    <Box
      width="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
      overflow="auto"
      sx={{
        backgroundImage: `url(${`/lobbyBg.jpg`})`,
        height: "100vh",
        paddingY: "4rem",
      }}
    >
      <Box
        sx={{
          margin: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          border: 2,
          borderRadius: 5,
          backgroundColor: "rgba(173, 182, 196, 0.4)",
          maxWidth: '900px',
          width: "50vw",
          minWidth: "400px",
          padding: 3,
        }}
      >
        <Typography textAlign="center" variant="h2">Two-Factor <br/> Authentication</Typography>
        <Typography textAlign="center" variant="body1">
          Open the two-step verification app on your mobile device <br />
          to get your verification code
        </Typography>
        {displayError && (
          <Typography variant="body2" color="red">
            Invalid code. Please try again.
          </Typography>
        )}
        <MuiOtpInput
          sx={{
            mt: '2.5rem',
            maxWidth: dimensions.width > 1080 ? "67%" : "auto",
          }}
          length={6}
          value={otp}
          autoFocus={true}
          validateChar={validateChar}
          onChange={handleChange}
          onComplete={handleComplete}
          TextFieldsProps={{
            disabled: isDisabled,
            size: "small",
            margin: "none",
          }}
        />
        <div style={{width: '100%', marginTop: '1rem'}}>
          <Button variant="contained" startIcon={<ArrowLeftIcon />} onClick={async() => Logout(navigate, (message) => setErrorMessage(message), () => setOpenSnack(true))}>
            Go Back
          </Button>
		  
        </div>
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
      </Box>
    </Box>
  );
}
