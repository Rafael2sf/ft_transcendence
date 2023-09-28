import { Box, Divider, Drawer, List, ListItem, ListItemIcon, SvgIcon } from '@mui/material';
import { NavLink } from 'react-router-dom';
import PongIcon from './PongIcon';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import SportsEsportsOutlinedIcon from '@mui/icons-material/SportsEsportsOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';

export default function SideBar({sidebar, closeSideBar}: {sidebar: boolean, closeSideBar: () => void}) {
  const sideBarItems = [
	{ to: '/', icon: HomeOutlinedIcon },
	{ to: '/chat', icon: ForumOutlinedIcon },
	{ to: '/lobby', icon: SportsEsportsOutlinedIcon },
	{ to: '/profile', icon: AccountCircleOutlinedIcon },
  ];

  return (
	<Drawer
        open={sidebar}
        variant='temporary'
        sx={{ position: 'fixed', width: '8rem', flexShrink: 0, [`& .MuiDrawer-paper`]: { width: '5rem', boxSizing: 'border-box' }, zIndex: (theme) => theme.zIndex.drawer + 2 }}
        ModalProps={{keepMounted: true}}
        onClose={closeSideBar}
      >
        <Box
          sx={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
			fontSize: "48px"
          }}
        >
		  <PongIcon />
		  <Divider sx={{width: "100%"}}/>
          <List>
            {sideBarItems.map(({ to, icon }, i) => (
                <ListItem key={i} sx={{padding: '.5rem 0'}}>
                  <NavLink to={to} onClick={closeSideBar}>
                    {({ isActive }) => (
                      <ListItemIcon sx={{ display: 'flex', justifyContent: 'center' }}>
                    <SvgIcon
                    component={icon}
					fontSize='large'
                    sx={{color: isActive ? 'primary.main' : 'white', stroke: 'black', strokeWidth: 0.5 }}
                    inheritViewBox
                    />
                    </ListItemIcon>
                    )}
                  </NavLink>
                </ListItem>
              )
            )}
          </List>
        </Box>
      </Drawer>
  )
}
