import axios from "./axiosInstance";
interface Notification {
  _id: string;
  type: string;
  payload: any;
  read: boolean;
  createdAt: string;
}
export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const res = await axios.get("/notifications");
    return res.data.data;
  } catch (error: any) {
    console.error("Failed to fetch notifications:", error);
    return [];
  }
};
// export const markAsRead = async (): Promise<Notification | null> => {
//   try {
//     const res = await axios.put(`/notifications/mark-as-read`);
//     return res.data.data;
//   } catch (error: any) {
//     console.error(`Failed to mark notification ${id} as read:`, error);
//     return null; // return null on error
//   }
// };
// // api/notificationAPI.js
export const markAllAsRead = async (): Promise<any> => {
  try {
    const res = await axios.put(`/notifications/mark-as-read`);
    return res.data.data;
  } catch (error: any) {
    console.error(`Failed to mark all notifications as read:`, error);
    return null;
  }
};
