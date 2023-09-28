import { Button, ButtonGroup, Card, CardContent, CardMedia, Popover, styled, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BlockModal } from "./BlockModal";
import { ICardPosition } from "../../Entities/ChatTemplates";
import { IUser } from "../../Entities/ProfileTemplate";

const StyledCardContent= styled(CardContent) ({
	'&:last-child': {
		paddingBottom: 0
	 }
});

interface ICardAnchor {
	anchorEl: null | HTMLElement;
	openPopoverId: null | number;
	userClicked: IUser | null ;
}


export function ChatMemberCard({cardAnchor, memberCardClose, cardPosition}: {cardAnchor: ICardAnchor, memberCardClose: () => void, cardPosition: ICardPosition}) {

	const [openBlockModal, setOpenBlockModal] = useState(false);
	const navigate = useNavigate();
	

	return (
		<div>			
			{cardAnchor.userClicked && <BlockModal open={openBlockModal} closeModal={() => setOpenBlockModal(false)} userToBlock={cardAnchor.userClicked}></BlockModal>}
			<Popover
				open={cardAnchor.openPopoverId !== null}
				anchorEl={cardAnchor.anchorEl}
				anchorOrigin={cardPosition.anchor}
				transformOrigin={cardPosition.transform}
				onClose={memberCardClose}
			>
				<Card sx={{display: "flex"}}>
					<CardMedia
						component="img"
						sx={{ width: 75 }}
						image={cardAnchor.userClicked?.picture}
						alt="Avatar test"
					/>
					<StyledCardContent sx={{display: "flex", flexDirection: "column", padding: 0}}>
						<ButtonGroup
							variant="text"
							orientation='vertical'
							size="medium"
							aria-label='info for accessibility'
							sx={{
								flexGrow: 1
							}}
							>
							<Button
								color='primary'
								onClick={() => navigate(`/profile/${cardAnchor.userClicked?.intraname}`)}
							>Visit Profile</Button>
							<Button
								color="error"
								onClick={() => setOpenBlockModal(true)}
							>block</Button>
						</ButtonGroup>
					</StyledCardContent>
				</Card>
		</Popover>
		</div>
	)
}