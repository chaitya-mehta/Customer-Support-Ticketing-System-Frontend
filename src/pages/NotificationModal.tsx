import {
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Badge,
  IconButton,
  ListItemIcon,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { useState } from "react";
import { useNotifications } from "../context/NotificationContext";

export default function NotificationModal() {
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      handleClose();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };
  const renderMessage = (n: any) => {
    switch (n.type) {
      case "ticket.created":
        return `New Ticket: ${n.payload.name}`;
      case "ticket.updated":
        return `Ticket Updated: ${n.payload.ticketId}`;
      case "ticket.status.updated":
        return `Status Changed: ${n.payload.status}`;
      default:
        return n.type;
    }
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 4,
          sx: {
            width: 360,
            maxHeight: 400,
            mt: 1.5,
            borderRadius: 2,
            overflow: "hidden",
          },
        }}
      >
        <Box
          sx={{
            p: 1.5,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontSize: "16px", fontWeight: "bold" }}
          >
            Notifications
          </Typography>

          {notifications?.length > 0 && (
            <Typography
              variant="caption"
              sx={{
                color: "primary.main",
                cursor: "pointer",
                fontWeight: "bold",
              }}
              onClick={handleMarkAllAsRead}
            >
              Mark all read
            </Typography>
          )}
        </Box>

        <Divider />

        <Box
          sx={{
            maxHeight: 300,
            overflowY: "auto",
            overflowX: "hidden",
            "&::-webkit-scrollbar": {
              width: 6,
            },
            "&::-webkit-scrollbar-track": {
              background: "#f1f1f1",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#c1c1c1",
              borderRadius: 3,
            },
          }}
        >
          {notifications.length === 0 ? (
            <Typography sx={{ p: 2, textAlign: "center", color: "gray" }}>
              No notifications
            </Typography>
          ) : (
            notifications?.map((n: any) => (
              <MenuItem
                key={n._id}
                sx={{
                  alignItems: "flex-start",
                  gap: 1,
                  background: n.read ? "#fafafa" : "#e3f2fd",
                  borderBottom: "1px solid #eee",
                  whiteSpace: "normal",
                  py: 1.5,
                  minHeight: "auto",
                  display: "flex",
                }}
              >
                {!n.read && (
                  <ListItemIcon sx={{ minWidth: 24, mt: 0.5 }}>
                    <FiberManualRecordIcon
                      color="primary"
                      sx={{ fontSize: 10, flexShrink: 0 }}
                    />
                  </ListItemIcon>
                )}

                <Box
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    overflow: "hidden",
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: "14px",
                      lineHeight: 1.4,
                      wordBreak: "break-word",
                    }}
                  >
                    {renderMessage(n)}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      mt: 0.5,
                      color: "text.secondary",
                    }}
                  >
                    {new Date(n.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              </MenuItem>
            ))
          )}
        </Box>
      </Menu>
    </>
  );
}
