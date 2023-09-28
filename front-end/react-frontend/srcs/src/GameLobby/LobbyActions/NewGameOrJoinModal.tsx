import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Slider, Snackbar, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreateNewGame, JoinQueue } from "./GameRequests";
import ImageBgList from "./ImageBgList";
import { ChromePicker } from 'react-color';
import { UserContext } from "../../Contexts/UserContext";
import { GameScope } from "../../Entities/GameTemplates";

export function NewGameOrJoinModal({open, scope, closeModal, sendInvite, isFirstPlayer}:
	{
    scope: GameScope,
		open: boolean,
		closeModal: () => void,
		sendInvite: ((gameCreated: number) => void )| null,
		isFirstPlayer: boolean
	})
{
	const navigate = useNavigate();
	const [bgType, setBgType] = useState<"image" | "color">("image");
	const [selectedImage, setSelectedImage] = useState("textures/bender");
	const [paddleColor, setPaddleColor] = useState("#fff");
	const [maxScore, setMaxScore] = useState(11);
	const {userState} = useContext(UserContext);
	const [errorMessage, setErrorMessage] = useState("");
	const [openSnack, setOpenSnack] = useState(false);
  
	function handleSnackbarClose(event?: React.SyntheticEvent | Event, reason?: string) {
		if (reason === 'clickaway') return;
		setOpenSnack(false);
		setTimeout(() => setErrorMessage(""), 150);
	};

	return (

		<Dialog
			open={open}
			onClose={closeModal}
			aria-labelledby='dialog-title'
		>
			<DialogTitle id="dialog-title">New Game Settings</DialogTitle>
			<DialogContent sx={{
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "center",
			}}>
				<Typography marginBottom={2}>Select paddle color/image and max score</Typography>
				<ToggleButtonGroup
					orientation="horizontal"
					size="small"
					exclusive 
					onChange={(e, newVal) => setBgType(newVal)}
					value={bgType}
				>
					<ToggleButton value={"image"} >Image</ToggleButton>
					<ToggleButton value={"color"} >Color</ToggleButton>
				</ToggleButtonGroup>
				{bgType === "image" ?
					<Box width={1} marginY={2} paddingX={1} display="flex" justifyContent="space-between" alignItems="center">
						<ImageBgList setSelected={(newImage: string) => setSelectedImage(newImage)} selected={selectedImage}/>
						<Box 
						  border="solid 2px white"
						  height="100px"
						  width="30px"
						  sx={{
							  backgroundImage: `url(${`/${selectedImage}_paddle.png`})`,
							  backgroundRepeat: "no-repeat",
							  backgroundSize: "100% 100%"
						  }}
						>
						</Box>
					</Box>
					:
					<Box width={1} marginY={2} display="flex" paddingX={1} justifyContent="space-between" alignItems="center">
						<ChromePicker
						  color={paddleColor}
						  onChange={(color) => setPaddleColor(color.hex)}
						  disableAlpha={true}
						/>
						<Box 
						  border="solid 2px white"
						  height="100px"
						  width="30px"
						  sx={{
							backgroundColor: paddleColor
						  }}
						>
						</Box>
					</Box>
				}
				{isFirstPlayer &&
					<Stack>
						<Typography paddingRight={1} marginBottom={5}>Select max score for the game:</Typography>
						<Slider
						aria-label="Max score"
						value={maxScore}
						onChange={(event, value) => { if (typeof(value) === "number") setMaxScore(value)}}
						valueLabelDisplay="on"
						step={1}
						marks
						min={1}
						max={11}
						/>
					</Stack>
				}
			</DialogContent>
			<DialogActions>
				<Button onClick={closeModal} disabled={openSnack === true}>Cancel</Button>
				<Button
				 	disabled={openSnack === true}
					onClick={async () =>{
						if (isFirstPlayer)
							await CreateNewGame(
								userState.id,
                				scope,
								navigate,
								{ paddleTexType: bgType , paddleTex: bgType === "image"? selectedImage : paddleColor },
								maxScore,
								sendInvite,
								(message) => setErrorMessage(message),
								() => setOpenSnack(true)
							);
						else
							await JoinQueue(
								userState.id,
								navigate,
								{ paddleTexType: bgType , paddleTex: bgType === "image"? selectedImage : paddleColor },
								(message) => setErrorMessage(message), 
								() => setOpenSnack(true)
							);
						setTimeout(() =>  closeModal(), 2000);
					}}
					variant="contained"
				>
					Submit
				</Button>
			</DialogActions>
			<Snackbar
				autoHideDuration={2000}
				open={openSnack}
				onClose={handleSnackbarClose}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'right',
				}}
			>
				<Alert onClose={handleSnackbarClose}  severity={errorMessage.indexOf("Success!") === 0 ? "success" : "error"} sx={{ width: '100%' }}>
					{errorMessage}
				</Alert>
			</Snackbar>
		</Dialog>
	)
}