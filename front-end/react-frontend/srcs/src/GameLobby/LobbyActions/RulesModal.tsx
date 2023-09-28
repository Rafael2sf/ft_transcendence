import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';

export default function RulesModal({open, closeModal}:
  {
  	open: boolean,
  	closeModal: () => void,
  })
{
  return (
	<Dialog
	  open={open}
	  onClose={closeModal}
	  aria-labelledby='dialog-title'
	  sx={{opacity: "0.9"}}
	>
		<DialogTitle id="dialog-title">GAME RULES</DialogTitle>
		<DialogContent>
			<Typography paddingRight={1}>
				Welcome to our version of Pong! The rules to play are fairly simple: <br />
				1. Either create or join a game randomly. If you create a game you will be asked to choose the winnig score.<br />
				2. Choose your color/texture.<br />
				Controls:<br />
				<b>"W"</b> - move paddle up <br />
				<b>"S"</b> - move paddle down <br />
				Have fun!

			</Typography>
		</DialogContent>
		<DialogActions>
			<Button onClick={closeModal}>Got It!</Button>
		</DialogActions>
	</Dialog>
  )
}
