import { Avatar, Box, Grid, Tooltip, Typography } from '@mui/material';
import { IGameResults } from '../../Entities/GameTemplates';
import { useNavigate } from 'react-router-dom';
import { IUser } from '../../Entities/ProfileTemplate';

export function GameHistoryCard({gameResults, profileOwner} : {gameResults: IGameResults, profileOwner: IUser}) {
	const navigate = useNavigate();

	const playerWon = (gameResults.games_users[0].won && gameResults.games_users[0].user.id === profileOwner.id) ||
                    (gameResults.games_users[1].won && gameResults.games_users[1].user.id === profileOwner.id);

	return (
    <Grid
      item
      xs={12}
      md={5.8}
      sx={{
        display: 'flex',
		boxShadow: 1,
        borderRadius: 2,
        border: playerWon ? "solid 2px green" : "solid 2px red",
        bgcolor: 'background.paper',
		justifyContent: "space-between",
		alignItems: "center",
		paddingX: 2
      }}
    >
		<Tooltip
			title={<Typography variant='caption'>{gameResults.games_users[0].user.name}</Typography>}
			placement="top-end"
			arrow
			enterDelay={100}
			leaveDelay={200}
			sx={{fontSize: 24}}
		>
			<Avatar
				src={gameResults.games_users[0].user.picture}
				sx={{ width: '48px', height: '48px', cursor: "pointer" }}
				onClick={() => navigate(`/profile/${gameResults.games_users[0].user.intraname}`)}
			></Avatar>
		</Tooltip>
		<Box display="flex" width="200px" flexDirection="column" alignItems="center">
			<Typography variant='caption' position="relative">{new Date(gameResults.ended_at).toLocaleString()}</Typography>
			<Typography margin={2} marginTop={0} >
				{gameResults.games_users[0].score === -1 ? "Disc." : gameResults.games_users[0].score}
				{" - "}
				{gameResults.games_users[1].score === -1 ? "Disc." : gameResults.games_users[1].score}

			</Typography>
		</Box>
		<Tooltip
			title={<Typography variant='caption'>{gameResults.games_users[1].user.name}</Typography>}
			placement="top-start"
			arrow
			enterDelay={100}
			leaveDelay={200}
		>
			<Avatar
				src={gameResults.games_users[1].user.picture}
				sx={{ width: '48px', height: '48px', cursor: "pointer"}}
				onClick={() => navigate(`/profile/${gameResults.games_users[1].user.intraname}`)}

			></Avatar>
		</Tooltip>
    </Grid>
  );
}
