import axios from "axios";
import { PropsWithChildren, createContext, useEffect, useReducer, useState } from "react";
import { url } from "../Constants/ApiPort";
import { useNavigate } from "react-router-dom";
import { IUser } from "../Entities/ProfileTemplate";
import { Alert, Box, Snackbar, Typography } from "@mui/material";


export interface IUserContextAction {
	type: "update_user";
	payload: IUser;
}

export interface IExtendedUser extends IUser {
	requestFinished: boolean;
	is_two_factor_enabled: boolean;
}

export const defaultUserContext: IExtendedUser = {
	id: 0,
	intraname: "",
	name: "",
	picture: "",
	ladder: 0,
	status: "OFFLINE",
	requestFinished: false,
	is_two_factor_enabled: false,
};


export interface IUserContextProps {
	userState: IExtendedUser;
	setUserState: React.Dispatch<React.SetStateAction<IExtendedUser>>;
}

export const UserContext = createContext<IUserContextProps>({
	userState: defaultUserContext,
	setUserState: () => {},
});

export function UserContextComponent(props: PropsWithChildren) {
	const { children } = props;
	const UserContextProvider = UserContext.Provider;
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [userState, setUserState] = useState<IExtendedUser>(defaultUserContext);
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

		axios.get(`${url}/user`, {
			signal: signal,
		})
		.then((response) => {
			setUserState({...response.data, requestFinished: true});		
		})
		.catch((error) => {
			if (error.response) {
				// The request was made and the server responded with a status code
				// that falls out of the range of 2xx
				if (error.response.status === 401)
				{
					if (!error.response.data.path)
						navigate("/login");
					else
					  	navigate(error.response.data.path);
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
			setUserState({...defaultUserContext, requestFinished: true})
		})
		.finally(() => {
			setLoading(false);
		})
		return () => {
			controller.abort();
		}
	}, []);

	if (loading) 
	return (
		<Box display="flex" height="100vh" width="100vw" justifyContent="center" alignItems="center">
			<Typography>Prepare to Transcend...</Typography>
		</Box>
	)

	return (
	  <UserContextProvider value={{ userState, setUserState }}>
		{children}
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
	  </UserContextProvider>
	);
}
