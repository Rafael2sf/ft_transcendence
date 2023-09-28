import { Box, Tab, Tabs } from "@mui/material";
import { useContext, useState } from "react";
import SocketContext from "../../../../Contexts/ChatSocket/Context";
import { BanSubTab } from "./BanSubTab";
import { UnbanSubTab } from "./UnbanSubTab";

interface BanTabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
  }
  
  function BanTabPanel(props: BanTabPanelProps) {
	const { children, value, index, ...other } = props;
  
	return (
	  <div
		role="ban-tabpanel"
		hidden={value !== index}
		id={`ban-tabpanel-${index}`}
		aria-labelledby={`ban-tab-${index}`}
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
	  id: `bam-tab-${index}`,
	  'aria-controls': `ban-tabpanel-${index}`,
	};
  }

export function BanTab() {
	const [value, setValue] = useState(0);

	const handleChange = (event: React.SyntheticEvent, newValue: number) => {
		setValue(newValue);
	};

	return (
		<div>
			<Tabs
				orientation="horizontal"
				variant="scrollable"
				value={value}
				onChange={handleChange}
				aria-label="Ban and unban tabs"
				sx={{ borderRight: 1, borderColor: 'divider' }}
			>
				<Tab label="Ban User" {...a11yProps(0)} />
				<Tab label="Unban User" {...a11yProps(1)} />
			</Tabs>
			<BanTabPanel value={value} index={0}>
				<BanSubTab/>
			</BanTabPanel>
			<BanTabPanel value={value} index={1}>
				<UnbanSubTab/>
			</BanTabPanel>
		</div>
	)
}