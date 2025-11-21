import { useEffect } from "react";
import { socket } from "../utils/socket";

export const useSocket = (event: string, handler: (data: any) => void) => {
  useEffect(() => {
    socket.on(event, handler);
    return () => {
      socket.off(event, handler);
    };
  }, [event, handler]);
};