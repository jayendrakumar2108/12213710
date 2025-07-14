import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Tabs,
  Tab,
  Paper,
  Chip,
} from '@mui/material';
import { Link as LinkIcon, BarChart3 } from 'lucide-react';
import { logger } from '../utils/logging';

const Layout: React.FC = () => {
  const location = useLocation();
  const [currentTab, setCurrentTab] = React.useState(0);

  React.useEffect(() => {
    logger.info('Layout', 'Page navigation', { path: location.pathname });
    
    // Set current tab based on route
    if (location.pathname === '/') {
      setCurrentTab(0);
    } else if (location.pathname === '/statistics') {
      setCurrentTab(1);
    }
  }, [location.pathname]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Header */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          backgroundColor: 'white',
          borderBottom: '1px solid',
          borderColor: 'grey.200'
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <LinkIcon size={28} color="hsl(200, 75%, 45%)" />
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                ml: 2, 
                fontWeight: 700,
                color: 'text.primary'
              }}
            >
              Affordmed URL Shortener
            </Typography>
            <Chip 
              label="Medical Technology" 
              size="small" 
              sx={{ 
                ml: 2,
                backgroundColor: 'hsl(185, 50%, 90%)',
                color: 'hsl(200, 75%, 45%)',
                fontWeight: 600
              }}
            />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Navigation Tabs */}
      <Container maxWidth="lg">
        <Paper 
          elevation={0} 
          sx={{ 
            mt: 3, 
            backgroundColor: 'white',
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange}
            sx={{
              borderBottom: '1px solid',
              borderColor: 'grey.200',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                minHeight: 64,
              }
            }}
          >
            <Tab 
              label="URL Shortener" 
              component={Link} 
              to="/"
              icon={<LinkIcon size={20} />}
              iconPosition="start"
            />
            <Tab 
              label="Statistics" 
              component={Link} 
              to="/statistics"
              icon={<BarChart3 size={20} />}
              iconPosition="start"
            />
          </Tabs>
        </Paper>
      </Container>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Outlet />
      </Container>

      {/* Footer */}
      <Box 
        component="footer" 
        sx={{ 
          mt: 'auto', 
          py: 3, 
          backgroundColor: 'white',
          borderTop: '1px solid',
          borderColor: 'grey.200'
        }}
      >
        <Container maxWidth="lg">
          <Typography 
            variant="body2" 
            color="text.secondary" 
            align="center"
          >
            © 2024 Affordmed URL Shortener - Medical Technology Solutions
          </Typography>
          <Typography 
            variant="caption" 
            color="text.secondary" 
            align="center" 
            display="block"
            sx={{ mt: 1 }}
          >
            Candidate Assessment - React Application
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;