import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import Layout from "./components/Layout";
import UrlShortener from "./pages/UrlShortener";
import Statistics from "./pages/Statistics";
import RedirectHandler from "./pages/RedirectHandler";
import NotFound from "./pages/NotFound";

// Material UI Theme for Affordmed
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: 'hsl(200, 75%, 45%)',
      light: 'hsl(200, 60%, 85%)',
      dark: 'hsl(200, 80%, 35%)',
      contrastText: '#ffffff',
    },
    secondary: {
      main: 'hsl(185, 65%, 50%)',
      light: 'hsl(185, 50%, 90%)',
      dark: 'hsl(185, 70%, 40%)',
      contrastText: '#ffffff',
    },
    background: {
      default: 'hsl(210, 20%, 98%)',
      paper: '#ffffff',
    },
    text: {
      primary: 'hsl(215, 25%, 15%)',
      secondary: 'hsl(215, 15%, 50%)',
    },
    success: {
      main: 'hsl(145, 70%, 45%)',
    },
    warning: {
      main: 'hsl(35, 85%, 55%)',
    },
    error: {
      main: 'hsl(0, 75%, 55%)',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 12,
          padding: '12px 24px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 8px -1px hsl(215 25% 15% / 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
  },
});

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<UrlShortener />} />
              <Route path="statistics" element={<Statistics />} />
            </Route>
            <Route path="/:shortCode" element={<RedirectHandler />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
