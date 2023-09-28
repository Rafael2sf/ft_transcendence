import { Box, Card, CardContent, CardMedia, Grid, Typography } from '@mui/material';
import React from 'react'
import { IAchievement } from '../../Entities/ProfileTemplate';
import WindowDims from '../../Entities/WindowDims';
import useWindowDimensions from '../../Hooks/useWindowDimensions';

export default function AchievementCard({achievement, gotIt}: { achievement: IAchievement, gotIt: boolean}) {
	const windowSize: WindowDims = useWindowDimensions();

  return (
	<Grid
	  item
	  xs={12}
      md={5.8}
	  sx={{
	  boxShadow: 1,
	  borderRadius: 5,
	  marginX: 0.5,
	  }}
	>
		<Card
		  sx={{
			backgroundColor: gotIt ? "#C4AE7B" : "grey",
		    borderRadius: 5,
		    border: 2,
		    display: "flex",
		    height: windowSize.width < 900 ? "100%" : windowSize.width < 1200 ? "220px" : "150px",
			
		}}
		>
			<CardMedia
				component="img"
				sx={{ width: 100, filter: gotIt ? "" : "grayscale(100%)", objectFit: "contain", marginLeft: 1}}
				image={`/achievements/${achievement.image}.png`}
				alt="Avatar"
			/>
			<CardContent sx={{display: "flex", flexDirection: "column", marginX: 2, padding: 0}}>
	  			<Typography variant='body1'>{achievement.title}</Typography>
	  			<Typography variant='body2'>{achievement.description}</Typography>
			</CardContent>
		</Card>
	</Grid>
  )
}
