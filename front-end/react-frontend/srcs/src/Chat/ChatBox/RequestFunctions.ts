import axios from "axios";
import{ ISocketContextActions } from "../../Contexts/ChatSocket/Context";
import { url } from "../../Constants/ApiPort";
import { IChatMember, RoleType } from "../../Entities/ChatTemplates";
import { IUser } from "../../Entities/ProfileTemplate";
import { NavigateFunction } from "react-router-dom";

export async function blockUser(
	userToBlock: IUser,
	SocketDispatch: React.Dispatch<ISocketContextActions>,
	navigate: NavigateFunction,
	setErrorMessage: (nessage: string) => void, 
	setOpenSnack: () => void, 
) {

	const controller = new AbortController();
	const signal = controller.signal;

	const requestTimeout = setTimeout(() => controller.abort(), 5000);
	try {
		
		const res = await axios.post(`${url}/user/block/${userToBlock.intraname}`, {}, {
			signal: signal,
		})
		setTimeout(() => SocketDispatch({type: "block_user", payload: userToBlock}), 1200);
		setErrorMessage(`You have successfully blocked ${userToBlock.name}.`);
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
	}
	clearTimeout(requestTimeout);
}


export async function muteUser(
	userToMute: IChatMember,
	channelId: string,
	muteTime: number,
	navigate: NavigateFunction,
	setErrorMessage: (nessage: string) => void, 
	setOpenSnack: () => void) {

	const controller = new AbortController();
	const signal = controller.signal;

	const requestTimeout = setTimeout(() => controller.abort(), 5000);
	try {
		const res = await axios.post(`${url}/channels/${channelId}/mute/${userToMute.user.intraname}?minutes=${muteTime}`, {} , { 
			signal: signal,
		})
		userToMute.muted = (Date.now() + (muteTime * 60 * 1000)) / 1000;
		setErrorMessage(`You have successfully muted ${userToMute.user.name}.`);
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
	}
	clearTimeout(requestTimeout);
}

export async function unmuteUser(
	userToUnmute: IChatMember,
	channelId: string,
	navigate: NavigateFunction,
	setErrorMessage: (nessage: string) => void, 
	setOpenSnack: () => void) {

	const controller = new AbortController();
	const signal = controller.signal;

	const requestTimeout = setTimeout(() => controller.abort(), 5000);
	try {
		const res = await axios.delete(`${url}/channels/${channelId}/mute/${userToUnmute.user.intraname}`, { 
			signal: signal,
		})
		userToUnmute.muted = undefined;
		setErrorMessage(`You have successfully unmuted ${userToUnmute.user.name}.`);
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
	}
	clearTimeout(requestTimeout);
}

export async function kickUser(
	userToKick: IChatMember,
	channelId: string,
	navigate: NavigateFunction,
	setErrorMessage: (nessage: string) => void, 
	setOpenSnack: () => void) {

	const controller = new AbortController();
	const signal = controller.signal;

	const requestTimeout = setTimeout(() => controller.abort(), 5000);
	try {
		const res = await axios.post(`${url}/channels/${channelId}/kick/${userToKick.user.intraname}`, {}, {
			signal: signal,
		})
		setErrorMessage(`You have successfully kicked ${userToKick.user.name}.`);
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
	}
	clearTimeout(requestTimeout);
}


export async function banUser(
	userToBan: IChatMember,
	channelId: string,
	navigate: NavigateFunction,
	setErrorMessage: (nessage: string) => void, 
	setOpenSnack: () => void) {

	const controller = new AbortController();
	const signal = controller.signal;

	const requestTimeout = setTimeout(() => controller.abort(), 5000);
	try {
		const res = await axios.post(`${url}/channels/${channelId}/ban/${userToBan.user.intraname}`, {}, {
			signal: signal,
		})
		setErrorMessage(`You have successfully banned ${userToBan.user.name}.`);
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
	}
	clearTimeout(requestTimeout);
}

export async function unbanUser(
	userToUnban: IUser,
	channelId: string,
	navigate: NavigateFunction,
	setErrorMessage: (nessage: string) => void, 
	setOpenSnack: () => void) {

	const controller = new AbortController();
	const signal = controller.signal;

	const requestTimeout = setTimeout(() => controller.abort(), 5000);
	try {
		const res = await axios.delete(`${url}/channels/${channelId}/ban/${userToUnban.intraname}`, {
			signal: signal,
		})
		setErrorMessage(`You have successfully unbanned ${userToUnban.name}.`);
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
	}
	clearTimeout(requestTimeout);
}

export async function changeUserRole(
	userToUpdate: IChatMember,
	newRole: RoleType,
	channelId: string,
	navigate: NavigateFunction,
	setErrorMessage: (nessage: string) => void, 
	setOpenSnack: () => void) {

	const controller = new AbortController();
	const signal = controller.signal;

	const requestTimeout = setTimeout(() => controller.abort(), 5000);
	try {
		await axios.patch(`${url}/channels/${channelId}/${userToUpdate.user.intraname}`, {permission: newRole} ,{
			signal: signal,
		})
		userToUpdate.role = newRole;
		setErrorMessage(`You have successfully changed ${userToUpdate.user.name} role to ${newRole}.`);
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
	}
	clearTimeout(requestTimeout);
}
