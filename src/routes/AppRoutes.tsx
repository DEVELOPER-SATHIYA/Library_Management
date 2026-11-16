import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AdminLayout } from "../components/layout/AdminLayout";
import { Catalogue } from "../pages/Catalogue/Catalogue";
import { Login } from "../pages/Login/Login";
import { Dashboard } from "../pages/Dashboard/Dashboard";
import { Books } from "../pages/Books/Books";
import { RegisterBook } from "../pages/RegisterBook/RegisterBook";
import { IssuedBooks } from "../pages/IssuedBooks/IssuedBooks";
import { IssueReturn } from "../pages/IssueReturn/IssueReturn";
import { Students } from "../pages/Students/Students";
import { Settings } from "../pages/Settings/Settings";
import { NotFound } from "../pages/NotFound/NotFound";

/** Admin shell, or a redirect to the login screen when signed out. */
const ProtectedLayout = () => {
  const { isAdmin } = useAuth();
  const location = useLocation();
  if (!isAdmin) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return <AdminLayout />;
};

export const AppRoutes = () => (
  <Routes>
    {/* Public: students land here */}
    <Route index element={<Catalogue />} />
    <Route path="login" element={<Login />} />

    {/* Admin only */}
    <Route element={<ProtectedLayout />}>
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="books" element={<Books />} />
      <Route path="register-book" element={<RegisterBook />} />
      <Route path="issued-books" element={<IssuedBooks />} />
      <Route path="issue-return" element={<IssueReturn />} />
      <Route path="students" element={<Students />} />
      <Route path="settings" element={<Settings />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
);
