import { useEffect, useState, lazy, Suspense, useContext } from 'react';
import { Alert, Box, CircularProgress, Container, Snackbar, Tab, Tabs } from '@mui/material';
import WindowDims from '../Entities/WindowDims';
import { url } from '../Constants/ApiPort';
import axios from 'axios';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import HistoryIcon from '@mui/icons-material/History';
import PeopleIcon from '@mui/icons-material/People';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import ProfileInfo from './ProfileInfo';
import { IUser } from '../Entities/ProfileTemplate';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserContext } from '../Contexts/UserContext';
import NotFound from '../ErrorPages/NotFound';
import FriendRequests from './FriendRequests';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  if (value === index)
  {
	return (
		<Box display="flex" height="100%" width="100%" flexDirection="column" >{children}</Box>
	);
  }
  return (<></>);

}

function a11yProps(index: number) {
  return {
    id: `member-manager-tab-${index}`,
    'aria-controls': `member-manager-tabpanel-${index}`,
  };
}

const Achievements = lazy(() => import('./Achievements'));
const Friends = lazy(() => import('./Friends'));
const GameHistory = lazy(() => import('./GameHistory/index'));

export default function Profile({ windowSize }: { windowSize: WindowDims }) {
  const [value, setValue] = useState(0);
  const [user, setUser] = useState<IUser | "NotFound">(() => {
    return {
	  id: 0,
      name: '',
      intraname: '',
	  picture: '',
	  ladder: 0,
	  status: "OFFLINE"
    };
  });
  const [isLoading, setLoading] = useState(true);
  const location = useLocation();
  const {userState} = useContext(UserContext);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [openSnack, setOpenSnack] = useState(false);

  function handleSnackbarClose(event?: React.SyntheticEvent | Event, reason?: string) {
	  if (reason === 'clickaway') return;
	  setOpenSnack(false);
	  setTimeout(() => setErrorMessage(""), 150);
  };


  useEffect(() => {

	let userIntraname = location.pathname.slice("/profile/".length);
	const controller = new AbortController();
	const signal = controller.signal;

	if (userIntraname.length !== 0) {

		axios.get(`${url}/user/search?intraname=${userIntraname}`, {
			signal: signal,
		})
		.then((response) => {
			setUser(response.data);
      		setLoading(false);
		})
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
				console.log('Error: ', error.message);
			  }
			setUser("NotFound");
       		setLoading(false);
		});
	}
	else
	{
		setUser(userState);
   		setLoading(false);
	}
	setValue(0);
	return () => {
		controller.abort();
	}
}, [location, userState]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
        <CircularProgress sx={{ alignSelf: 'center' }} />
      </div>
    );
  }

  if (user === "NotFound")
  	return (
		<NotFound></NotFound>
	)

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
	<Box width="100%" sx={{ backgroundImage: `url(${`/lobbyBg.jpg`})`}}>
		<Container fixed sx={{
		pt: '4rem',
		}}>
			<div
				style={{
				display: 'flex',
				flexDirection: windowSize.width >= 900 ? 'row' : 'column',
				minHeight: 'calc(100vh - 4rem)',
				width: '100%',
				}}
			>
				<Box
				sx={{
					width: windowSize.width >= 900 ? '30%' : '100%',
					borderBottom: windowSize.width >= 900 ? 0 : 2,
					borderRight: windowSize.width >= 900 ? 2 : 0,
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center',
					paddingTop: '1rem',
					minHeight: windowSize.width >= 900 ? '670px' : '440px' ,
				}}
				>
					<ProfileInfo user={user} />
					<Tabs
						orientation={windowSize.width >= 900 ? 'vertical' : 'horizontal'}
						variant='fullWidth'
						value={value}
						onChange={handleChange}
						aria-label='Vertical tabs example'
						sx={{ width: '100%' }}
					>
						<Tab
						label={<MilitaryTechIcon sx={{ animation: value === 0 ? 'pulse 2s infinite' : 'none' }} />}
						{...a11yProps(0)}
						/>
						<Tab
						label={<HistoryIcon sx={{ animation: value === 1 ? 'pulse 2s infinite' : 'none' }} />}
						{...a11yProps(1)}
						/>
						<Tab
						label={<PeopleIcon sx={{ animation: value === 2 ? 'pulse 2s infinite' : 'none' }} />}
						{...a11yProps(2)}
						/>
						{user.id === userState.id &&
							<Tab
							label={<ContactMailIcon sx={{ animation: value === 3 ? 'pulse 2s infinite' : 'none' }} />}
							{...a11yProps(3)}
							/>

						}
					</Tabs>
				</Box>
				<Box
				sx={{
					width: windowSize.width >= 900 ? '75%' : '100%',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					minHeight: windowSize.width >= 900 ? 'calc(100vh - 20rem)' : "100%",
					ml:  windowSize.width >= 900 ? 1 : 0,
					marginTop: 1
				}}
				>
					<Suspense fallback={<CircularProgress sx={{ alignSelf: 'center', margin: '1rem' }} />}>
						<TabPanel value={value} index={0}>
						<Achievements profileOwner={user} windowSize={windowSize} />
						</TabPanel>
						<TabPanel value={value} index={1}>
							<GameHistory profileOwner={user}  windowSize={windowSize}/>
						</TabPanel>
						<TabPanel value={value} index={2}>
							<Friends profileOwner={user} windowSize={windowSize} />
						</TabPanel>
						{ user.id === userState.id &&
							<TabPanel value={value} index={3}>
								<FriendRequests windowSize={windowSize} />
							</TabPanel>
						}
					</Suspense>
				</Box>
			</div>
		</Container>
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
  );
}
