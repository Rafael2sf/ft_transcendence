import React, { createContext, useContext } from 'react';
import { Socket } from 'socket.io-client';
import {
  DM,
  Channel,
  ChanWithMembers,
  IChatMember,
} from '../../Entities/ChatTemplates';
import { Message } from '../../Entities/ChatTemplates';
import { ChannelAction, ChannelActionWithEvent, ChannelEvent, ChannelEventWithID, UpdateFriendRoom } from './SocketContextComponent';
import { IUser } from '../../Entities/ProfileTemplate';
import { IExtendedUser } from '../UserContext';

const bot_data: IExtendedUser = {
  id: 1,
  status: "ONLINE",
  ladder: 0,
  name: "marvin",
  intraname: "marvin",
  picture: "/marvin.jpg",
  requestFinished: true,
  is_two_factor_enabled: false
};

/* Generates a channel message object with hardcoded data for server user
 to display a notification card */
const notification = (channel_id: string, text: string): Message => {
  return {
    id: 0,
    channel_id,
    text,
    sender: bot_data,
    createdAt: new Date(Date.now()).toLocaleString()
  }
}

export interface ISocketContextState {
  socket: Socket | undefined;
  message: Message | null;
  channels: Channel[];
  openedChatRoom: DM | ChanWithMembers | null;
  DMs: DM[];
  blockedUsers: IUser[];
}

export const defaultSocketContextState: ISocketContextState = {
  socket: undefined,
  message: null,
  channels: [],
  openedChatRoom: null,
  DMs: [],
  blockedUsers: [],
};

export type TSocketContextActions =
  | 'update_socket'
  | 'message_received'
  | 'add_channel'
  | 'remove_channel'
  | 'add_friendroom'
  | 'update_friendroom'
  | 'unfriend'
  | 'update_blocked'
  | 'block_user'
  | 'update_opened_chatroom'
  | 'update_room_member'
  | 'update_members_list'
  | 'update_channel'
  | 'ban_update'
  | 'update_current_games';

export type TSocketContextPayload =
  | string
  | string[]
  | Socket
  | Message
  | Channel
  | DM
  | IUser
  | IUser[]
  | IChatMember
  | ChanWithMembers
  | null
  | ChannelEvent
  | ChannelEventWithID
  | UpdateFriendRoom
  | ChannelAction
  | ChannelActionWithEvent

export interface ISocketContextActions {
  type: TSocketContextActions;
  payload: TSocketContextPayload;
}

export const SocketReducer = (
  state: ISocketContextState,
  action: ISocketContextActions
) => {

  switch (action.type) {
    case 'update_socket':
      return { ...state, socket: action.payload as Socket };
    case 'message_received':
      if (state.blockedUsers.find((blocked_user) => blocked_user.id === (action.payload as Message).sender.id))
        return state;
        return { ...state, message: action.payload as Message };
        case 'add_channel': {
      (action.payload as Channel).user_role
        ? state.channels.push({ ...(action.payload as Channel) })
        : state.channels.push({
            ...(action.payload as Channel),
            user_role: 'OWNER',
          });
      return { ...state };
    }
    case 'update_channel': {
      const checkOpenedChatRoom = state.openedChatRoom;

      if ((action.payload as Channel).id === state.openedChatRoom?.id) {
        (checkOpenedChatRoom as Channel).type = (
          action.payload as Channel
        ).type;
        (checkOpenedChatRoom as Channel).name = (
          action.payload as Channel
        ).name;
      }
      return {
        ...state,
        message: notification((action.payload as Channel).id as string, `Channel setting updated`),
        channels: state.channels.map((chan) => {
          if (chan.id === (action.payload as Channel).id)
            // On channel update user_role is not sent in the returned object
            return {
              ...(action.payload as Channel),
              user_role: chan.user_role,
            };
          else return chan;
        }),
        openedChatRoom: checkOpenedChatRoom,
      };
    }

    case 'remove_channel':
      return {
        ...state,
        openedChatRoom: (state.openedChatRoom?.id !== action.payload as string) ? state.openedChatRoom : null,
        channels: state.channels.filter(
          (channel) => channel.id !== (action.payload as string)
        ),
      };
    case 'add_friendroom':
      state.DMs.push(action.payload as DM);
      return { ...state };
    case 'update_friendroom':
      const data = action.payload as UpdateFriendRoom;
      return { ...state, Dms: state.DMs.map((room) => {
        if (room.friend.intraname === data.intraname) {
          room.friend.status = data.status;
        }
        return room;
      })};
    case 'unfriend':
      return {
        ...state,
        DMs: state.DMs.filter(
          (DM) => DM.friend.intraname !== (action.payload as string)
        ),
        openedChatRoom: null,
      };
    case 'update_blocked':
      return { ...state, blockedUsers: action.payload as IUser[] };
    case 'block_user':
      state.blockedUsers.push(action.payload as IUser);
      return {
        ...state,
        blockedUsers: state.blockedUsers.map((user) => user),
        DMs: state.DMs.filter(
          (DM) => DM.friend.intraname !== (action.payload as IUser).intraname
        ),
      };
    case 'update_opened_chatroom': {
      return {
        ...state,
        openedChatRoom: action.payload as DM | ChanWithMembers | null,
      };
    }
    case 'update_room_member': {
      const tmp: ChanWithMembers = state?.openedChatRoom as ChanWithMembers;
      if (!tmp || tmp instanceof DM)
        return state;
      const targetMember = action.payload as ChannelEventWithID;
      const index = tmp?.users.findIndex(
        (element) => element.user.id === targetMember.user.user.id
      );

      // handle user promotion to owner
      if (targetMember.user.role === 'OWNER' && tmp.owner.id !== targetMember.user.user.id) {
        const old_owner: IUser = (state?.openedChatRoom as ChanWithMembers).owner;
        tmp.owner = targetMember.user.user;
        tmp.users = tmp.users.filter((member) => (
          member.user.id !== targetMember.user.user.id
        ));
        tmp.users.push({ user: old_owner, role: 'USER', muted: undefined });
        if (targetMember.my_id === targetMember.user.user.id) {
          const channel = state.channels.find((chan) => chan.id === targetMember.channel_id);
          if (channel) {
            channel.owner = targetMember.user.user;
            channel.user_role = 'OWNER';
            if (state.openedChatRoom?.id === channel.id)
              (state.openedChatRoom as ChanWithMembers).user_role = 'OWNER'
          }
        }
        return {
          ...state,
          message: notification(targetMember.channel_id,
            `${targetMember.user.user.name} @${targetMember.user.user.intraname} \
            role has been changed to OWNER`),
        }
      }
      else if (targetMember.channel_id === tmp?.id) {
        if (index != -1) {
          const old_role = tmp.users[index].role;
          tmp.users[index] = targetMember.user;
          return {
            ...state,
            message: targetMember.user.role === old_role
              ? state.message
              : notification(targetMember.channel_id,
                `${targetMember.user.user.name} @${targetMember.user.user.intraname} \
                role has been changed to ${targetMember.user.role}`),
          };
        } else if (tmp.owner.id === targetMember.user.user.id) {
          // update owner state ( online / offline )
          tmp.owner = targetMember.user.user;
          return { ...state, openedChatRoom: tmp };
        } else if (tmp.owner.id === targetMember.user.user.id) {
          tmp.owner = targetMember.user.user;
          return { ...state, openedChatRoom: tmp };
        }
      }
      return state;
    }
    case 'update_members_list': {
      const tmp: ChanWithMembers = state.openedChatRoom as ChanWithMembers;
      const targetMember = action.payload as ChannelEventWithID;
      const event = (action.payload as ChannelEventWithID & { event: string } ).event;
      let channelsState = state.channels;

      // user.join should never target self
      // remove channel from channel list
      if (targetMember.user.user.id === targetMember.my_id) {
        channelsState = state.channels.filter(
          (channel) => channel.id !== targetMember.channel_id
        );
        state.openedChatRoom = null;
      }
      // otherwise add/remove member from members
      else if (tmp && tmp.users && targetMember.channel_id === tmp?.id) {
        const index = tmp.users.findIndex(
          (element) => element.user.id === targetMember.user.user.id
        );

        if (index === -1) {
          tmp.users.push(targetMember.user);
          tmp.members++;
          return {
            ...state,
            message: notification(
              targetMember.channel_id,
              `${targetMember.user.user.name} @${targetMember.user.user.intraname} joined`
            ),
            openedChatRoom: tmp 
          };
        } else {
          tmp.users.splice(index, 1);
          tmp.members--;
          return {
            ...state,
            message: notification(
              targetMember.channel_id,
              event
              ? `${targetMember.user.user.name} @${targetMember.user.user.intraname} has been ${event}`
              : `${targetMember.user.user.name} @${targetMember.user.user.intraname} left`
            ),
            openedChatRoom: tmp 
          };
        }
      }
      return { ...state, channels: channelsState };
    }
    default:
      return { ...state };
  }
};

export interface ISocketContextProps {
  SocketState: ISocketContextState;
  SocketDispatch: React.Dispatch<ISocketContextActions>;
}

const SocketContext = createContext<ISocketContextProps>({
  SocketState: defaultSocketContextState,
  SocketDispatch: () => {},
});

export const SocketContextProvider = SocketContext.Provider;

export default SocketContext;
