import { Box, Dialog, DialogContent, DialogTitle, Tab, Tabs } from "@mui/material";
import { ChanWithMembers } from "../../../Entities/ChatTemplates";
import { useContext, useState } from "react";
import { MuteTab } from "./MuteTab";
import { KickTab } from "./KickTab";
import SocketContext from "../../../Contexts/ChatSocket/Context";
import { BanTab } from "./BanTab";
import { OwnerTab } from "./OwnerTab";

interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
  }
  
  function TabPanel(props: TabPanelProps) {
	const { children, value, index, ...other } = props;
  
	return (
	  <div
		role="tabpanel"
		hidden={value !== index}
		id={`member-manager-tabpanel-${index}`}
		aria-labelledby={`member-manager-tab-${index}`}
		{...other}
	  >
		{value === index && (
		  <Box>
			{children}
		  </Box>
		)}
	  </div>
	);
  }
  
  function a11yProps(index: number) {
	return {
	  id: `member-manager-tab-${index}`,
	  'aria-controls': `member-manager-tabpanel-${index}`,
	};
  }

export function MembersManagement({open, closeModal } : 
{
	open: boolean,
	closeModal: () => void
}) {

	const [value, setValue] = useState(0);
	const { SocketState } = useContext(SocketContext);


	const handleChange = (event: React.SyntheticEvent, newValue: number) => {
		setValue(newValue);
	};

	return (
		<Dialog
			open={open}
			onClose={closeModal}
			aria-labelledby='dialog-title'
		>
			<DialogTitle id="dialog-title">Members Manager</DialogTitle>
			<DialogContent
				sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex' }}
			>
			<Tabs
				orientation="vertical"
				variant="scrollable"
				value={value}
				onChange={handleChange}
				aria-label="Vertical tabs example"
				sx={{ borderRight: 1, borderColor: 'divider' }}
			>
				<Tab label="Mute" {...a11yProps(0)} />
				<Tab label="Kick" {...a11yProps(1)} />
				<Tab label="Ban" {...a11yProps(2)} />
				{SocketState.openedChatRoom instanceof ChanWithMembers && SocketState.openedChatRoom.user_role === "OWNER" &&
					<Tab label="Admin" {...a11yProps(3)} />
				}
			</Tabs>
			<TabPanel value={value} index={0}>
				<MuteTab/>
			</TabPanel>
			<TabPanel value={value} index={1}>
				<KickTab/>
			</TabPanel>
			<TabPanel value={value} index={2}>
				<BanTab/>
			</TabPanel>
			{SocketState.openedChatRoom instanceof ChanWithMembers && SocketState.openedChatRoom.user_role === "OWNER" &&
				<TabPanel value={value} index={3}>
					<OwnerTab/>
				</TabPanel>
			}
			</DialogContent>
		</Dialog>
	)
}