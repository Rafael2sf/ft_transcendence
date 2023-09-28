import {
	Box,
	List,
	ListItem,
	ListItemText,
	ListItemButton,
	Typography,
	IconButton,
	Accordion,
	AccordionSummary,
	AccordionDetails,
  styled,
  Badge,
} from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import SocketContext from '../../Contexts/ChatSocket/Context';
import { useContext, useRef, useState } from 'react';
import { DM } from '../../Entities/ChatTemplates';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { UnblockUser } from './UnblockUser';
import { UnfriendModal } from './UnfriendModal';
import { IUser } from '../../Entities/ProfileTemplate';

const StyledBadge = styled(Badge) ({
	"& .MuiBadge-badge": {
		minWidth: 0,
		width: 15,
		height: 15,
		borderRadius: '50%',
		padding: 0,
	}
});

export function FriendDrawer({ setSelector, drawerCloser, columnName}:
	{ setSelector: (channel: DM | null) => void, drawerCloser: () => void, columnName: string}) {

	const { SocketState } = useContext(SocketContext);
	const [isHovered, setIsHovered] = useState< Map<number, boolean> >(new Map());
	const [expanded, setExpanded] = useState<string | false>(false);
	const [openUnblock, setOpenUnblock] = useState<boolean>(false);
	const [openUnfriend, setOpenUnfriend] = useState<boolean>(false);
	const selectedBlockedUser = useRef<IUser | null>(null);



	function handleMouseOver(id: number) {
		setIsHovered(() => {
			const updatedMap = new Map(isHovered);
			updatedMap.set(id, true);
			return updatedMap;
		});
	};

	function handleMouseOut(id: number) {
		setIsHovered(() => {
			const updatedMap = new Map(isHovered);
			updatedMap.set(id, false);
			return updatedMap;
		});
	};

	function handleChange(panel: string) {
      setExpanded(expanded !== panel ? panel : false);
    };

	const FriendsList = SocketState.DMs.map((direct) => (
			<ListItem
				key={direct.id}
				disablePadding
				sx={{
					'&:hover .secIcon': {
						display: "block",
          }
        }}
				onMouseOver={() => handleMouseOver(direct.id as number)}
				onMouseOut={() => handleMouseOut(direct.id as number)}
				secondaryAction={
					<IconButton
						aria-label="unfriend/block"
						edge="end"
						size="small"
						className='secIcon'
						onClick={() => {
							selectedBlockedUser.current = direct.friend;
							setOpenUnfriend(true);
						}}
						sx={{
						display: "none",
						}}
					>
						<PersonRemoveIcon/>
					</IconButton>
				}
			>
				<ListItemButton
					selected={SocketState.openedChatRoom instanceof DM && direct.id === SocketState.openedChatRoom.id}
					onClick={()=> {
						if ((SocketState.openedChatRoom instanceof DM && direct.id !== SocketState.openedChatRoom.id)
							|| !(SocketState.openedChatRoom instanceof DM))
							setSelector(direct);
					}}
				>
          <StyledBadge
					badgeContent=""
					color={(direct.friend.status === "ONLINE") 
							? "success" 
							: (direct.friend.status === "IN_GAME") 
							? "warning" 
							: "error"}
					overlap="circular"
					/>
					<ListItemText sx={{ml: 2}} primary={direct.friend.name} />
				</ListItemButton>
			</ListItem>
		));

		const BlockedList = SocketState.blockedUsers
		.filter((blockedUser) => SocketState.DMs.find((DM) => DM.friend.id === blockedUser.id) === undefined)
		.map((blockedUser) => (
			<ListItem
				key={blockedUser.id}
				disablePadding
			>
				<ListItemButton
					onClick={() => {
						selectedBlockedUser.current = blockedUser;
						setOpenUnblock(true);
					}}
				>
					<ListItemText primary={blockedUser.name} />
				</ListItemButton>
			</ListItem>
		));

	return (
		<Box marginTop={8} sx={{ display: 'flex', flexDirection: 'column'}}>
			{ window.innerWidth <= 900 &&
				<IconButton
				sx={{ alignSelf: "start" }}
				color="inherit"
				aria-label="close drawer channels"
				onClick={drawerCloser}
				>
					<ArrowForwardIosIcon/>
				</IconButton>
			}
			<Accordion disableGutters expanded={expanded === 'panel1'} onChange={() => handleChange('panel1')} square elevation={5}>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon />}
					aria-controls="friends-content"
					>
					<Typography variant='h6' align='center' marginTop={1} marginLeft={3}>
						{columnName}
					</Typography>
				</AccordionSummary>
				<AccordionDetails  sx={{backgroundColor: "#356688", padding: 0}}>
					<List disablePadding>
						{FriendsList}
					</List>
				</AccordionDetails>
			</Accordion>
			<Accordion disableGutters expanded={expanded === 'panel2'} onChange={() => handleChange('panel2')} square elevation={5}>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon />}
					aria-controls="blocked-users-content"
					>
					<Typography variant='h6' align='center' marginTop={1} >
						Blocked users
					</Typography>
				</AccordionSummary>
				<AccordionDetails  sx={{backgroundColor: "#356688", padding: 0}}>
					<List disablePadding>
						{BlockedList}
					</List>
				</AccordionDetails>
			</Accordion>
			{openUnfriend && <UnfriendModal
			  open={openUnfriend}
			  setOpen={setOpenUnfriend}
			  userToUnfriend={selectedBlockedUser.current}
			  deselectFriend= {() => {
				if (SocketState.openedChatRoom instanceof DM && SocketState.openedChatRoom.friend.id === selectedBlockedUser.current?.id)
					setSelector(null);
				selectedBlockedUser.current = null;
			}}
			/>}
			{openUnblock && <UnblockUser
			  open={openUnblock}
			  closeModalCleanup={() => {
				selectedBlockedUser.current = null;
				setOpenUnblock(false);
			  }}
			  userToUnblock={selectedBlockedUser.current}
			/>}
		</Box>
	)
}

