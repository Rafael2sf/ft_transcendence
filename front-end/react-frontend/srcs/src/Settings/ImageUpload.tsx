import { Box, Button, IconButton, Snackbar, Typography } from '@mui/material';
import ImageUploading, { ImageListType } from 'react-images-uploading';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';
import axios from 'axios';
import { url } from '../Constants/ApiPort';
import { useContext, useRef, useState } from 'react';
import { UserContext } from '../Contexts/UserContext';
import { useNavigate } from 'react-router-dom';

export default function ImageUpload() {
	
	const [images, setImages] = useState<ImageListType>([]);
	const [disabled, setDisabled] = useState(false);
	const snackBarMessage = useRef<string>('Settings have been updated!');
	const [open, setOpen] = useState(false);
	const {userState} = useContext(UserContext);
	const navigate = useNavigate();
	
	function onChange(imageList: ImageListType, addUpdateIndex: number[] | undefined) {
		// data for submit
		console.log(imageList, addUpdateIndex);
		setImages(imageList);
	  };
	
	function handleClose(event?: React.SyntheticEvent | Event, reason?: string) {
		if (reason === 'clickaway') return;
		setOpen(false);
	  };

	function handleImageSubmit() {
		const controller = new AbortController();
		const signal = controller.signal;
	
		const requestTimeout = setTimeout(() => controller.abort(), 5000);
	
		let formData = new FormData();
		if (images.length !== 0)
			formData.append('avatar', images[0].file as Blob);
		
		setDisabled(true);
		axios.put(
			`${url}/user/avatar`,
			formData,
			{
			  signal: signal,
        headers: {
          "Content-Type": "multipart/form-data",
        }
			},
		  )
		  .then(() => {
			snackBarMessage.current = 'Avatar was updated!';
			navigate(0);
		})
		  .catch((error) => {
			if (error.response) {
			  // The request was made and the server responded with a status code
			  // that falls out of the range of 2xx

			  if (error.response.status === 401)
			  {
				  navigate("/login");
				  return;
			  }
			  else
			  {
				  if (error.response.data.message && typeof(error.response.data.message) !== "string")
				 	snackBarMessage.current = error.response.data.message[0];
				  else
				  	snackBarMessage.current = error.response.data.message ? error.response.data.message : "ERROR";
			  }
			} else if (error.request) {
			  // The request was made but no response was received
			  // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
			  // http.ClientRequest in node.js
			  console.log(error.request);
			} else {
			  // Something happened in setting up the request that triggered an Error
			  console.log('Error: ', error.message);
			}
		  })
		  .finally(() => {
			clearTimeout(requestTimeout);
			setOpen(true);
			setDisabled(false);
		  });
	  };
	
	return (
	<Box  sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <Typography>Upload Avatar:</Typography>
          <ImageUploading value={images} onChange={onChange}>
            {({ imageList, onImageUpload, onImageRemove}) => (
              <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center">
                <Button
                  sx={{
                    width: '128px',
                    height: '128px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    outline: '2px solid white',
                  }}
                  onClick={onImageUpload}
                >
					<img
						src={
							imageList.length
							? imageList[0].dataURL
							: userState.picture
						}
						alt='profile_image'
						style={{ borderRadius: '50%', textAlign: "center", lineHeight: "128px"}}
						width='128px'
						height='128px'
					/> 
				</Button>
                {imageList.length !== 0 && (
                  <Box>
                    <IconButton 
                      onClick={() => {handleImageSubmit();}}
					  disabled={disabled}
                    >
                      <CheckIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => onImageRemove(0)}
					  disabled={disabled}
					>
                      <CancelIcon />
                    </IconButton>
                  </Box>
                )}
              </Box>
            )}
          </ImageUploading>
		  <Snackbar
                message={snackBarMessage.current}
                autoHideDuration={2000}
                open={open}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
              />
        </Box>
  )
}
