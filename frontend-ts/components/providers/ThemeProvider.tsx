"use client";

import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ReactNode } from "react";

const theme = createTheme({
  palette: {
    primary: {
      main: "#4e73df",
    },
    secondary: {
      main: "#858796",
    },
    error: {
      main: "#e74a3b",
    },
    warning: {
      main: "#f6c23e",
    },
    success: {
      main: "#1cc88a",
    },
    background: {
      default: "#f8f9fc",
      paper: "#ffffff",
    },
    text: {
      primary: "#1b1e34",
      secondary: "#5a5c69",
    },
  },
  typography: {
    fontFamily: '"Nunito", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h4: {
      fontWeight: 700,
      color: "#1b1e34",
    },
    h5: {
      fontWeight: 700,
      color: "#1b1e34",
    },
    h6: {
      fontWeight: 700,
      color: "#1b1e34",
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 0.15rem 1.75rem 0 rgba(58,59,69,0.15)",
          border: "1px solid #e3e6f0",
        },
      },
    },
  },
});

export default function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
