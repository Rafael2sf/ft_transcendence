import {createContext, lazy, Suspense, useContext} from 'react';
import { Navigate, Outlet } from "react-router-dom";
import { BrowserRouter as Router,Routes, Route} from 'react-router-dom';
import { Box, CircularProgress, createTheme, CssBaseline, ThemeProvider, ToggleButton, Typography } from '@mui/material';
import WindowDims from './Entities/WindowDims';
import useWindowDimensions from './Hooks/useWindowDimensions';
import { NavBar } from './GlobalComponents/NavBar';
import Register from './Register';
import { UserContext } from './Contexts/UserContext';
import SocketContextComponent from './Contexts/ChatSocket/SocketContextComponent';

const Home = lazy(() => import("./Home"));
const Chat = lazy(() => import("./Chat"));
const Profile = lazy(() => import("./Profile"));
const Settings = lazy(() => import("./Settings"));
const GameLobby = lazy(() => import("./GameLobby"));
const NotFound = lazy(() => import("./ErrorPages/NotFound"));
const Login = lazy(() => import('./Login'));
const Login2fa = lazy(() => import('./Login2fa'));

function App() {
	const windowSize: WindowDims = useWindowDimensions();
	const {userState} = useContext(UserContext);

	if (userState.requestFinished === false)
	{
		return (
			<Box display="flex" height="100vh" width="100vw" justifyContent="center" alignItems="center">
				<Typography>Prepare to Transcend...</Typography>
			</Box>
		)
	}
	
	if (userState.id === 0)
	{
		return (
			<Routes>
				<Route path='/login' element={< Login />}/>
				<Route path='/register' element={<Register />}/>
        <Route path='/2fa' element={<Login2fa /> }/>
				<Route path='*' element={<Navigate replace to={"/login"} />}/>
			</Routes>
		)
	}

	return (
    <>
    	<NavBar windowSize={windowSize}/>
		<Routes>
			<Route path='/login' element={<Navigate replace to={"/"} />}/>
			<Route path='/register' element={<Navigate replace to={"/"} /> }/>
			<Route path='/2fa' element={<Navigate replace to={"/"} /> }/>
			<Route element={
    			<SocketContextComponent>
					< PageWrapper />
				</SocketContextComponent>
			}>
				<Route path='/' element={<Home windowSize={windowSize}/>} />
				<Route path="chat" element={<Chat windowSize={windowSize}/>}>
					<Route path='/chat/channels/:channel_id' element={<Chat windowSize={windowSize}/>}></Route>
					<Route path='/chat/direct/:dm_id' element={<Chat windowSize={windowSize}/>}></Route>
				</Route>
				<Route path="profile" element={<Profile windowSize={windowSize}/>}>
					<Route path='/profile/:intraname' element={<Profile windowSize={windowSize}/>} ></Route>
				</Route>
				<Route path="settings" element={<Settings windowSize={windowSize}/>} />
				<Route path="lobby" element={<GameLobby windowSize={windowSize}/>}>
					<Route path="/lobby/:game_id" element={<GameLobby windowSize={windowSize}/>}></Route>
				</Route>
				<Route path='*' element={<NotFound/>}/>
			</Route>
		</Routes>
    </>
	)
}

export default function ThemeCreation() {

  const theme = createTheme({
		typography: {
			fontFamily: ['"CaveStoryRegular"'].join(),
			body1: {
				fontSize: 28
			},
			body2: {
				fontSize: 20
			},
			h5: {
				fontSize: 48
			},
			h6: {
				fontSize: 28
			},
			caption: {
				fontSize: 16
			},
			button: {
				fontSize: 22
			}
		},
		palette: {
			mode: "dark",
			background: {
				paper: "#001C30"
			},
			primary: {
				main: "#90caf9",
				light: "#e3f2fd",
				dark: "#42a5f5",
				contrastText: "#fff"
			}
		}
  });

  return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
          <App />
      </ThemeProvider>
  );
}

function PageWrapper() {
	return (
    <>
		<Suspense fallback={<CircularProgress />}>
			<Outlet />
		</Suspense>
    </>
	)
}
