import { Box, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { Message } from '../../Entities/ChatTemplates';
import InfoIcon from '@mui/icons-material/Info';

const ChatNotificationCard = ({ message }: { message: Message }) => {
  return (
    <Box
      borderRadius="12px"
      sx={{
        backgroundColor: "#D5D7D9",
        boxShadow: 4,
      }}
      margin={1}
      padding={1}>
      <Stack border='0px' direction='row' justifyContent='space-between' width='100%'>
      <InfoIcon sx={{color: 'black'}}/>
      <Typography
          variant="body2"
          color="black"
          sx={{ wordWrap: "anywhere" }}
        >
          {message.text}
        </Typography>
      </Stack>
      <Box display="flex" justifyContent="flex-end">
        <Typography
          variant="caption"
          color="black"
        >
          {new Date(message.createdAt).toLocaleString()}
        </Typography>
      </Box>
    </Box>
  );
}

export default ChatNotificationCard;