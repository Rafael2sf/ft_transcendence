import { useContext } from "react";
import  {TextField, Box, Autocomplete, styled, ListItem, ListItemAvatar, Avatar, ListItemText } from "@mui/material";
import SocketContext from "../../Contexts/ChatSocket/Context";
import { IUser } from "../../Entities/ProfileTemplate";


const SearchTextField = styled(TextField, {})({
		
	'& .MuiInputBase-root': { 
		'& fieldset':  {
			border: 0,
		},
	},
})

interface namesInfo {
	name: string,
	intraname: string
}

export function NewMemberForm({name, nameSetter}: 
	{
		name: namesInfo,
		nameSetter: (uname: string, intraname: string) => void
	})
{

	const { SocketState } = useContext(SocketContext);

	const friendList = SocketState.DMs.map((direct) => direct.friend);

	const searchBoxAction = (event: React.SyntheticEvent<Element, Event>, value: IUser | null) => {
		
		if (value) {
			nameSetter(value.name, value.intraname);
		}
		else
		{
			nameSetter("", "");
		}
	};

	return (
		<Box>
			<Box>
				<Autocomplete
				  options={friendList}
				  getOptionLabel={(option) => typeof option === "string" ? option : option.name}
				  isOptionEqualToValue={(option, value) => option.name === value.name}
				  renderOption={(props, option) =>(
					<ListItem {...props} key={option.id} disablePadding>
						<ListItemAvatar>
							<Avatar
							  alt={`Avatar image`}
							  src={option.picture}
							/>
						</ListItemAvatar>
						<ListItemText 
						  primary={option.name}
						/>
					</ListItem>
				  )}
				  renderInput={(params) => (
					<SearchTextField 
					  {...params}
					  InputLabelProps={{ disabled: true}}
					  placeholder={"Search friend..."}
					  hiddenLabel
					  value={name}
					  size='small'
					  sx={{ borderRadius: 1, boxShadow: 4,}}
					/>
				  )}
				  onChange={searchBoxAction}
				></Autocomplete> 
			</Box>
		</Box>
	);
}