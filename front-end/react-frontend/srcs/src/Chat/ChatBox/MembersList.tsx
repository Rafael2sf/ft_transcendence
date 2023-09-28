import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import { Avatar, Badge, Box, IconButton, ListItemAvatar, Menu, MenuItem, Typography } from '@mui/material';
import { useContext, useState } from 'react';
import { ChanWithMembers, ICardPosition } from '../../Entities/ChatTemplates';
import SocketContext from '../../Contexts/ChatSocket/Context';
import { ChatMemberCard } from './ChatMemberCard';
import { styled } from '@mui/material/styles';
import { IUser } from '../../Entities/ProfileTemplate';
import CommentsDisabledIcon from '@mui/icons-material/CommentsDisabled';

const StyledBadge = styled(Badge) ({
	"& .MuiBadge-badge": {
		minWidth: 0,
		width: 15,
		height: 15,
		borderRadius: '50%',
		padding: 0,
	}
});

const MembersBadge = styled(Badge) ({
	"& .MuiBadge-badge": {
		fontSize: "1rem"
	}
});


export function MembersList() {

	const [membersAnchor, setMembersAnchor] = useState<null | HTMLElement>(null);
	const membersOpen = Boolean(membersAnchor);
	const { SocketState } = useContext(SocketContext);
	const [cardAnchor, setCardAnchor] = useState<{anchorEl: null | HTMLElement, openPopoverId: null | number, userClicked: IUser | null}>(
		{
			anchorEl: null,
			openPopoverId: null,
			userClicked: null
		});
	const cardPosition: ICardPosition = {
		anchor: {
			vertical: 'center',
			horizontal: 'left',
		},
		transform: {
			vertical: 'top',
			horizontal: 'right',
		}
	}

	function membersClick(event: React.MouseEvent<HTMLElement>) {
		setMembersAnchor(event.currentTarget);
	}

	function membersClose() {
		setMembersAnchor(null);
	}

	function memberNameClick(event: React.MouseEvent<HTMLElement>, id: number, sender: IUser) {setCardAnchor({anchorEl: event.currentTarget, openPopoverId: id, userClicked: sender });};

	function memberCardClose() {setCardAnchor({anchorEl: null, openPopoverId: null, userClicked: null });};

	const menuMembers = new Array;


	if (SocketState.openedChatRoom instanceof ChanWithMembers)
	{
		menuMembers.push(<Typography key="owner_header" variant='body2' sx={{borderBottom: '1px solid black', padding: '0 1rem'}}>Owner</Typography>)
		menuMembers.push(
			<MenuItem
			  key={SocketState.openedChatRoom.owner.id}
			  onClick={(event) => memberNameClick(event, (SocketState.openedChatRoom as ChanWithMembers).owner.id, (SocketState.openedChatRoom as ChanWithMembers).owner)}>
				<ListItemAvatar>
					<StyledBadge
					badgeContent=""
					color={(SocketState.openedChatRoom.owner.status === "ONLINE")
							? "success"
							: (SocketState.openedChatRoom.owner.status === "IN_GAME")
							? "warning"
							: "error"}
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'right',
					}}
					overlap="circular"
					>
						<Avatar
						alt={`user_avatar`}
						src={SocketState.openedChatRoom.owner.picture}
						/>
					</StyledBadge>
              	</ListItemAvatar>
				{SocketState.openedChatRoom.owner.name}
			</MenuItem>);

		const adminArray = SocketState.openedChatRoom.users.filter((user) => user.role === "ADMIN").map((admin) => (
			<MenuItem
			  key={admin.user.id}
			  onClick={(event) => memberNameClick(event, admin.user.id, admin.user)}
			>
				<ListItemAvatar>
          {
            admin.muted !== undefined &&
              <StyledBadge
                badgeContent={<CommentsDisabledIcon/>}
                overlap="circular"
              />
          }
					<StyledBadge
					badgeContent=""
					color={(admin.user.status === "ONLINE")
							? "success"
							: (admin.user.status === "IN_GAME")
							? "warning"
							: "error"}
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'right',
					}}
					overlap="circular"
					>
						<Avatar
						alt={`user_avatar`}
						src={admin.user.picture}
						/>
					</StyledBadge>
             	 </ListItemAvatar>
				{admin.user.name}
			</MenuItem>));
		if (adminArray.length)
    {
      menuMembers.push(<Typography  key="admin_header" variant='body2' sx={{borderBottom: '1px solid black', padding: '0 1rem'}}>Admins</Typography>);
      menuMembers.push(...adminArray);
    }

		const usersArray = SocketState.openedChatRoom.users.filter((user) => user.role === "USER").map((member) => (
			<MenuItem
			  key={member.user.id}
			  onClick={(event) => memberNameClick(event, member.user.id, member.user)}
			>
			<ListItemAvatar>
        {
          member.muted !== undefined &&
            <StyledBadge
              badgeContent={<CommentsDisabledIcon/>}
              overlap="circular"
            />
        }
				<StyledBadge
					badgeContent=""
					color={(member.user.status === "ONLINE")
							? "success"
							: (member.user.status === "IN_GAME")
							? "warning"
							: "error"}
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'right',
					}}
					overlap="circular"
					>
					<Avatar
					alt={`user_avatar`}
					src={member.user.picture}
					/>
				</StyledBadge>
			</ListItemAvatar>
			{member.user.name}
		</MenuItem>));

    if (usersArray.length)
    {
      menuMembers.push(<Typography key="member_header" variant='body2' sx={{borderBottom: '1px solid black', padding: '0 1rem'}}>Members</Typography>);
      menuMembers.push(...usersArray);
    }
	}


	return (
		<Box marginRight={1}>
			<MembersBadge
			  badgeContent={SocketState.openedChatRoom instanceof ChanWithMembers && SocketState.openedChatRoom.members}
			  color="primary"
			  anchorOrigin={{
				vertical: 'bottom',
				horizontal: 'right',
			  }}
			  max={99}
			  overlap="circular"
			>
				<IconButton
				color="inherit"
				aria-label="show members"
				onClick={membersClick}
				>
					<PeopleAltIcon/>
				</IconButton>
			</MembersBadge>
			<Menu
				anchorEl={membersAnchor}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'center'
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'right'
				}}
				open={membersOpen}
				onClose={membersClose}
				PaperProps={{
				style: {
					maxHeight: "12rem",
					width: '20ch',
				},
			}}
			>
				{menuMembers}
			</Menu>
			{cardAnchor.userClicked &&
					<ChatMemberCard cardAnchor={cardAnchor} memberCardClose={memberCardClose} cardPosition={cardPosition}></ChatMemberCard>
				}
		</Box>
	)
}