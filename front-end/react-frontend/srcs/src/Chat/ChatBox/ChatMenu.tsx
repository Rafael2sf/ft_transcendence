import React, { useState } from 'react'
import { ISocketContextState } from '../../Contexts/ChatSocket/Context'
import { ChanWithMembers, DM } from '../../Entities/ChatTemplates'
import { IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material';
import { MembersList } from './MembersList';
import { InviteUser } from './InviteUser';
import { MembersManagement } from './MembersManagement';
import { ChannelSettings } from './ChannelSettings';
import MoreVertIcon from '@mui/icons-material/MoreVert';

function ChatMenu({socketState}: {socketState: ISocketContextState}) {
	const [moreOptionsAnchor, setMoreOptionsAnchor] = useState<null | HTMLElement>(null);
	const moreOptionOpen = Boolean(moreOptionsAnchor);
	const [openMemberManager, setOpenMemberManager] = useState<boolean>(false);
	const [openInviteModal, setOpenInviteModal] = useState<boolean>(false);
	const [openChannelSettings, setOpenChannelSettings] = useState<boolean>(false);

	function membersClick(event: React.MouseEvent<HTMLElement>) {
		setMoreOptionsAnchor(event.currentTarget);
	}

	function membersClose() {
		setMoreOptionsAnchor(null);
	}

  return (
    <>
    {socketState.openedChatRoom instanceof ChanWithMembers && 
      <Stack direction="row" justifyContent="space-between" alignItems="center" margin={1}>
        <Stack direction="row" alignItems="center">
          <Typography variant="h4" marginRight={1}>{socketState.openedChatRoom.name}</Typography>
          <Typography variant="body2">{socketState.openedChatRoom.type.toLowerCase()}</Typography>
        </Stack>
        <Stack direction="row" alignItems="center">
           <MembersList />
           <IconButton
          color="inherit"
          aria-label="more options"
          onClick={membersClick}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu 
            anchorEl={moreOptionsAnchor}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center'
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
            open={moreOptionOpen}
            onClose={membersClose}
            PaperProps={{
              style: {
                maxHeight: "12rem",
                width: '20ch',
              },
            }}
          >
            <MenuItem key={1} value="invite" onClick={() => setOpenInviteModal(true)}>Invite User...</MenuItem>
            {socketState.openedChatRoom.user_role !== "USER" && 
              <MenuItem key={2} value="admins" onClick={() => setOpenMemberManager(true)}>Manage Members...</MenuItem>
            }
            {socketState.openedChatRoom.user_role === "OWNER" &&
              <MenuItem  key={3} value="password" onClick={() => setOpenChannelSettings(true)}>Channel Settings...</MenuItem>
            }
          </Menu>
        </Stack>
        {openMemberManager && 
          <MembersManagement
          open={openMemberManager}
          closeModal={() => setOpenMemberManager(false)}
          ></MembersManagement>
        }
        {openInviteModal && 
          <InviteUser
            open={openInviteModal}
            closeModal={() => setOpenInviteModal(false)}
          />
        }
        {openChannelSettings &&
          <ChannelSettings
            open={openChannelSettings}
            closeModal={() => setOpenChannelSettings(false)}
          />
        }
      </Stack>
    }
    {socketState.openedChatRoom instanceof DM && 
      <Stack direction="row" justifyContent="space-between" alignItems="center" margin={1}>
        <Stack direction="row" alignItems="center">
          <Typography variant="h4" marginRight={1}>{socketState.openedChatRoom.friend.name}</Typography>
        </Stack>
      </Stack>
    }
    </>
  )
}

export default ChatMenu;