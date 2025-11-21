import { Bell } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";

export default function NotificationBell() {
  const { unreadCount, openModal, isModalOpen, closeModal } =
    useNotifications();
  return (
    <div
      style={{ position: "relative", cursor: "pointer" }}
      onClick={() => {
        isModalOpen ? closeModal() : openModal();
      }}
    >
      <Bell size={24} />

      {unreadCount > 0 && <span style={badgeStyle}>{unreadCount}</span>}
    </div>
  );
}

const badgeStyle = {
  position: "absolute" as "absolute",
  top: -5,
  right: -5,
  background: "red",
  color: "#fff",
  borderRadius: "50%",
  padding: "2px 6px",
  fontSize: "10px",
};
