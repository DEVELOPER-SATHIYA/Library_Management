import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { theme } from "./styles/theme";
import { GlobalStyles } from "./styles/GlobalStyles";
import { LibraryProvider } from "./context/LibraryContext";
import { ToastProvider } from "./context/ToastContext";
import { AdminRoutes } from "./routes/AdminRoutes";

const App = () => (
  <ThemeProvider theme={theme}>
    <GlobalStyles />
    <BrowserRouter  basename={import.meta.env.BASE_URL}>
      <ToastProvider>
        <LibraryProvider>
          <AdminRoutes />
        </LibraryProvider>
      </ToastProvider>
    </BrowserRouter>
  </ThemeProvider>
);

export default App;
