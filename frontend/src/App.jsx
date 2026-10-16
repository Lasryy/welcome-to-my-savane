import { createBrowserRouter, RouterProvider } from "react-router-dom";
import PublicLayout from "./components/PublicLayout";
import AdminLayout from "./components/admin/adminLayout";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ProfilePage from "./pages/auth/ProfilePage";
import AdminRoute from "./pages/admin/AdminRoute";
import JobBoardPage from "./pages/jobBoardPage";
import JobDetailPage from "./pages/jobDetailPage";
import AdminPage from "./pages/admin/adminPage";
import AdminAdsPage from "./pages/admin/adminAdsPage";
import AdminAdCreatePage from "./pages/admin/adminAdCreatePage";
import AdminAdEditPage from "./pages/admin/adminAdEditPage";
import AdminCompaniesPage from "./pages/admin/adminCompaniesPage";
import AdminCategoriesPage from "./pages/admin/adminCategoriesPage";
import ApplicationsHistoryPage from "./pages/applications/ApplicationsHistoryPage";
import ApplicationDetailPage from "./pages/applications/ApplicationDetailPage";
import AdminApplicationsPage from "./pages/admin/adminApplicationsPage";
import AdminApplicationDetailPage from "./pages/admin/adminApplicationDetailPage";
import AdminUsersPage from "./pages/admin/adminUsersPage";
import CompanyRoute from "./pages/company/CompanyRoute";
import CompanyDashboardPage from "./pages/company/CompanyDashboardPage";
import CandidateDirectoryPage from "./pages/company/CandidateDirectoryPage";
import CandidateProfilePage from "./pages/company/CandidateProfilePage";

// This router also supports useBlocker in the admin's unsaved-change warning.
const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <JobBoardPage /> },
      { path: "/jobs/:id", element: <JobDetailPage /> },
      { path: "/applications", element: <ApplicationsHistoryPage /> },
      { path: "/applications/:id", element: <ApplicationDetailPage /> },
    ],
  },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/profile", element: <ProfilePage /> },
  {
    element: <CompanyRoute />,
    children: [
      { path: "/company", element: <CompanyDashboardPage /> },
      { path: "/company/candidates", element: <CandidateDirectoryPage /> },
      { path: "/company/candidates/:personId", element: <CandidateProfilePage /> },
    ],
  },
  {
    element: <AdminRoute />,
    children: [
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminPage /> },
          { path: "ads", element: <AdminAdsPage /> },
          { path: "ads/new", element: <AdminAdCreatePage /> },
          { path: "ads/:id/edit", element: <AdminAdEditPage /> },
          { path: "companies", element: <AdminCompaniesPage /> },
          { path: "categories", element: <AdminCategoriesPage /> },
          { path: "applications", element: <AdminApplicationsPage /> },
          { path: "applications/:id", element: <AdminApplicationDetailPage /> },
          { path: "users", element: <AdminUsersPage /> },
        ],
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
