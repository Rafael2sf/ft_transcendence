import React, { useContext, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Popover,
  Button,
  Avatar,
  Typography,
  Snackbar,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import WindowDims from '../Entities/WindowDims';
import { useNavigate } from 'react-router-dom';
import { SearchBox } from './SearchBox';
import { url } from '../Constants/ApiPort';
import AppsIcon from '@mui/icons-material/Apps';
import { UserContext } from '../Contexts/UserContext';
import SideBar from './SideBar';
import { Logout } from './Logout';

export function NavBar({ windowSize }: { windowSize: WindowDims }) {
  const [sidebar, setSidebar] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [searchAnchor, setSearchAnchor] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchor);
  const searchOpen = Boolean(searchAnchor);
  const navigate = useNavigate();

  const { userState } = useContext(UserContext);
  const [errorMessage, setErrorMessage] = useState("");
  const [openSnack, setOpenSnack] = useState(false);

  function handleSnackbarClose(event?: React.SyntheticEvent | Event, reason?: string) {
	  if (reason === 'clickaway') return;
	  setOpenSnack(false);
	  setTimeout(() => setErrorMessage(""), 150);
  };

  function handleClick(event: React.MouseEvent<HTMLElement>) {
    setMenuAnchor(event.currentTarget);
  }

  function menuClose() {
    setMenuAnchor(null);
  }

  function searchClick(event: React.MouseEvent<HTMLElement>) {
    setSearchAnchor(event.currentTarget);
  }

  function searchClose() {
    setSearchAnchor(null);
  }

  return (
    <>
      <AppBar
        position='fixed'
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          height: '4rem',
          boxShadow: 'shadow.1',
        }}
      >
        <Toolbar
          disableGutters 
		  sx={{
            height: '4rem',
            bgcolor: '#001C30',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{display: 'flex', flexGrow: 1}}>
            <Button onClick={() => setSidebar(!sidebar)} sx={{marginX: 1.5}}><AppsIcon fontSize='large' /></Button>
            {
              windowSize.width < 600 ?
              <>
              <IconButton
              size='large'
              color='inherit'
              onClick={searchClick}
          >
            <SearchIcon  fontSize='large'/>
        	</IconButton>
              <Popover 
				anchorEl={searchAnchor}
				anchorOrigin={{
				vertical: 'bottom',
				horizontal: 'center'
				}}
				transformOrigin={{
				vertical: 'top',
				horizontal: 'left'
				}}
				open={searchOpen}
				onClose={searchClose}
			  >
				<SearchBox boxWidth='50vw'/>
			  </Popover>
            </>
            :
            <SearchBox boxWidth='25vw' />
            }
            </Box>
            <IconButton sx={{height: '4rem', borderRadius: 0, marginRight: 2}}  onClick={handleClick}>
				<Typography variant='h6' m='1rem'>{userState.name}</Typography>
				<Avatar sizes='32px 32px' src={userState.picture}/>
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            open={menuOpen}
            onClose={menuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            sx={{ zIndex: (theme) => theme.zIndex.drawer + 1}}
          >
			    <MenuItem key={0} component={NavLink} to={'/profile'} onClick={menuClose}>
				  Profile
                </MenuItem>
				<MenuItem key={1} component={NavLink} to={'/settings'} onClick={menuClose}>
                  Settings
                </MenuItem>
				<MenuItem key={2} onClick={async() => { await Logout(navigate, (message) => setErrorMessage(message), () => setOpenSnack(true)); menuClose()}}>
				  Logout
                </MenuItem>
          </Menu>
        </Toolbar>
		<Snackbar
			autoHideDuration={2000}
			open={openSnack}
			onClose={handleSnackbarClose}
			anchorOrigin={{
				vertical: 'bottom',
				horizontal: 'right',
			}}
		>
			<Alert onClose={handleSnackbarClose} severity={"error"} sx={{ width: '100%' }}>
				{errorMessage}
			</Alert>
		</Snackbar>
      </AppBar>
      <SideBar sidebar={sidebar} closeSideBar={() => setSidebar(false)}/>
    </>
  );
}
