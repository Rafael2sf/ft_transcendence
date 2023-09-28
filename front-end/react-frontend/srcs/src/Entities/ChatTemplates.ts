import {IUser} from './ProfileTemplate'


export interface Message {
	id: number;
	channel_id: string;
	sender: IUser;
	text: string;
	createdAt: string;
	game_id?: number;
}



export class ChatObject {
	id: string | number;
	
	constructor(chatId: string | number) {
		this.id = chatId;
	}
} 


export type RoleType = "USER" | "ADMIN" | "OWNER";


interface IChannel {
	id: string;
	owner: IUser;
	name: string;
	type: 'PUBLIC' | 'PRIVATE' | 'PROTECTED';
	user_role: RoleType;
}

export class Channel extends ChatObject {
	owner: IUser;
	name: string;
	type: 'PUBLIC' | 'PRIVATE' | 'PROTECTED';
	user_role: RoleType;
	
	constructor(chan: IChannel) {
		super(chan.id);
		this.owner = chan.owner;
		this.name = chan.name;
		this.type = chan.type;
		this.user_role = chan.user_role;
	}
}


//Same as UserRole
export interface IChatMember {
	user: IUser;
	role: RoleType;
	muted: number | undefined;
}

interface IMembers extends IChannel {
	users: IChatMember[];
	members: number;
}

export class ChanWithMembers extends Channel {
	
	users: IChatMember[];
	members: number;

	constructor(n: IMembers) {
		super(n);
		this.users = n.users;
		this.members = n.members;
	}
}


interface IDM {
	id: number;
	friend: IUser;
}

export class DM extends ChatObject {
	friend: IUser;

	constructor(newDM: IDM) {
		super(newDM.id);
		this.friend = newDM.friend;
	}
}


interface IAnchorOrigin {
	vertical: number | "center" | "top" | "bottom";
	horizontal: number | "center" | "right" | "left";
}

interface ITransformOrigin {
	vertical: number | "center" | "top" | "bottom";
	horizontal: number | "center" | "right" | "left";
}

export interface ICardPosition{
	anchor: IAnchorOrigin;
	transform: ITransformOrigin;
}