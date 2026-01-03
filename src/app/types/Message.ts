import { Prisma } from "@prisma/client";

export type MessageWithUsers = Prisma.MessageGetPayload<{
  include: {
    sender: {
      select: { id: true; username: true; email: true; createdAt: true };
    };
    receiver: {
      select: { id: true; username: true; email: true; createdAt: true };
    };
  };
}>;
