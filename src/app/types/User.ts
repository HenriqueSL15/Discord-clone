import { OnlineStatus } from "@prisma/client";

export default interface UserInterface {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
  lastOnline: Date;
  onlineStatus: OnlineStatus;
  profilePicture: string;
}
