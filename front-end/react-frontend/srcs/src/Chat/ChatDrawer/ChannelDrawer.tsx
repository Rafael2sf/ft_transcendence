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
	Button,
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SocketContext from '../../Contexts/ChatSocket/Context';
import { useContext, useRef, useState } from 'react';
import { Channel, ChatObject } from '../../Entities/ChatTemplates';
import { Stack } from '@mui/system';
import { CreateChannel } from './CreateChannel';
import { ChannelSearch } from './ChannelSearch';
import { RemoveChannel } from './RemoveChannel';


export function ChannelDrawer({ setSelector, drawerCloser, columnName}: 
	{ setSelector: (channel: ChatObject | null) => void ,drawerCloser: () => void, columnName: string}) {

	const { SocketState } = useContext(SocketContext);
	const [expanded, setExpanded] = useState<string | false>(false);
	const [openModal, setOpenModal] = useState(false);
	const [openDeleteMessage, setOpenDeleteMessage] = useState(false);
	const [isHovered, setIsHovered] = useState< Map<string, boolean> >(new Map());
	const channelToAlter = useRef<Channel | null>(null);

	function handleChange(panel: string) {
		setExpanded(expanded !== panel ? panel : false);
	  };

	function handleMouseOver(id: string) {
		setIsHovered(() => {
			const updatedMap = new Map(isHovered); 
			updatedMap.set(id, true);
			return updatedMap;
		});
	};

	function handleMouseOut(id: string) {
		setIsHovered(() => {
			const updatedMap = new Map(isHovered); 
			updatedMap.set(id, false);
			return updatedMap;
		});
	};

	function handleChannelDelete(channel: Channel) {
		channelToAlter.current = channel;
		setOpenDeleteMessage(true);
	}


	const generalChannelsList = SocketState.channels
	.filter((channel) => channel.user_role !== "OWNER")
	.map((channel) => (
		<ListItem 
			key={channel.id}
			disablePadding
			sx={{
				'&:hover .secIcon': {
					display: "block",
				}
			}}
			onMouseOver={() => handleMouseOver(channel.id as string)}
			onMouseOut={() => handleMouseOut(channel.id as string)}
			secondaryAction={
				isHovered.get(channel.id as string) && 
          channel.id != '00000000-0000-0000-0000-000000000000' &&
					<IconButton
					aria-label="Remove channel"
					edge="end"
					size="small"
					className="secIcon"
					onClick={() => handleChannelDelete(channel)}
					sx={{
							display: "none",
						}}
					>
						<CloseIcon/>
					</IconButton>
			}
		>
			<ListItemButton 
				selected={channel.id === SocketState.openedChatRoom?.id}
				onClick={()=> {
					if (channel.id !== SocketState.openedChatRoom?.id)	
						setSelector(channel);
				}}
			>
				<ListItemText primary={channel.name} />
			</ListItemButton>
		</ListItem>
	));

	const ownedChannelsList = SocketState.channels
	.filter((channel) => channel.user_role === "OWNER")
	.map((channel) => (
		<ListItem 
			key={channel.id}
			disablePadding
			sx={{
				'&:hover .secIcon': {
					display: "block",
				}
			}}
			onMouseOver={() => handleMouseOver(channel.id as string)}
			onMouseOut={() => handleMouseOut(channel.id as string)}
			secondaryAction={
				isHovered.get(channel.id as string) &&
					<IconButton
					aria-label="Remove channel"
					edge="end"
					size="small"
					className="secIcon"
					onClick={() => handleChannelDelete(channel)}
					sx={{
							display: "none",
						}}
					>
						<CloseIcon/>
					</IconButton>
			}
		>
			<ListItemButton 
				selected={channel.id === SocketState.openedChatRoom?.id}
				onClick={()=> {
					if (channel.id !== SocketState.openedChatRoom?.id)	
						setSelector(channel);
				}}
			>
				<ListItemText primary={channel.name} />
			</ListItemButton>
		</ListItem>
	));


	return (
		<Box marginTop={8} sx={{ display: 'flex', flexDirection: 'column'}}>
			<Stack direction='row' alignSelf="end">
				{window.innerWidth <= 700 &&
					<IconButton
					color="inherit"
					aria-label="close friends channels"
					onClick={drawerCloser}
					>
						<ArrowBackIosNewIcon/>
					</IconButton>
				}
			</Stack>
			<Accordion disableGutters expanded={expanded === 'panel1'} onChange={() => handleChange('panel1')} square elevation={5}>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon />}
					aria-controls="general-channels-content"
					>
					<Typography variant='h6' align='center' marginTop={1} marginLeft={2} >
						{columnName}
					</Typography>
				</AccordionSummary>
				<AccordionDetails sx={{backgroundColor: "#356688", padding: 0}}>
					<ChannelSearch/>
					<List disablePadding>
						{generalChannelsList}
					</List>
				</AccordionDetails>
			</Accordion>
			<Accordion disableGutters expanded={expanded === 'panel2'} onChange={() => handleChange('panel2')} square elevation={5}>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon />}
					aria-controls="owned-channels-content"
					>
					<Typography variant='h6' align='center' marginTop={1} >
						My Channels
					</Typography>
				</AccordionSummary>
				<AccordionDetails sx={{backgroundColor: "#356688", padding: 0}}>
					<List disablePadding>
						{ownedChannelsList}
					</List>
					{openDeleteMessage && <RemoveChannel open={openDeleteMessage} setOpen={setOpenDeleteMessage} channelToDelete={channelToAlter} deselectChannel={() => setSelector(null)}/>}
				</AccordionDetails>
			</Accordion>
			<Stack direction='row' marginTop="3px" alignSelf="center">
				<Button
				aria-label="create channels"
				onClick={() => setOpenModal(true)}
				variant="contained"
				sx={{ border: 2, margin: 1, backgroundColor: "#001C30"}}
				>
					Create Channel
				</Button>
			</Stack>
			{openModal && <CreateChannel open={openModal} setOpen={(value) => setOpenModal(value)}></CreateChannel>}
		</Box>
	)
}

