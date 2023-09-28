import axios from "axios";
import { url } from "../../Constants/ApiPort";
import { NavigateFunction } from "react-router-dom";
import { GameScope, IPaddleOpts } from "../../Entities/GameTemplates";

export async function CreateNewGame(
	userId: number,
  scope: GameScope,
	navigate: NavigateFunction,
	{paddleTexType, paddleTex} : IPaddleOpts,
	maxScore: number,
	sendInvite: ((gameCreated: number) => void) | null,
	setErrorMessage: (nessage: string) => void, 
	setOpenSnack: () => void
) {

	const controller = new AbortController();
	const signal = controller.signal;

	const requestTimeout = setTimeout(() => controller.abort(), 5000);
	try {
		
		const res = await axios.post(`${url}/games_sessions`, {
			user_id: userId,
			scope,
			tex: paddleTex,
			tex_type: paddleTexType,
			max_score: maxScore, // max 11
		}, {
			signal: signal,
		})
		if (sendInvite !== null)
			sendInvite(res.data.id);
		setTimeout(() => navigate(`/lobby/${res.data.id}`), 2000);
		setErrorMessage(`Success! Game Created, redirecting...`);
		setOpenSnack();
	}
	catch (error: any) {
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
				setOpenSnack();
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
		navigate(`/lobby`);
	}
	clearTimeout(requestTimeout);
}

export async function JoinQueue(
	userId: number,
	navigate: NavigateFunction,
	{paddleTexType, paddleTex} : IPaddleOpts,
	setErrorMessage: (nessage: string) => void, 
	setOpenSnack: () => void) {

	const controller = new AbortController();
	const signal = controller.signal;

	const requestTimeout = setTimeout(() => controller.abort(), 5000);
	try {
		
		const res = await axios.patch(`${url}/games_sessions/random`, {
			user_id: userId,
			scope: "PUBLIC",
			tex: paddleTex,
			tex_type: paddleTexType,
		}, {
			signal: signal,
		})
		setTimeout(() => navigate(`/lobby/${res.data.id}`), 2000);
		setErrorMessage(`Success! Joined an existing game, redirecting...`);
		setOpenSnack();
	}
	catch (error: any) {
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
				setOpenSnack();
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
		navigate(`/lobby`);
	}
	clearTimeout(requestTimeout);
}