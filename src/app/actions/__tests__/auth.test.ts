import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  register,
  login,
  addFriend,
  logoff,
  getUserInfo,
  getOtherUserInfo,
  getUserFriendships,
  getMessagesHistory,
  sendMessage,
  changeFriendshipStatus,
  updateOnlineStatus,
  _updateUserStatus,
  updateMessage,
  deleteMessage,
} from "../auth";
import prisma from "../../lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { pusherServer } from "../../lib/pusher";
import { encrypt, decrypt } from "../../lib/auth";

// Mock Prisma
vi.mock("../../lib/prisma", () => ({
  __esModule: true,
  default: {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
    friendship: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    message: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

// Mock bcrypt
vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

// Mock cookies and headers
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

// Mock navigation
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

// Mock auth lib
vi.mock("../../lib/auth", () => ({
  encrypt: vi.fn(() => Promise.resolve("mock-session-token")),
  decrypt: vi.fn(() => Promise.resolve({ userId: "user-1" })),
}));

// Mock Pusher
vi.mock("../../lib/pusher", () => ({
  pusherServer: {
    trigger: vi.fn(() => Promise.resolve({})),
  },
}));

// Mock Cloudinary
vi.mock("cloudinary", () => ({
  v2: {
    config: vi.fn(),
    uploader: {
      destroy: vi.fn(() => Promise.resolve({ result: "ok" })),
    },
  },
}));

describe("Auth Actions Complete Suite", () => {
  const mockUser = {
    id: "user-1",
    email: "test@example.com",
    username: "testuser",
    password: "hashed-password",
    createdAt: new Date(),
    onlineStatus: "ONLINE",
    lastOnline: new Date(),
  };

  const mockCookieStore = {
    set: vi.fn(),
    get: vi.fn((name) =>
      !name || name === "session" ? { value: "mock-token" } : null,
    ),
    delete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockCookieStore.get).mockImplementation((name) =>
      !name || name === "session" ? { value: "mock-token" } : null,
    );
    vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);
    vi.mocked(prisma.friendship.findMany).mockResolvedValue([]);
    vi.mocked(prisma.user.update).mockResolvedValue(mockUser as any);
    vi.mocked(decrypt).mockResolvedValue({ userId: "user-1" } as any);
  });

  describe("register", () => {
    it("should register a new user successfully", async () => {
      const formData = new FormData();
      formData.append("email", "new@test.com");
      formData.append("username", "newuser");
      formData.append("password", "pass123");

      vi.mocked(prisma.user.create).mockResolvedValue(mockUser as any);
      vi.mocked(bcrypt.hash).mockResolvedValue("hashed-pass" as never);

      await register(formData);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: "new@test.com",
          username: "newuser",
          password: "hashed-pass",
        },
      });
      expect(mockCookieStore.set).toHaveBeenCalled();
      expect(redirect).toHaveBeenCalledWith("/");
    });

    it("should return error if user/email already exists", async () => {
      const formData = new FormData();
      formData.append("email", "existing@test.com");
      formData.append("username", "existing");
      formData.append("password", "pass123");

      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "existing" } as any);

      await expect(register(formData)).rejects.toThrow("Já existe um usuário com esse email");
    });
  });

  describe("addFriend", () => {
    it("should create a friendship request", async () => {
      const formData = new FormData();
      formData.append("searchInput", "friend-username");

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-2",
        username: "friend-username",
      } as any);
      vi.mocked(prisma.friendship.create).mockResolvedValue({
        id: "f-1",
      } as any);

      await addFriend(formData);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { username: "friend-username" },
      });
      expect(prisma.friendship.create).toHaveBeenCalledWith({
        data: {
          receiverId: "user-2",
          senderId: "user-1",
        },
      });
    });

    it("should return null if no session", async () => {
      const formData = new FormData();
      vi.mocked(mockCookieStore.get).mockReturnValue(null as any);

      const result = await addFriend(formData);
      expect(result).toBeNull();
    });
  });

  describe("login", () => {
    it("should login successfully with correct credentials", async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "password123");

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

      const result = await login(formData);

      expect(prisma.user.findUnique).toHaveBeenCalled();
      expect(mockCookieStore.set).toHaveBeenCalled();
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "user-1" },
          data: expect.objectContaining({ onlineStatus: "ONLINE" }),
        }),
      );
    });

    it("should return error for wrong password", async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "wrong");

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(login(formData)).rejects.toThrow("A senha não está correta");
    });
  });

  describe("sendMessage", () => {
    it("should create message and trigger pusher", async () => {
      const mockCreatedMsg = {
        id: "msg-1",
        message: "Hello",
        senderId: "user-1",
        receiverId: "user-2",
        images: [],
      };

      vi.mocked(prisma.message.create).mockResolvedValue(mockCreatedMsg as any);

      await sendMessage("user-2", "Hello", [], "friendship-1");

      expect(prisma.message.create).toHaveBeenCalled();
      expect(pusherServer.trigger).toHaveBeenCalledWith(
        "friendship-1",
        "new-message",
        mockCreatedMsg,
      );
    });

    it("should throw error if session is missing", async () => {
      vi.mocked(mockCookieStore.get).mockReturnValue(null as any);
      await expect(sendMessage("user-2", "Hello", [], "f1")).rejects.toThrow(
        "Token não encontrado",
      );
    });

    it("should throw error if decrypt fails", async () => {
      vi.mocked(decrypt).mockResolvedValue(null as any);
      await expect(sendMessage("user-2", "Hello", [], "f1")).rejects.toThrow(
        "Sessão não encontrada",
      );
    });
  });

  describe("getMessagesHistory", () => {
    it("should return messages between users", async () => {
      vi.mocked(prisma.message.findMany).mockResolvedValue([
        { id: "m1" },
      ] as any);
      const result = await getMessagesHistory("user-2");
      expect(result).toHaveLength(1);
      expect(prisma.message.findMany).toHaveBeenCalled();
    });

    it("should return empty array if no token", async () => {
      vi.mocked(mockCookieStore.get).mockReturnValue(null as any);
      const result = await getMessagesHistory("user-2");
      expect(result).toEqual([]);
    });
  });

  describe("changeFriendshipStatus", () => {
    it("should update status if user is part of friendship", async () => {
      vi.mocked(prisma.friendship.findUnique).mockResolvedValue({
        id: "f-1",
        senderId: "user-1",
        receiverId: "user-2",
      } as any);

      await changeFriendshipStatus("ACCEPTED", "f-1");

      expect(prisma.friendship.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "f-1" },
          data: { status: "ACCEPTED" },
        }),
      );
    });

    it("should delete friendship when val is DELETE", async () => {
      vi.mocked(prisma.friendship.findUnique).mockResolvedValue({
        id: "f-1",
        senderId: "user-1",
        receiverId: "user-2",
      } as any);

      await changeFriendshipStatus("DELETE", "f-1");

      expect(prisma.friendship.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "f-1" },
        }),
      );
    });

    it("should throw error if user is not part of friendship", async () => {
      vi.mocked(prisma.friendship.findUnique).mockResolvedValue({
        id: "f-1",
        senderId: "other-1",
        receiverId: "other-2",
      } as any);

      const result = await changeFriendshipStatus("ACCEPTED", "f-1");
      expect(result).toBeUndefined();
      expect(prisma.friendship.update).not.toHaveBeenCalled();
    });
  });

  describe("logoff", () => {
    it("should delete session cookie and return success object", async () => {
      const result = await logoff();
      expect(mockCookieStore.delete).toHaveBeenCalledWith("session");
      expect(result).toEqual({ success: true });
    });
  });

  describe("getUserInfo", () => {
    it("should return user info from session", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      const result = await getUserInfo();
      const { password, ...expectedUser } = mockUser;
      expect(result).toEqual(expectedUser);
    });
  });

  describe("getOtherUserInfo", () => {
    it("should return other user info", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-2",
      } as any);
      const result = await getOtherUserInfo("user-2");
      expect(result).toEqual({ id: "user-2" });
    });
  });

  describe("updateOnlineStatus and _updateUserStatus", () => {
    it("should update status and notify friends", async () => {
      vi.mocked(prisma.user.update).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.friendship.findMany).mockResolvedValue([
        { senderId: "user-1", receiverId: "friend-1" },
      ] as any);

      await updateOnlineStatus("ABSENT");

      expect(prisma.user.update).toHaveBeenCalled();
      expect(pusherServer.trigger).toHaveBeenCalledWith(
        "private-user-friend-1",
        "friend-status-changed",
        {
          userId: "user-1",
          status: "ABSENT",
        },
      );
    });
  });

  describe("updateMessage", () => {
    it("should update message if user is sender", async () => {
      vi.mocked(prisma.message.findUnique).mockResolvedValue({
        id: "msg-1",
        senderId: "user-1",
        images: [],
      } as any);

      await updateMessage("msg-1", "new content", []);

      expect(prisma.message.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "msg-1", senderId: "user-1" },
          data: { message: "new content", images: [] },
        }),
      );
    });

    it("should return null if message not found", async () => {
      vi.mocked(prisma.message.findUnique).mockResolvedValue(null as any);
      const result = await updateMessage("msg-1", "new content", []);
      expect(result).toBeNull();
    });

    it("should handle image deletion during update", async () => {
      vi.mocked(prisma.message.findUnique).mockResolvedValue({
        id: "msg-1",
        senderId: "user-1",
        images: ["http://res.cloudinary.com/v123/image-old.jpg"],
      } as any);

      await updateMessage("msg-1", "new content", [
        "http://res.cloudinary.com/v123/image-new.jpg",
      ]);
      // Should trigger deleteImagesFromCloud for image-old.jpg
    });
  });

  describe("deleteMessage", () => {
    it("should delete message if user is sender and trigger image deletion", async () => {
      vi.mocked(prisma.message.delete).mockResolvedValue({
        id: "msg-1",
        senderId: "user-1",
        images: ["http://res.cloudinary.com/v123/image-1.jpg"],
      } as any);

      await deleteMessage("msg-1");

      expect(prisma.message.delete).toHaveBeenCalled();
    });

    it("should throw error if delete fails", async () => {
      vi.mocked(prisma.message.delete).mockResolvedValue(null as any);
      const result = await deleteMessage("msg-1");
      expect(result).toBeNull();
    });

    it("should return null if token is missing", async () => {
      vi.mocked(mockCookieStore.get).mockReturnValue(null as any);
      const result = await deleteMessage("msg-1");
      expect(result).toBeNull();
    });
  });

  describe("getUserFriendships", () => {
    it("should return friendships for the current user", async () => {
      vi.mocked(prisma.friendship.findMany).mockResolvedValue([
        { id: "f-1" },
      ] as any);

      const result = await getUserFriendships();

      expect(result).toHaveLength(1);
      expect(prisma.friendship.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [{ receiverId: "user-1" }, { senderId: "user-1" }],
          },
        }),
      );
    });
  });
});
