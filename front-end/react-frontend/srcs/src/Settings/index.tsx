import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Grid,
  IconButton,
  Snackbar,
  styled,
  TextField,
  Typography,
} from '@mui/material';
import WindowDims from '../Entities/WindowDims';
import ImageUpload from './ImageUpload';
import InformationUpload from './InformationUpload';



export default function Settings({ windowSize }: { windowSize: WindowDims }) {

  return (
	<Box
	  width="100%"
	  display="flex"
	  justifyContent="center"
	  alignItems="center"
	  overflow='auto'
	  sx={{ backgroundImage: `url(${`/lobbyBg.jpg`})`, height: '100vh', paddingTop:"4rem"}}
	>
      <Box
        sx={{
		  margin:"auto",
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
		  border: 2,
		  borderRadius: 5,
		  backgroundColor: "rgba(173, 182, 196, 0.4)",
		  width: "50vw",
		  minWidth: "400px",
		  paddingBottom: 1,
        }}
      >
		<Typography variant='h4' align='center' borderBottom={2} bgcolor="#0d283b" width="100%" borderRadius={"20px 20px 0px 0px"}>Settings</Typography>
		<ImageUpload />
        <InformationUpload/>
      </Box>
	</Box>
  );
}
