import { Route, Routes } from "react-router-dom";
import PublicLayout from "./components/PublicLayout";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ProfilePage from "./pages/auth/ProfilePage";
import AdminRoute from "./pages/admin/AdminRoute";
import JobBoardPage from "./pages/jobBoardPage";
import JobDetailPage from "./pages/jobDetailPage";
import AdminPage from "./pages/admin/adminPage";
import AdminAdsPage from "./pages/admin/adminAdsPage";
import AdminCompaniesPage from "./pages/admin/adminCompaniesPage";
import AdminCategoriesPage from "./pages/admin/adminCategoriesPage";

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<JobBoardPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
      </Route>

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/profile" element={<ProfilePage />} />

      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/ads" element={<AdminAdsPage />} />
        <Route path="/admin/companies" element={<AdminCompaniesPage />} />
        <Route path="/admin/categories" element={<AdminCategoriesPage />} />
      </Route>
    </Routes>
  );
}

export default App;
