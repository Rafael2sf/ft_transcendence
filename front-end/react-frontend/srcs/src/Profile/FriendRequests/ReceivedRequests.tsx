import { Box, Grid, Pagination } from '@mui/material'
import { useEffect, useState } from 'react'
import WindowDims from '../../Entities/WindowDims'
import { IUser } from '../../Entities/ProfileTemplate';
import RequestCard from './RequestCard';

export default function ReceivedRequests({ windowSize, receivedRequests, updateReceived} :
  {
	windowSize: WindowDims,
	receivedRequests: IUser[],
	updateReceived: (inviteId: number) => void
  }) {
  
	const [page, setPage] = useState<number>(1);
	const [requestCardList, setRequestCardList] = useState<JSX.Element[]>([]);

	
	useEffect(() => {
		if (receivedRequests.length !== 0)
		{
      const newList = receivedRequests.slice((page - 1) * 7, page * 7).map( (target, index) => (
				<RequestCard key={index} requestTarget={target} type={"received"} requestUpdater={updateReceived}/>
				))
			setRequestCardList(newList);
			if (page > 0 && newList.length === 0)
				setPage((oldVal) => oldVal - 1);
		} else {
      setRequestCardList([]);
    }
	}, [page, receivedRequests]);
	
	return (
		<>
			<Box display="flex" flexDirection="column" alignItems="center" height="100%" width="100%" >
				<Grid container rowGap={1}  paddingY={1} sx={{width: '100%', maxHeight: windowSize.width >= 900 ? "65vh" : "270px", overflowY: "auto"}} >
					{requestCardList}
				</Grid>
			</Box>
			<Pagination
			sx={{ m: 1, display: "flex", justifyContent: "center" }}
			count={Math.ceil(receivedRequests.length / 7)}
			variant='outlined'
			color='primary'
			onChange={(e, value) => setPage(value)}
			/>
		</>
	)
}
