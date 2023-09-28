import {
	Alert,
  Box,
  Button,
  Fab,
  Snackbar,
} from "@mui/material";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { ICardPosition, Message } from "../../Entities/ChatTemplates";
import { ChatMemberCard } from "./ChatMemberCard";
import { ChatMessageCard } from "./ChatMessageCard";
import { ISocketContextState } from "../../Contexts/ChatSocket/Context";
import { getOlderMessages } from "./GetOlderMessages";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import HistoryIcon from '@mui/icons-material/History';
import { MESSAGES_ON_OPEN, MESSAGE_REQUEST_OFFSET } from "./constants";
import { IUser } from "../../Entities/ProfileTemplate";
import { useNavigate } from "react-router-dom";
import { RestaurantMenu } from "@mui/icons-material";
import ChatNotificationCard from "./ChatNotificationCard";

interface IRequestParams {
  limit: number;
  offset: number;
}

export function ChatHistory({
  convo,
  setConvo,
  limitOffset,
  socketState,
}: {
  convo: Message[];
  setConvo:React.Dispatch<React.SetStateAction<Message[]>>
  limitOffset: MutableRefObject<IRequestParams>;
  socketState: ISocketContextState;
}) {
  const [displayNewMessageIcon, setDisplayNewMessageIcon] = useState(false);
  const [displayLoadMessageIcon, setDisplayLoadMessageIcon] = useState(false);
  const messageLoading = useRef<boolean>(false);
  const prevScrollHeight = useRef<number>(-1);
  const chatScroll = useRef<HTMLElement>(null);
  const firstMessageRef = useRef<Message | null>(convo.length ? convo[0] : null);
  const messagePreviousLenght = useRef(convo.length - 1);
  const [cardAnchor, setCardAnchor] = useState<{
    anchorEl: null | HTMLElement;
    openPopoverId: null | number;
    userClicked: IUser | null;
  }>({
    anchorEl: null,
    openPopoverId: null,
    userClicked: null,
  });
  const cardPosition: ICardPosition = {
    anchor: {
      vertical: "center",
      horizontal: "right",
    },
    transform: {
      vertical: "bottom",
      horizontal: "left",
    },
  };
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [openSnack, setOpenSnack] = useState(false);

  function handleSnackbarClose(event?: React.SyntheticEvent | Event, reason?: string) {
	  if (reason === 'clickaway') return;
	  setOpenSnack(false);
	  setTimeout(() => setErrorMessage(""), 150);
  };

  function memberNameClick(
    event: React.MouseEvent<HTMLElement>,
    id: number,
    sender: IUser
  ) {
    setCardAnchor({
      anchorEl: event.currentTarget,
      openPopoverId: id,
      userClicked: sender,
    });
  }

  const handleScroll = () => {
    if (chatScroll.current) {
      const position = chatScroll.current.scrollTop;
      const height =
      chatScroll.current.scrollHeight - chatScroll.current.clientHeight;
      if (messagePreviousLenght.current != -1 && messageLoading.current != true
        && position < MESSAGE_REQUEST_OFFSET && displayLoadMessageIcon === false) {
        messageLoading.current = true;
        getOlderMessages(
          limitOffset.current.limit,
          limitOffset.current.offset,
          (newMessages: Message[]) =>
            setConvo((oldVal: Message[]) => [...oldVal, ...newMessages]),
          socketState,
          navigate,
		  (newMessage: string) => setErrorMessage(newMessage),
		  () => setOpenSnack(true)
        );
      // remove new message icon when scrolling down
      } else if (position > height - 42) {
        setDisplayNewMessageIcon(false);
      }
    }
  };

  function memberCardClose() {
    setCardAnchor({ anchorEl: null, openPopoverId: null, userClicked: null });
  }

  useEffect(() => {
    if (convo.length && chatScroll.current) {
      const position = chatScroll.current.scrollTop;
      const height =
        chatScroll.current.scrollHeight - chatScroll.current.clientHeight;
      if (firstMessageRef.current?.id === convo[0].id && firstMessageRef.current?.id != 0) {
        if (prevScrollHeight?.current > 0) {
          chatScroll.current.scroll({
            top: height - prevScrollHeight.current,
            behavior: "smooth",
          });
        }
        if (messagePreviousLenght.current === convo.length || convo.length < MESSAGES_ON_OPEN) {
          messagePreviousLenght.current = -1;
          setDisplayLoadMessageIcon(false);
        } else {
          limitOffset.current.offset = convo.length;
          messagePreviousLenght.current = convo.length;
          setDisplayLoadMessageIcon(true);
        }
        messageLoading.current = false;
        // New message received
      } else {
        if (
          position >
          prevScrollHeight.current - chatScroll.current.clientHeight / 2
        ) {
          chatScroll.current.scroll({ top: height, behavior: "smooth" });
        } else { setDisplayNewMessageIcon(true); }
      }
      prevScrollHeight.current = height;
    }
    if (chatScroll.current?.scrollHeight !== chatScroll.current?.clientHeight)
      setDisplayLoadMessageIcon(false);
    firstMessageRef.current = convo.length ? convo[0] : null;
    // messagePreviousLenght.current = convo.length;
  }, [convo]);

  useEffect(() => {
    if (chatScroll.current) {
      chatScroll.current.scroll({ top: chatScroll.current.scrollHeight });
      chatScroll.current?.addEventListener("scroll", handleScroll, {
        passive: true,
      });
    }

    return () => {
      chatScroll.current?.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
        {chatScroll.current?.scrollHeight ===
          chatScroll.current?.clientHeight &&
          convo.length >= MESSAGES_ON_OPEN &&
          displayLoadMessageIcon && (
          <Button
            onClick={(e) => {
              e.preventDefault();
              messageLoading.current = true;
              getOlderMessages(
                limitOffset.current.limit,
                limitOffset.current.offset,
                (newMessages: Message[]) =>
                  setConvo((oldVal: Message[]) => [...oldVal, ...newMessages]),
                socketState,
                navigate,
				(newMessage: string) => setErrorMessage(newMessage),
				() => setOpenSnack(true)
              );
            }}
          >
            <HistoryIcon />
          </Button>
        )}
      <Box ref={chatScroll} sx={{ flexGrow: 1, overflowY: "auto" }}>
        {convo
          .slice(0)
          .reverse()
          .map((m, i) => {
            return m.sender.id !== 1
            ? <ChatMessageCard
              key={i}
              message={m}
              memberNameClick={memberNameClick}
            />
            : <ChatNotificationCard
              key={i}
              message={m}
              />
          })}
      </Box>
      <ChatMemberCard
        cardAnchor={cardAnchor}
        memberCardClose={memberCardClose}
        cardPosition={cardPosition}
      />
      {displayNewMessageIcon && (
        <Fab
          variant="extended"
          size="medium"
          color="primary"
          aria-label="New Message"
          onClick={(e) => {
            e.preventDefault();
            chatScroll.current?.scroll({
              top:
                chatScroll.current.scrollHeight -
                chatScroll.current.clientHeight,
              behavior: "smooth",
            });
            setDisplayNewMessageIcon(false);
          }}
          sx={{
            zIndex: 1,
          }}
        >
          <KeyboardArrowDownIcon sx={{ mr: 1 }} />
          New Message
        </Fab>
      )}
	  	<Snackbar
		  autoHideDuration={2000}
		  open={openSnack}
		  onClose={handleSnackbarClose}
		  anchorOrigin={{
			vertical: 'bottom',
			horizontal: 'right',
		  }}
	    >
		<Alert onClose={handleSnackbarClose} severity={errorMessage.indexOf("You have successfully") === 0 ? "success" : "error"} sx={{ width: '100%' }}>
			{errorMessage}
        </Alert>
	  </Snackbar>
    </>
  );
}
