import { Prisma } from "@prisma/client";

export type FriendshipWithUsers = Prisma.FriendshipGetPayload<{
  include: {
    sender: {
      select: {
        id: true;
        username: true;
        email: true;
        createdAt: true;
        onlineStatus: true;
        lastOnline: true;
      };
    };
    receiver: {
      select: {
        id: true;
        username: true;
        email: true;
        createdAt: true;
        onlineStatus: true;
        lastOnline: true;
      };
    };
  };
}>;
