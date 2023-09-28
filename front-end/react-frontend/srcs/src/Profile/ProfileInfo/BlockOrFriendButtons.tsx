import { Alert, Box, Button, Snackbar } from '@mui/material';
import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { BlockModal } from '../../Chat/ChatBox/BlockModal';
import { UnblockUser } from '../../Chat/ChatDrawer/UnblockUser';
import { UnfriendModal } from '../../Chat/ChatDrawer/UnfriendModal';
import { url } from '../../Constants/ApiPort';
import SocketContext from '../../Contexts/ChatSocket/Context';
import { IRequestsObject, IUser } from '../../Entities/ProfileTemplate';

export default function BlockOrFriendButtons({profileOwner}: {profileOwner: IUser}) {

	const [friendReqDisabled, setFriendReqDisabled] = useState(false);
	const [blockStatus, setBlockStatus] = useState(false);
	const [friendStatus, setFriendStatus] = useState(false);
	const [openBlockModal, setOpenBlockModal] = useState(false);
	const [openUnblockModal, setOpenUnblockModal] = useState(false);
	const [openUnfriendModal, setOpenUnfriendModal] = useState(false);
	const { SocketState } = useContext(SocketContext);
    const navigate = useNavigate();
	const [errorMessage, setErrorMessage] = useState("");
	const [openSnack, setOpenSnack] = useState(false);

	function handleSnackbarClose(event?: React.SyntheticEvent | Event, reason?: string) {
		if (reason === 'clickaway') return;
		setOpenSnack(false);
		setTimeout(() => setErrorMessage(""), 150);
	};


	useEffect(() => {
		if (SocketState.blockedUsers.find((blocked) => blocked.id === profileOwner.id) !== undefined)
		{
			setBlockStatus(true);
			setFriendReqDisabled(true);
		}
		else
		{
			setBlockStatus(false);
			setFriendReqDisabled(false);
		}
	}, [SocketState.blockedUsers])

	useEffect(() => {
	  if (SocketState.DMs.find((DM) => DM.friend.id === profileOwner.id) !== undefined)
	  		setFriendStatus(true);
	  else
			setFriendStatus(false);
	}, [SocketState.DMs])

	useEffect(() => {
		const controller = new AbortController();
		const signal = controller.signal;

		axios.get(`${url}/user/invites/me`, {
			signal: signal,
			headers: {
				"Authorization": "Bearer 1",
			}
		})
		.then((response) => {
			const resList: IRequestsObject = response.data;

			if (resList.received.find((request) => request.id === profileOwner.id) !== undefined || resList.sent.find((request) => request.id === profileOwner.id) !== undefined)
				setFriendReqDisabled(true);
      else
				setFriendReqDisabled(false);
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
		});
	},[profileOwner]);

	async function SendRequest() {
		const controller = new AbortController();
		const signal = controller.signal;

		const requestTimeout = setTimeout(() => controller.abort(), 5000);
		try {
			setFriendReqDisabled(true);
			const res = await axios.post(`${url}/user/friend/${profileOwner.intraname}`, {}, {
				signal: signal,
				headers: {
					"Authorization": "Bearer 1",
				},
			})
			setErrorMessage(`Request to be friends with ${profileOwner.name} was sent.`);
			setOpenSnack(true);
		}
		catch (error: any) {
			setFriendReqDisabled(false);
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
		}
		clearTimeout(requestTimeout);
	  };

  return (
	<Box sx={{ display: 'flex', mb: 3 }}>
		<Button
			variant="contained"
			sx={{ border: 2, mr: 1, backgroundColor: "#001C30" }}
			onClick={blockStatus === true ? () => setOpenUnblockModal(true) : () => setOpenBlockModal(true)}
		>
			{ blockStatus === true ? "Unblock" : "Block"}
		</Button>
		{openBlockModal && <BlockModal open={openBlockModal} closeModal={() => setOpenBlockModal(false)} userToBlock={profileOwner}/>}
		{openUnblockModal &&
		<UnblockUser
			open={openUnblockModal}
			userToUnblock={profileOwner}
			closeModalCleanup={() => {
			setOpenUnblockModal(false);
			}}
		/>}
		<Button
			variant="contained"
			disabled={friendReqDisabled}
			sx={{ border: 2, backgroundColor: "#001C30" }}
			onClick={friendStatus === true && friendReqDisabled === false ? () => setOpenUnfriendModal(true) : async () => await SendRequest()}
		>
			{friendReqDisabled && !blockStatus ? "Pending..." : friendReqDisabled && blockStatus ? "Blocked" : friendStatus === true ? "Unfriend" : "Add Friend"}
		</Button>
		{openUnfriendModal && <UnfriendModal
			open={openUnfriendModal}
			setOpen={setOpenUnfriendModal}
			userToUnfriend={profileOwner}
			deselectFriend= {() => {}} //Only for compatibility
		></UnfriendModal>}
		<Snackbar
			autoHideDuration={2000}
			open={openSnack}
			onClose={handleSnackbarClose}
			anchorOrigin={{
				vertical: 'bottom',
				horizontal: 'right',
			}}
		>
			<Alert onClose={handleSnackbarClose} severity={errorMessage.indexOf("Request") === 0 ? "success" : "error"} sx={{ width: '100%' }}>
				{errorMessage}
			</Alert>
		</Snackbar>
	</Box>
  )
}
