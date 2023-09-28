import axios from "axios";
import { url } from "../../Constants/ApiPort";
import { ChanWithMembers, Message } from "../../Entities/ChatTemplates";
import { NavigateFunction } from "react-router-dom";
import { ISocketContextState } from "../../Contexts/ChatSocket/Context";

export function getOlderMessages(
	limit: number, 
	offset: number, 
	addToHistory: (requestResult: Message[]) => void,
	SocketState: ISocketContextState,
	navigate: NavigateFunction,
	setErrorMessage: (nessage: string) => void, 
	setOpenSnack: () => void, 
	) {
	const controller = new AbortController();
	const signal = controller.signal;
	const requestTimeout = setTimeout(() => controller.abort(), 5000);

	if (SocketState.openedChatRoom instanceof ChanWithMembers) {
		axios.get(`${url}/channels/${SocketState.openedChatRoom.id}/history?limit=${limit}&offset=${offset}`, {
			signal: signal,
		})
		.then((newConvo) => {
			addToHistory(newConvo.data);
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
		});
	}
	 else if (SocketState.openedChatRoom) {
		axios.get(`${url}/direct/${SocketState.openedChatRoom.friend.intraname}/history?limit=${limit}&offset=${offset}`, {
			signal: signal,
		})
		.then((newConvo) => {
			addToHistory(newConvo.data);
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
		});
	}
	clearTimeout(requestTimeout);
}