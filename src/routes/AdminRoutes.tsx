import { Navigate, Route, Routes } from "react-router-dom";
import { AdminLayout } from "../components/layout/AdminLayout";
import { Dashboard } from "../pages/Dashboard/Dashboard";
import { Books } from "../pages/Books/Books";
import { RegisterBook } from "../pages/RegisterBook/RegisterBook";
import { IssuedBooks } from "../pages/IssuedBooks/IssuedBooks";
import { IssueReturn } from "../pages/IssueReturn/IssueReturn";
import { Students } from "../pages/Students/Students";
import { Settings } from "../pages/Settings/Settings";
import { NotFound } from "../pages/NotFound/NotFound";

export const AdminRoutes = () => (
  <Routes>
    <Route element={<AdminLayout />}>
      <Route index element={<Navigate to="/dashboard" replace />} />
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
