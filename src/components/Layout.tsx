import {
  Category as CategoryIcon,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  ConfirmationNumber as TicketIcon,
} from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import { logout } from "../store/slices/authSlice";
import { ROLES } from "../types";
import { getUserRole } from "../utils/authHelpers";
import NotificationModal from "../pages/NotificationModal";

const Layout: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const userRole = getUserRole();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const menuItems = [
    {
      text: "Helpdesk",
      icon: <DashboardIcon />,
      path: "/dashboard",
      roles: [ROLES.CUSTOMER],
    },
    {
      text: "Admin-Dashboard",
      icon: <DashboardIcon />,
      path: "/admin-dashboard",
      roles: [ROLES.ADMIN],
    },
    {
      text: "Tickets",
      icon: <TicketIcon />,
      path: "/tickets",
      roles: [ROLES.ADMIN, ROLES.AGENT],
    },
    {
      text: "Categories",
      icon: <CategoryIcon />,
      path: "/categories",
      roles: [ROLES.ADMIN],
    },
    {
      text: "Users",
      icon: <CategoryIcon />,
      path: "/users",
      roles: [ROLES.ADMIN],
    },
  ];
  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(userRole as ROLES)
  );
  const drawer = (
    <Box sx={{ width: 250 }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Support System
        </Typography>
      </Box>
      <Divider />
      <List>
        {filteredMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "#1976d2",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#115293",
                  },
                  "& .MuiListItemIcon-root": {
                    color: "white",
                  },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="fixed" sx={{ zIndex: 1201 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Support Ticket System
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <NotificationModal />
            <Avatar
              sx={{ bgcolor: "#1976d2", cursor: "pointer" }}
              onClick={handleMenu}
            >
              {user.user?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem disabled>
                <Typography variant="body2">{user.user?.name}</Typography>
              </MenuItem>
              <MenuItem disabled>
                <Typography variant="caption">{user.user?.email}</Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1 }} /> Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: { xs: "block", md: "none" } }}>
        <Drawer
          anchor="left"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          sx={{ display: { xs: "block", md: "none" } }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <Drawer variant="permanent" sx={{ width: 250 }}>
          {drawer}
        </Drawer>
      </Box>

      <Box sx={{ flexGrow: 1, mt: 8 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
