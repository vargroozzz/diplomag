import { useState } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
  Button,
  Container,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Forum as ForumIcon,
  Book as BookIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Login as LoginIcon,
  HowToReg as RegisterIcon,
  Map as MapIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

const drawerWidth = 240;

const defaultTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#FFA500',
    },
    secondary: {
      main: '#4CAF50',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout, user: currentUser } = useAuth();
  const { t, i18n } = useTranslation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const baseMenuItems = [
    { text: t('menu.home'), icon: <HomeIcon />, path: '/' },
    { text: t('menu.map'), icon: <MapIcon />, path: '/map', protected: true },
    { text: t('menu.forums'), icon: <ForumIcon />, path: '/forums', protected: true },
    { text: t('menu.knowledgeBase'), icon: <BookIcon />, path: '/knowledge-base', protected: true },
    { text: t('menu.events'), icon: <EventIcon />, path: '/events', protected: true },
    { text: t('menu.profile'), icon: <PersonIcon />, path: '/profile', protected: true },
  ];

  const menuItems = currentUser?.isAdmin 
    ? [
        ...baseMenuItems,
        { text: t('menu.admin', 'Admin Panel'), icon: <AdminIcon />, path: '/admin', protected: true }
      ]
    : baseMenuItems;

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          {t('app.title')}
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          (!item.protected || isAuthenticated) && (
            <ListItemButton
              key={item.text}
              onClick={() => {
                navigate(item.path);
                if (isMobile) handleDrawerToggle();
              }}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          )
        ))}
      </List>
    </div>
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar
          position="fixed"
          sx={{
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` },
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                {t('app.title')}
              </Link>
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <Button
                variant={i18n.language === 'uk' ? 'contained' : 'outlined'}
                onClick={() => changeLanguage('uk')}
                sx={{ mr: 1, minWidth: 40 }}
              >
                UA
              </Button>
              <Button
                variant={i18n.language === 'en' ? 'contained' : 'outlined'}
                onClick={() => changeLanguage('en')}
                sx={{ minWidth: 40 }}
              >
                EN
              </Button>
            </Box>
            {!isAuthenticated ? (
              <Box>
                <Button
                  color="inherit"
                  startIcon={<LoginIcon />}
                  onClick={() => navigate('/login')}
                >
                  {t('auth.login')}
                </Button>
                <Button
                  color="inherit"
                  startIcon={<RegisterIcon />}
                  onClick={() => navigate('/register')}
                >
                  {t('auth.register')}
                </Button>
              </Box>
            ) : (
              <Button color="inherit" onClick={handleLogout}>
                {t('auth.logout')}
              </Button>
            )}
          </Toolbar>
        </AppBar>
        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            mt: '64px',
            width: {
              xs: '100%',
              sm: `calc(100% - ${drawerWidth}px)`
            },
            ml: { sm: `${drawerWidth}px` },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Container maxWidth="lg" sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Outlet />
          </Container>
        </Box>
        <Box
          component="footer"
          sx={{
            py: 3,
            px: 2,
            mt: 'auto',
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.grey[200]
                : theme.palette.grey[800],
          }}
        >
          <Container maxWidth="sm">
            <Typography variant="body2" color="text.secondary" align="center">
              © {new Date().getFullYear()} {t('app.title')}. {t('footer.rights')}
            </Typography>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Layout; 