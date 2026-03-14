import { render, screen, fireEvent } from "@testing-library/react";
import Message from "../Message";
import { vi, describe, it, expect } from "vitest";
import { MessageWithUsers } from "../../types/Message";
import UserInterface from "../../types/User";

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: any) => <img {...props} alt={props.alt} />,
}));

describe("Message Component", () => {
  const mockUser: UserInterface = {
    id: "user-1",
    username: "testuser",
    email: "test@example.com",
    createdAt: new Date(),
    lastOnline: new Date(),
    onlineStatus: "ONLINE",
    profilePicture: "default.png",
  };

  const mockMessage: MessageWithUsers = {
    id: "msg-1",
    message: "Hello World",
    senderId: "user-1",
    receiverId: "user-2",
    createdAt: new Date(),
    updatedAt: new Date(),
    images: [],
    sender: mockUser,
    receiver: { ...mockUser, id: "user-2", username: "other" },
  };

  const defaultProps = {
    message: mockMessage,
    user: mockUser,
    isUpdated: false,
    setSelectedImage: vi.fn(),
    setEditing: vi.fn(),
    setNewMessage: vi.fn(),
    handleDeleteMessage: vi.fn(),
    setNewImages: vi.fn(),
  };

  it("renders message text", () => {
    render(<Message {...defaultProps} />);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("shows (editado) if isUpdated is true", () => {
    render(<Message {...defaultProps} isUpdated={true} />);
    expect(screen.getByText("(editado)")).toBeInTheDocument();
  });

  it("does not render edit/delete buttons if user is not sender", () => {
    const otherUser = { ...mockUser, id: "user-3" };
    const { container } = render(
      <Message {...defaultProps} user={otherUser} />,
    );

    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBe(0);
  });

  it("renders edit/delete buttons if user is sender", () => {
    render(<Message {...defaultProps} />);
    expect(screen.getByTestId("edit-message")).toBeInTheDocument();
    expect(screen.getByTestId("delete-message")).toBeInTheDocument();
  });

  it("handles clicking edit button", () => {
    render(<Message {...defaultProps} />);
    fireEvent.click(screen.getByTestId("edit-message"));
    expect(defaultProps.setEditing).toHaveBeenCalledWith("msg-1");
    expect(defaultProps.setNewMessage).toHaveBeenCalledWith("Hello World");
    expect(defaultProps.setNewImages).toHaveBeenCalledWith([]);
  });

  it("handles clicking delete button", () => {
    render(<Message {...defaultProps} />);
    fireEvent.click(screen.getByTestId("delete-message"));
    expect(defaultProps.handleDeleteMessage).toHaveBeenCalledWith("msg-1");
  });

  it("renders images and handles clicking them", () => {
    const msgWithImages = {
      ...mockMessage,
      images: ["img1.jpg", "img2.jpg"],
    };
    render(<Message {...defaultProps} message={msgWithImages} />);

    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute("src", "img1.jpg");

    fireEvent.click(images[0]);
    expect(defaultProps.setSelectedImage).toHaveBeenCalledWith("img1.jpg");
  });
});
