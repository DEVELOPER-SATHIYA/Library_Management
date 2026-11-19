import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { theme } from "./styles/theme";
import { GlobalStyles } from "./styles/GlobalStyles";
import { LibraryProvider } from "./context/LibraryProvider";
import { ToastProvider } from "./context/ToastProvider";
import { AuthProvider } from "./context/AuthProvider";
import { AppRoutes } from "./routes/AppRoutes";

const App = () => (
  <ThemeProvider theme={theme}>
    <GlobalStyles />

    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ToastProvider>
        <AuthProvider>
          <LibraryProvider>
            <AppRoutes />
          </LibraryProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </ThemeProvider>
);

export default App;