import { Box, IconButton, InputAdornment, TextField, styled, Button } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react'
import SendIcon from '@mui/icons-material/Send';
import { ISocketContextState } from '../../Contexts/ChatSocket/Context';
import { ChanWithMembers } from '../../Entities/ChatTemplates';
import GameInviteButton from './GameInviteButton';
import { UserContext } from '../../Contexts/UserContext';

const StyledTextField = styled(TextField)({


	'& .MuiInputBase-root': {
		borderRadius: "12px",
		'& fieldset':  {
			border: 'grey solid 1px',
		},
		'&:hover fieldset': {
			border: 'dimgrey solid 2px',
		},
		'&.Mui-focused fieldset': {
			border: 'dimgrey solid 2px',
		},
	},
})

function SendInput({socketState}: {socketState: ISocketContextState}) {
	const [textInput, setTextInput] = useState<string>("");
	const [placeholder, setPlaceholder] = useState<string>('Write message here (max 140 characters)...');
	const {userState} = useContext(UserContext);

	function sendMessage(event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLDivElement>) {
		event.preventDefault();
		if (textInput !== "" && socketState.openedChatRoom)
		{
			if (socketState.openedChatRoom instanceof ChanWithMembers)
				socketState.socket?.emit("channel.message.create", { "text": textInput, "channel_id": socketState.openedChatRoom.id});
			else
				socketState.socket?.emit("direct.message.create", { "text": textInput, "intraname": socketState.openedChatRoom?.friend.intraname});
			setTextInput("");
		}
	};

	useEffect(() => {
		if (socketState.openedChatRoom instanceof ChanWithMembers)
		{
			const myChatUserObject = socketState.openedChatRoom.users.find((user) => user.user.id === userState.id);
			if (myChatUserObject && myChatUserObject.muted)
			{
				setPlaceholder(`You have been muted until ${new Date(myChatUserObject.muted).toLocaleString()}...`)
			}
			else
				setPlaceholder('Write message here (max 140 characters)...');
		}
		else
			setPlaceholder('Write message here (max 140 characters)...');
	}, [socketState, socketState.openedChatRoom]);

  return (
    <Box
    marginTop={1}
    display="flex"
    borderRadius="12px"
    sx={{
      boxShadow: 4,
    }}
    margin={0.5}
	alignItems="center"
    >
      <StyledTextField
        placeholder={placeholder}
        multiline
        value={textInput}
        onChange={(event) => setTextInput(event.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && textInput.length <= 140) {
            e.preventDefault();
            sendMessage(e);
          }}}
        InputProps={placeholder === 'Write message here (max 140 characters)...' ? {
          endAdornment:
            <InputAdornment position='end' style={{cursor: 'pointer'}}>
              <IconButton onClick={sendMessage} disabled={textInput.length > 140}>
                <SendIcon sx={{
                  "&:hover": { color: "#42a5f5" },
                  }}/>
              </IconButton>
            </InputAdornment>
          }
		  :
		  undefined
		}
        maxRows={10}
        sx={{
          overflowY: 'clip',
          flexGrow: 1,
          background: placeholder !== 'Write message here (max 140 characters)...' ? "#363636" : "",
          borderRadius: "12px",
        }}
		disabled={placeholder !== 'Write message here (max 140 characters)...'}
      >
      </StyledTextField>
	  <GameInviteButton muteChecker={placeholder}/>
    </Box>
  )
}

export default SendInput;