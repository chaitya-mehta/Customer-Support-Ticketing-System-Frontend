import { createContext, useContext, useEffect, useState } from "react";
import { getNotifications, markAllAsRead } from "../api/notificationAPI";
import { useSocket } from "../hooks/useSocket";
import { socket } from "../utils/socket";

interface Notification {
  _id: string;
  type: string;
  payload: any;
  read: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  openModal: () => void;
  closeModal: () => void;
  isModalOpen: boolean;
  markAllAsRead: () => void;
  loading: boolean;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider = ({ children }: any) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const userData = JSON.parse(localStorage.getItem("user") || "null");
  const userId = userData?.id;
  useEffect(() => {
    if (userId) {
      console.log("Joining socket room for user:", userId);
      socket.emit("join-user-room", userId);
    }
  }, [userId]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useSocket("new-notification", (data: Notification) => {
    console.log("Received new notification via socket:", data);
    setNotifications((prev) => [data, ...prev]);
  });

  const markAllAsReadHandler = async () => {
    try {
      await markAllAsRead();
      setNotifications([]);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (userId) {
        try {
          setLoading(true);
          const data = await getNotifications();
          setNotifications(data || []);
        } catch (error) {
          console.error("Error fetching notifications:", error);
          setNotifications([]);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchNotifications();
  }, [userId]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        openModal,
        closeModal,
        isModalOpen,
        markAllAsRead: markAllAsReadHandler,
        loading,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error(
      "useNotifications must be used within <NotificationProvider>"
    );
  return ctx;
};
