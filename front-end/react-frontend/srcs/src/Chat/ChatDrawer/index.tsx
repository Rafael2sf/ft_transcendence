import { Drawer, IconButton, SvgIconTypeMap, Tooltip, Typography } from '@mui/material';
import { Box } from '@mui/system';
import  { ReactElement } from 'react';
import { OverridableComponent } from '@mui/material/OverridableComponent';

interface DrawerElements {
	children: ReactElement,
	showArrow: boolean,
	isOpened: boolean,
	handleDrawerState: () => void,
	title: string,
	tooltipPlacement: "right" | "left",
	drawerAnchor:  "right" | "left",
	Arrow: OverridableComponent<SvgIconTypeMap<{}, "svg">>,
	bgColor: string
}

export function ChatDrawer( {children, showArrow, isOpened, handleDrawerState, title, tooltipPlacement, drawerAnchor, Arrow, bgColor} : DrawerElements) {


	return (
		<Box display="flex" sx={{zIndex: 4}}>
				{ showArrow &&
					<Tooltip
						title={<Typography variant='caption'>{title}</Typography>}
						placement={tooltipPlacement}
						arrow
						enterDelay={100}
						leaveDelay={200}
					>
						<IconButton
							color="inherit"
							aria-label={`open drawer ${title}`}
							onClick={handleDrawerState}
							sx={{
								zIndex: 3,
								borderRadius: 0,
								backgroundColor:"#263e4f",
								':hover': {
									bgcolor: 'primary.dark',
									color: 'white',
								  },}}
							>
								{<Arrow/>}
						</IconButton>
					</Tooltip>
				}
			<Drawer
				variant="persistent"
				anchor={drawerAnchor}
				open={ isOpened}
				PaperProps={{
					sx: { width: `200px`, backgroundColor: bgColor, border: "0" },
				}}
				sx= {{
				}}
			>
				{children}
			</Drawer>
		</Box>
	)
}
