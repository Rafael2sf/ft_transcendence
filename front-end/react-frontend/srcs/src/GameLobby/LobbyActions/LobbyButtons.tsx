import { Box, Button } from '@mui/material'
import { useState } from 'react'
import { NewGameOrJoinModal } from './NewGameOrJoinModal'
import RulesModal from './RulesModal'
import { GameScope } from '../../Entities/GameTemplates';

export default function LobbyButtons() {

	const [newGameOpen, setNewGameOpen] = useState(false);
	const [joinGameOpen, setJoinGameOpen] = useState(false);
	const [openRules, setOpenRules] = useState(false);
	
  return (
	<>
		<Box display="flex" alignItems="center" justifyContent="space-evenly" marginBottom={2}>
			<Button
				variant="contained"
				onClick={() => setNewGameOpen(true)}
				sx={{border: 2, backgroundColor: "#001C30"}}
			>
				Create New Game
			</Button>
			<Button
				variant="contained"
				onClick={() => setJoinGameOpen(true)}
				sx={{border: 2, backgroundColor: "#001C30"}}
			>
				Join Existing Game
			</Button>
			<Button
				variant="contained"
				onClick={() => setOpenRules(true)}
				sx={{border: 2, backgroundColor: "#001C30"}}
			>
				Rules
			</Button>
		</Box>
		{ newGameOpen &&
			<NewGameOrJoinModal
      scope={GameScope.PUBLIC}
			open={newGameOpen}
			closeModal={() => setNewGameOpen(false)}
			isFirstPlayer={true}
			sendInvite={null}
			/>
		}
		{ joinGameOpen &&

			<NewGameOrJoinModal
      scope={GameScope.PUBLIC}
			open={joinGameOpen}
			closeModal={() => setJoinGameOpen(false)}
			isFirstPlayer={false}
			sendInvite={null}
			/>
		}
		{ openRules &&
			<RulesModal
				open={openRules}
				closeModal={() => setOpenRules(false) }
			/>
		}
	</>
  )
}
