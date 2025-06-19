// import React, { useState, useEffect } from 'react';
// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
// import useAuth from '../../hooks/useAuth';
// import useLanguage from '../../hooks/useLanguage';
// import { Link } from 'react-router-dom';


// // MUI Components
// import {
//   AppBar,
//   Box,
//   Toolbar,
//   IconButton,
//   Typography,
//   Menu,
//   Container,
//   Avatar,
//   Button,
//   MenuItem,
//   Drawer,
//   List,
//   ListItem,
//   ListItemText,
//   ListItemIcon,
//   Divider,
//   Tooltip,
//   useMediaQuery,
//   useTheme,
//   Select,
//   FormControl,
// } from '@mui/material';

// // MUI Icons
// import MenuIcon from '@mui/icons-material/Menu';
// import HomeIcon from '@mui/icons-material/Home';
// import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
// import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
// import CampaignIcon from '@mui/icons-material/Campaign';
// import PersonIcon from '@mui/icons-material/Person';
// import DashboardIcon from '@mui/icons-material/Dashboard';
// import LoginIcon from '@mui/icons-material/Login';
// import HowToRegIcon from '@mui/icons-material/HowToReg';
// import LogoutIcon from '@mui/icons-material/Logout';
// import TranslateIcon from '@mui/icons-material/Translate';

// const Header = () => {
//   const { t } = useTranslation();
//   const { isAuthenticated, user, logout } = useAuth();
//   const { currentLanguage, changeLanguage, languages } = useLanguage();
//   const location = useLocation();
//   const navigate = useNavigate();
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
//   const [drawerOpen, setDrawerOpen] = useState(false);
//   const [anchorElUser, setAnchorElUser] = useState(null);
//   const [scrolled, setScrolled] = useState(false);

//   // Handle scroll effect
//   useEffect(() => {
//     const handleScroll = () => {
//       const offset = window.scrollY;
//       if (offset > 50) {
//         setScrolled(true);
//       } else {
//         setScrolled(false);
//       }
//     };

//     window.addEventListener('scroll', handleScroll);
//     return () => {
//       window.removeEventListener('scroll', handleScroll);
//     };
//   }, []);

//   // Language change handler
//   const handleLanguageChange = (event) => {
//     changeLanguage(event.target.value);
//   };

//   // Toggle drawer
//   const toggleDrawer = (open) => (event) => {
//     if (
//       event.type === 'keydown' &&
//       (event.key === 'Tab' || event.key === 'Shift')
//     ) {
//       return;
//     }
//     setDrawerOpen(open);
//   };

//   // User menu handlers
//   const handleOpenUserMenu = (event) => {
//     setAnchorElUser(event.currentTarget);
//   };

//   const handleCloseUserMenu = () => {
//     setAnchorElUser(null);
//   };

//   // Logout handler
//   const handleLogout = () => {
//     logout();
//     navigate('/');
//     handleCloseUserMenu();
//   };

//   // Navigation items
//   const navItems = [
//     { name: t('nav.home'), path: '/', icon: <HomeIcon /> },
//     { name: t('nav.doctors'), path: '/doctors', icon: <MedicalServicesIcon /> },
//     { name: t('nav.healthCamps'), path: '/health-camps', icon: <CampaignIcon /> },
//   ];

//   // Authenticated navigation items
//   const authNavItems = [
//     { name: t('nav.dashboard'), path: '/dashboard', icon: <DashboardIcon /> },
//     { name: t('nav.appointments'), path: '/appointments', icon: <CalendarMonthIcon /> },
//     { name: t('nav.profile'), path: '/profile', icon: <PersonIcon /> }
//   ];

//   // Non-authenticated navigation items
//   const nonAuthNavItems = [
//     { name: t('nav.login'), path: '/login', icon: <LoginIcon /> },
//     { name: t('nav.register'), path: '/register', icon: <HowToRegIcon /> },
//   ];

//   // Drawer list
//   const drawerList = () => (
//     <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
//       <List>
//         {navItems.map((item) => (
//           <ListItem
//             button
//             key={item.name}
//             component={Link}
//             to={item.path}
//             selected={location.pathname === item.path}
//             sx={{
//               borderLeft: location.pathname === item.path ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
//               backgroundColor: location.pathname === item.path ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
//             }}
//           >
//             <ListItemIcon>{item.icon}</ListItemIcon>
//             <ListItemText primary={item.name} />
//           </ListItem>
//         ))}
//       </List>
//       <Divider />
//       <List>
//         {isAuthenticated
//           ? authNavItems.map((item) => (
//               <ListItem
//                 button
//                 key={item.name}
//                 component={Link}
//                 to={item.path}
//                 selected={location.pathname === item.path}
//                 sx={{
//                   borderLeft: location.pathname === item.path ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
//                   backgroundColor: location.pathname === item.path ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
//                 }}
//               >
//                 <ListItemIcon>{item.icon}</ListItemIcon>
//                 <ListItemText primary={item.name} />
//               </ListItem>
//             ))
//           : nonAuthNavItems.map((item) => (
//               <ListItem
//                 button
//                 key={item.name}
//                 component={Link}
//                 to={item.path}
//                 selected={location.pathname === item.path}
//                 sx={{
//                   borderLeft: location.pathname === item.path ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
//                   backgroundColor: location.pathname === item.path ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
//                 }}
//               >
//                 <ListItemIcon>{item.icon}</ListItemIcon>
//                 <ListItemText primary={item.name} />
//               </ListItem>
//             ))}
//         {isAuthenticated && (
//           <ListItem button onClick={handleLogout}>
//             <ListItemIcon>
//               <LogoutIcon />
//             </ListItemIcon>
//             <ListItemText primary={t('nav.logout')} />
//           </ListItem>
//         )}
//       </List>
//       <Divider />
//       <Box sx={{ p: 2 }}>
//         <FormControl fullWidth size="small">
//           <Select
//             value={currentLanguage}
//             onChange={handleLanguageChange}
//             displayEmpty
//             startAdornment={<TranslateIcon sx={{ mr: 1 }} />}
//           >
//             {languages.map((lang) => (
//               <MenuItem key={lang.code} value={lang.code}>
//                 {lang.name}
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl>
//       </Box>
//     </Box>
//   );

//   return (
//     <AppBar 
//       position="sticky" 
//       color="default" 
//       elevation={scrolled ? 4 : 0}
//       sx={{ 
//         backgroundColor: 'white',
//         transition: 'all 0.3s',
//         borderBottom: scrolled ? 'none' : '1px solid rgba(0, 0, 0, 0.05)',
//       }}
//     >
//       <Container maxWidth="xl">
//         <Toolbar disableGutters>
//           {/* Logo for desktop */}
//           <Typography
//             variant="h6"
//             noWrap
//             component={Link}
//             to="/"
//             sx={{
//               mr: 2,
//               display: { xs: 'none', md: 'flex' },
//               fontWeight: 700,
//               color: 'primary.main',
//               textDecoration: 'none',
//             }}
//           >
//             {t('app.name')}
//           </Typography>

//           {/* Mobile menu icon */}
//           <Box sx={{ flexGrow: 0, display: { xs: 'flex', md: 'none' } }}>
//             <IconButton
//               size="large"
//               aria-label="account of current user"
//               aria-controls="menu-appbar"
//               aria-haspopup="true"
//               onClick={toggleDrawer(true)}
//               color="inherit"
//             >
//               <MenuIcon />
//             </IconButton>
//             <Drawer
//               anchor="left"
//               open={drawerOpen}
//               onClose={toggleDrawer(false)}
//             >
//               {drawerList()}
//             </Drawer>
//           </Box>

//           {/* Logo for mobile */}
//           <Typography
//             variant="h6"
//             noWrap
//             component={Link}
//             to="/"
//             sx={{
//               flexGrow: 1,
//               display: { xs: 'flex', md: 'none' },
//               fontWeight: 700,
//               color: 'primary.main',
//               textDecoration: 'none',
//             }}
//           >
//             {t('app.name')}
//           </Typography>

//           {/* Desktop navigation */}
//           <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
//             {navItems.map((item) => (
//               <Button
//                 key={item.name}
//                 component={Link}
//                 to={item.path}
//                 sx={{
//                   my: 2,
//                   mx: 1,
//                   color: 'text.primary',
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: '0.5rem',
//                   borderBottom: location.pathname === item.path ? '2px solid' : '2px solid transparent',
//                   borderColor: location.pathname === item.path ? 'primary.main' : 'transparent',
//                   '&:hover': {
//                     backgroundColor: 'rgba(37, 99, 235, 0.04)',
//                   },
//                 }}
//               >
//                 {item.icon}
//                 {item.name}
//               </Button>
//             ))}
//           </Box>

//           {/* Language switcher - desktop */}
//           <Box sx={{ mr: 2, display: { xs: 'none', md: 'flex' } }}>
//             <FormControl size="small">
//               <Select
//                 value={currentLanguage}
//                 onChange={handleLanguageChange}
//                 displayEmpty
//                 variant="outlined"
//                 sx={{ height: 40 }}
//                 startAdornment={<TranslateIcon sx={{ mr: 1 }} />}
//               >
//                 {languages.map((lang) => (
//                   <MenuItem key={lang.code} value={lang.code}>
//                     {lang.name}
//                   </MenuItem>
//                 ))}
//               </Select>
//             </FormControl>
//           </Box>

//           {/* Auth navigation - desktop */}
//           {!isAuthenticated ? (
//             <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
//               <Button
//                 component={Link}
//                 to="/login"
//                 color="inherit"
//                 sx={{ mr: 1 }}
//               >
//                 {t('nav.login')}
//               </Button>
//               <Button
//                 component={Link}
//                 to="/register"
//                 variant="contained"
//                 color="primary"
//               >
//                 {t('nav.register')}
//               </Button>
//             </Box>
//           ) : (
//             <Box sx={{ flexGrow: 0 }}>
//               <Tooltip title={user?.name || 'User'}>
//                 <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
//                   <Avatar
//                     alt={user?.name || 'User'}
//                     src={user?.profileImage || '/static/images/avatar/2.jpg'}
//                     sx={{ backgroundColor: 'primary.main' }}
//                   >
//                     {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
//                   </Avatar>
//                 </IconButton>
//               </Tooltip>
//               <Menu
//                 sx={{ mt: '45px' }}
//                 id="menu-appbar"
//                 anchorEl={anchorElUser}
//                 anchorOrigin={{
//                   vertical: 'top',
//                   horizontal: 'right',
//                 }}
//                 keepMounted
//                 transformOrigin={{
//                   vertical: 'top',
//                   horizontal: 'right',
//                 }}
//                 open={Boolean(anchorElUser)}
//                 onClose={handleCloseUserMenu}
//               >
//                 {authNavItems.map((item) => (
//                   <MenuItem
//                     key={item.name}
//                     onClick={() => {
//                       navigate(item.path);
//                       handleCloseUserMenu();
//                     }}
//                   >
//                     <Box display="flex" alignItems="center" gap={1}>
//                       {item.icon}
//                       <Typography textAlign="center">{item.name}</Typography>
//                     </Box>
//                   </MenuItem>
//                 ))}
//                 <Divider />
//                 <MenuItem onClick={handleLogout}>
//                   <Box display="flex" alignItems="center" gap={1}>
//                     <LogoutIcon />
//                     <Typography textAlign="center">{t('nav.logout')}</Typography>
//                   </Box>
//                 </MenuItem>
//               </Menu>
//             </Box>
//           )}
//         </Toolbar>
//       </Container>
//     </AppBar>
//   );
// };

// export default Header; 




import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuth from '../../hooks/useAuth';
import useLanguage from '../../hooks/useLanguage';

import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Tooltip,
  useMediaQuery,
  useTheme,
  Select,
  FormControl,
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CampaignIcon from '@mui/icons-material/Campaign';
import PersonIcon from '@mui/icons-material/Person';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LoginIcon from '@mui/icons-material/Login';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import LogoutIcon from '@mui/icons-material/Logout';
import TranslateIcon from '@mui/icons-material/Translate';
import SummarizeIcon from '@mui/icons-material/Summarize';

const Header = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const { currentLanguage, changeLanguage, languages } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLanguageChange = (event) => changeLanguage(event.target.value);
  const toggleDrawer = (open) => () => setDrawerOpen(open);
  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);
  const handleLogout = () => {
    logout();
    navigate('/');
    handleCloseUserMenu();
  };

  const navItems = [
    { name: t('nav.home'), path: '/', icon: <HomeIcon /> },
    { name: t('nav.doctors'), path: '/doctors', icon: <MedicalServicesIcon /> },
    { name: t('nav.healthCamps'), path: '/health-camps', icon: <CampaignIcon /> },
    { name: 'Report Summarizer', path: '/report-summarizer', icon: <SummarizeIcon /> },
  ];

  const authNavItems = [
    { name: t('nav.dashboard'), path: '/dashboard', icon: <DashboardIcon /> },
    { name: t('nav.appointments'), path: '/appointments', icon: <CalendarMonthIcon /> },
    { name: t('nav.profile'), path: '/profile', icon: <PersonIcon /> },
  ];

  const nonAuthNavItems = [
    { name: t('nav.login'), path: '/login', icon: <LoginIcon /> },
    { name: t('nav.register'), path: '/register', icon: <HowToRegIcon /> },
  ];

  const drawerList = () => (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
      <List>
        {navItems.map((item) => (
          <ListItem
            button key={item.name} component={Link} to={item.path}
            selected={location.pathname === item.path}
            sx={{
              borderLeft: location.pathname === item.path ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
              backgroundColor: location.pathname === item.path ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.name} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {(isAuthenticated ? authNavItems : nonAuthNavItems).map((item) => (
          <ListItem
            button key={item.name} component={Link} to={item.path}
            selected={location.pathname === item.path}
            sx={{
              borderLeft: location.pathname === item.path ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
              backgroundColor: location.pathname === item.path ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.name} />
          </ListItem>
        ))}
        {isAuthenticated && (
          <ListItem button onClick={handleLogout}>
            <ListItemIcon><LogoutIcon /></ListItemIcon>
            <ListItemText primary={t('nav.logout')} />
          </ListItem>
        )}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <TranslateIcon sx={{ mr: 1, fontSize: '1rem' }} />
          {t('app.selectLanguage') || 'Select Language'}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Button 
            onClick={() => changeLanguage('en')} 
            variant={currentLanguage === 'en' ? 'contained' : 'outlined'}
            color="primary"
            sx={{ flex: 1, mr: 1 }}
          >
            English
          </Button>
          <Button 
            onClick={() => changeLanguage('hi')} 
            variant={currentLanguage === 'hi' ? 'contained' : 'outlined'}
            color="primary"
            sx={{ flex: 1 }}
          >
            हिंदी
          </Button>
        </Box>
      </Box>
    </Box>
  );

  return (
    <AppBar position="sticky" color="default" elevation={scrolled ? 4 : 0}
      sx={{ backgroundColor: 'white', transition: 'all 0.3s', borderBottom: scrolled ? 'none' : '1px solid rgba(0,0,0,0.05)' }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Desktop Logo */}
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{ mr: 2, display: { xs: 'none', md: 'flex' }, fontWeight: 700, color: 'primary.main', textDecoration: 'none' }}
          >
            {t('app.name')}
          </Typography>

          {/* Mobile Menu */}
          <Box sx={{ flexGrow: 0, display: { xs: 'flex', md: 'none' } }}>
            <IconButton size="large" onClick={toggleDrawer(true)} color="inherit">
              <MenuIcon />
            </IconButton>
            <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
              {drawerList()}
            </Drawer>
          </Box>

          {/* Mobile Logo */}
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' }, fontWeight: 700, color: 'primary.main', textDecoration: 'none' }}
          >
            {t('app.name')}
          </Typography>

          {/* Desktop Nav */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {navItems.map((item) => (
              <Button
                key={item.name}
                component={Link}
                to={item.path}
                sx={{
                  my: 2, mx: 1, color: 'text.primary',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  borderBottom: location.pathname === item.path ? '2px solid' : '2px solid transparent',
                  borderColor: location.pathname === item.path ? 'primary.main' : 'transparent',
                  '&:hover': { backgroundColor: 'rgba(37, 99, 235, 0.04)' },
                }}
              >
                {item.icon}
                {item.name}
              </Button>
            ))}
          </Box>

          {/* Language Selector + Auth Buttons */}
          <Box sx={{ mr: 2, display: { xs: 'none', md: 'flex' } }}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                border: '1px solid rgba(0, 0, 0, 0.12)', 
                borderRadius: 1, 
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                mr: 2
              }}
            >
              <TranslateIcon sx={{ mx: 1, color: 'primary.main', fontSize: '1.2rem' }} />
              <Button 
                onClick={() => changeLanguage('en')} 
                sx={{ 
                  py: 0.5, 
                  px: 1.5, 
                  minWidth: 'auto',
                  backgroundColor: currentLanguage === 'en' ? 'primary.main' : 'transparent',
                  color: currentLanguage === 'en' ? 'white' : 'text.primary',
                  '&:hover': { backgroundColor: currentLanguage === 'en' ? 'primary.dark' : 'rgba(0,0,0,0.04)' },
                  borderRadius: 0,
                  borderRight: '1px solid rgba(0,0,0,0.12)'
                }}
              >
                English
              </Button>
              <Button 
                onClick={() => changeLanguage('hi')} 
                sx={{ 
                  py: 0.5, 
                  px: 1.5, 
                  minWidth: 'auto',
                  backgroundColor: currentLanguage === 'hi' ? 'primary.main' : 'transparent',
                  color: currentLanguage === 'hi' ? 'white' : 'text.primary',
                  '&:hover': { backgroundColor: currentLanguage === 'hi' ? 'primary.dark' : 'rgba(0,0,0,0.04)' },
                  borderRadius: 0
                }}
              >
                हिंदी
              </Button>
            </Box>
          </Box>

          {!isAuthenticated ? (
            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
              <Button component={Link} to="/login" color="inherit" sx={{ mr: 1 }}>{t('nav.login')}</Button>
              <Button component={Link} to="/register" variant="contained" color="primary">{t('nav.register')}</Button>
            </Box>
          ) : (
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title={user?.name || 'User'}>
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar alt={user?.name || 'U'} src={user?.profileImage || ''} sx={{ backgroundColor: 'primary.main' }}>
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                anchorEl={anchorElUser}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {authNavItems.map((item) => (
                  <MenuItem key={item.name} onClick={() => { navigate(item.path); handleCloseUserMenu(); }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {item.icon}
                      <Typography>{item.name}</Typography>
                    </Box>
                  </MenuItem>
                ))}
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <LogoutIcon />
                    <Typography>{t('nav.logout')}</Typography>
                  </Box>
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;


