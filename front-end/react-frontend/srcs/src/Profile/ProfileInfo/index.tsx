import { Badge, Box, Button, Typography, styled, LinearProgress, Tooltip, Snackbar, Alert } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../Contexts/UserContext';
import { IUser } from '../../Entities/ProfileTemplate';
import WindowDims from '../../Entities/WindowDims';
import BlockOrFriendButtons from './BlockOrFriendButtons';
import axios from 'axios';
import { IGameResults } from '../../Entities/GameTemplates';
import { url } from '../../Constants/ApiPort';

const StyledBadge = styled(Badge)({
  '& .MuiBadge-badge': {
    width: 30,
    height: 30,
    borderRadius: '50%',
	fontSize: "32px"
  },
});

export default function ProfileInfo({ user }: { user: IUser }) {

  const navigate = useNavigate();
  const {userState} = useContext(UserContext);
  const [gameAccessPin, setGameAccessPin] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [openSnack, setOpenSnack] = useState(false);

  function handleSnackbarClose(event?: React.SyntheticEvent | Event, reason?: string) {
	  if (reason === 'clickaway') return;
	  setOpenSnack(false);
	  setTimeout(() => setErrorMessage(""), 150);
  };

  useEffect(() => {
	if (user.status === "IN_GAME")
	{
		const controller = new AbortController();
		const signal = controller.signal;

		axios.get(`${url}/user/${user.id}/games_sessions`, {
			signal: signal,
		})
		.then(response => {
			const sessionsList: IGameResults[] = response.data;


			if (sessionsList.length)
				setGameAccessPin(sessionsList[0].id);
		})
		.catch ((error) => {
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
				console.log('Error: ', error.message);
				}
		});
		
		return () => {
			setTimeout(() => controller.abort(), 5000);
		}
	}
  }, [user.status]);

  return (
    <>
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
    { userState.id !== user.id ?
		<Tooltip
    title={user.status === "IN_GAME" ? <Typography variant='caption'>Watch User's Game</Typography> : null}
    placement="top-end"
    arrow
    enterDelay={100}
    leaveDelay={200}
    sx={{fontSize: 24}}
		>
		<StyledBadge
            badgeContent={user.status === "IN_GAME" ? "!" : ""}
            color={(user.status === "ONLINE") 
			  ? "success" 
			  : (user.status === "IN_GAME") 
			  ? "warning" 
			  : "error"
      }
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            overlap='circular'
            onClick={user.status === "IN_GAME" ? () => navigate(`/lobby/${gameAccessPin}`) : undefined}
            sx={{ cursor: user.status === "IN_GAME" ? "pointer" : "auto" }}
            >
			<img
				src={user.picture}
        alt='profile_image'
        style={{ borderRadius: '50%', border: '2px solid white' }}
        width='128px'
        height='128px'
			/>
		</StyledBadge>
		</Tooltip>
    :
    <img
    src={user.picture}
    alt='profile_image'
    style={{ borderRadius: '50%', border: '2px solid white' }}
    width='128px'
    height='128px'
  />
    }
        <Typography variant='h5'>{user.name}</Typography>
        <Typography variant='body1'>{user.intraname}</Typography>
		<Box width="100%" margin={2} marginTop={0} display="flex" flexDirection="column" justifyContent="center" alignItems="center">
			<Typography position="absolute" zIndex={2} sx={{fontSize: 23}}>{Math.sqrt(user.ladder * 0.2).toFixed(2)}</Typography>
			<LinearProgress variant="determinate" value={(Math.sqrt(user.ladder * 0.2) - Math.floor(Math.sqrt(user.ladder * 0.2))) * 100} sx={{ height: 30, width: "100%", borderRadius: 5 }}/>
		</Box>
		{ userState.id === user.id ?
			<Box sx={{ display: 'flex', mb: 3 }}>
				<Button variant="contained" sx={{ border: 2, backgroundColor: "#001C30" }} onClick={() => navigate('/settings')}>Profile Settings</Button>
			</Box>
			:
			<BlockOrFriendButtons profileOwner={user}/>
		}
      </Box>
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
    </>
  );
}