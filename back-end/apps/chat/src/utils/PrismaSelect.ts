interface SelectUser {
  id: true;
  name: true;
  intraname: true;
  ladder: true;
  status: true;
  picture: true;
}

interface SelectChannel {
  id: true;
  name: true;
  type: true;
}

interface SelectChannelAndOwner {
  id: true;
  name: true;
  type: true;
  owner: { select: SelectUser };
}

interface IPrismaSelect {
  User: SelectUser;
  Channel: SelectChannel;
  ChannelAndOwner: SelectChannelAndOwner;
}

export const PrismaSelect: IPrismaSelect = {
  User: {
    id: true,
    name: true,
    intraname: true,
    ladder: true,
    status: true,
    picture: true,
  },
  Channel: {
    id: true,
    name: true,
    type: true,
  },
  ChannelAndOwner: {
    id: true,
    name: true,
    type: true,
    owner: {
      select: {
        id: true,
        name: true,
        intraname: true,
        ladder: true,
        status: true,
        picture: true,
      },
    },
  },
};
