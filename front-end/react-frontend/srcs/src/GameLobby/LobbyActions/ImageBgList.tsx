import { Box, List, ListItem, ListItemButton } from '@mui/material'
import React from 'react'
import { Textures } from '../../Constants/Textures'

export default function ImageBgList({setSelected, selected}: { setSelected: (newImage: string) => void, selected: string}) {
  
	const imgBgList = Textures.map((tex) => (
		<ListItemButton key={tex} onClick={() => setSelected(tex)} selected={selected === tex}>
			{tex}
		</ListItemButton>
	))
	
	return (
		<Box border="solid 2px white" >
			<List
			sx={{
				bgcolor: 'background.paper',
				overflow: 'auto',
				maxHeight: 80,
				margin: 0,
				padding: 0,
				position: "relative",
			}}>
				{imgBgList}
			</List>
		</Box>
  )
}
