import { Box, Button, Checkbox, FormControlLabel, Grid, IconButton, InputAdornment, Menu, Snackbar, Stack, styled, TextField, Typography } from '@mui/material'
import React, { useContext, useRef, useState } from 'react'
import { IExtendedUser, UserContext } from '../Contexts/UserContext';
import axios from 'axios';
import { url } from '../Constants/ApiPort';
import { useNavigate } from 'react-router-dom';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import TwoFactorModal from './TwoFactorModal';
import InfoIcon from '@mui/icons-material/Info';

const StyledTextField = styled(TextField)({
	
	
	'& .MuiInputBase-root': { 
		borderRadius: "12px",
		'& fieldset':  {
			border: 'white solid 1px',
		},
		'&.Mui-focused fieldset': {
			border: 'white solid 2px',
			color: "white"
		}
	},
})

export default function InformationUpload() {
  const {userState, setUserState} = useContext(UserContext);
  const snackBarMessage = useRef<string>('Settings have been updated!');
  const [open, setOpen] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [newName, setNewName] = useState(userState.name);
  const navigate = useNavigate();
  const [open2fa, setOpen2fa] = useState<boolean>(false);
  const [code, setCode] = useState<string>("");
  const [nameRulesAnchor, setNameRulesAnchor] = useState<null | HTMLElement>(null);
  const nameRulesOpen = Boolean(nameRulesAnchor);

  async function turnOff2fa() {
    const controller = new AbortController();
    const signal = controller.signal;
    const requestTimeout = setTimeout(() => controller.abort(), 5000);

    axios.post(`${url}/auth/2fa/off`, { code  }, { signal: signal })
    .then((response) => {
      snackBarMessage.current = 'disabled two factor authentication';
      setUserState({...userState, is_two_factor_enabled: false });
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
				snackBarMessage.current = error.response.data.message[0];
			else
				snackBarMessage.current = error.response.data.message ? error.response.data.message : "ERROR";
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
      setCode("");
    });
  }

  function sendChanges() {
    const controller = new AbortController();
    const signal = controller.signal;
    const requestTimeout = setTimeout(() => controller.abort(), 5000);

    setDisabled(true);
    axios.patch(
        `${url}/user`,
        { name: newName },
        {
          signal: signal,
        },
      )
      .then((response) => {
		snackBarMessage.current = 'Settings have been updated!';
		setUserState({...userState, name: response.data.name});
		setTimeout(() => navigate("/"), 500);
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
				  snackBarMessage.current = error.response.data.message[0];
			  else
				  snackBarMessage.current = error.response.data.message ? error.response.data.message : "ERROR";
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
        setOpen(true);
        setDisabled(false);
      });
  }

  function handleClose(event?: React.SyntheticEvent | Event, reason?: string) {
    if (reason === 'clickaway') return;
    setOpen(false);
  }

  function infoClick(event: React.MouseEvent<HTMLElement>) {
	setNameRulesAnchor(event.currentTarget);
  }

  function infoClose() {
	setNameRulesAnchor(null);
  }

  return (
	<>
		<Typography> Information </Typography>
        <Grid
          container
          rowGap={3}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
            alignItems: 'center',
          }}
        >
          <Grid item xs={9.1}>
            <StyledTextField
			  variant='outlined'
			  id='test_id'
			  label='Username'
			  value={newName}
			  InputLabelProps={{
				style: { color: '#fff' },
			  }}
			  onChange={(event) => setNewName(event.target.value)}
			  InputProps={{
				endAdornment:
				  <InputAdornment position='end' style={{cursor: 'pointer'}}>
					<IconButton
					  color="inherit"
					  aria-label="rules"
					  onClick={infoClick}
					>
						<InfoIcon />
					</IconButton>
				  </InputAdornment>
				}}
		    />
			<Menu 
              anchorEl={nameRulesAnchor}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'center'
              }}
              transformOrigin={{
                vertical: 'bottom',
                horizontal: 'left'
              }}
              open={nameRulesOpen}
              onClose={infoClose}
              PaperProps={{
                style: {
                  width: '10ch',
			  	paddingLeft: "12px"
                },
              }}
        	>
			<Typography  variant='caption'>- 6 to 12 chars <br/>- Lowercase letters, numbers or "-" <br/>- Start with letter</Typography>
		  </Menu>
          </Grid>
          <Grid item xs={12}>
            <StyledTextField disabled variant='outlined' id='test_id' label='Intraname' defaultValue={userState.intraname}/>
          </Grid>
          <Grid item>
              <Stack direction='row' alignItems="center" width="100%">
              {userState.is_two_factor_enabled &&
                  <TextField
                  type="visible"
                  value={code}
                  placeholder="Code"
                  margin="dense"
                  variant="outlined"
                  size="small"
                  sx={{maxWidth: '150px', m: "0 1rem"}}
                  onChange={(e) => setCode(e.target.value)}
                  />
                }
              <Button onClick={
                async (e) => {
                  e.preventDefault();
                  if (!userState.is_two_factor_enabled) setOpen2fa(true);
                  else await turnOff2fa();
                }} 
                variant='contained'>{ !userState.is_two_factor_enabled ? "Setup 2FA" : "Disable 2FA"}</Button>
            </Stack>
          </Grid>
          <Grid item>
            <Box>
			  <Button
			    onClick={() => navigate("/profile")}
			    sx={{ margin: 1, backgroundColor: "#001C30", border: 2}}
				variant='contained'
				type='submit' 
			  >
          <KeyboardArrowLeftIcon sx={{height: '42px'}}/>
              </Button>
              <Button
			    onClick={sendChanges}
			    sx={{ margin: 1, backgroundColor: "#001C30", border: 2}}
				variant='contained'
				type='submit' 
				disabled={newName === userState.name || disabled}>
                <Typography>Update</Typography>
              </Button>
              <Snackbar
                message={snackBarMessage.current}
                autoHideDuration={2000}
                open={open}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
              />
            </Box>
          </Grid>
        </Grid>
        {
        open2fa && <TwoFactorModal open={open2fa} closeModal={() => setOpen2fa(false)}/>
      }
	</>
  )
}
