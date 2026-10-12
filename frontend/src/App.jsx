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
import AdminApplicationsPage from "./pages/admin/adminApplicationsPage";
import AdminUsersPage from "./pages/admin/adminUsersPage";

// This router also supports useBlocker in the admin's unsaved-change warning.
const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <JobBoardPage /> },
      { path: "/jobs/:id", element: <JobDetailPage /> },
      { path: "/applications", element: <ApplicationsHistoryPage /> },
    ],
  },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/profile", element: <ProfilePage /> },
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
          { path: "users", element: <AdminUsersPage /> },
        ],
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
