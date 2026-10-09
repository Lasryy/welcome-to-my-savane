import { createBrowserRouter, RouterProvider } from "react-router-dom";
import PublicLayout from "./components/PublicLayout";
import AdminLayout from "./components/admin/adminLayout";
import JobBoardPage from "./pages/jobBoardPage";
import JobDetailPage from "./pages/jobDetailPage";
import AdminPage from "./pages/admin/adminPage";
import AdminAdsPage from "./pages/admin/adminAdsPage";
import AdminAdCreatePage from "./pages/admin/adminAdCreatePage";
import AdminAdEditPage from "./pages/admin/adminAdEditPage";
import AdminCompaniesPage from "./pages/admin/adminCompaniesPage";
import AdminCategoriesPage from "./pages/admin/adminCategoriesPage";

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <JobBoardPage /> },
      { path: "/jobs/:id", element: <JobDetailPage /> },
    ],
  },
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
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
