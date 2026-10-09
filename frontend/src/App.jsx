import JobBoardPage from "./pages/jobBoardPage";
import JobDetailPage from "./pages/jobDetailPage";
import AdminPage from "./pages/admin/adminPage";
import AdminAdsPage from "./pages/admin/adminAdsPage";
import AdminCompaniesPage from "./pages/admin/adminCompaniesPage";
import AdminCategoriesPage from "./pages/admin/adminCategoriesPage";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<JobBoardPage />} />
      <Route path="/jobs/:id" element={<JobDetailPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin/ads" element={<AdminAdsPage />} />
      <Route path="/admin/companies" element={<AdminCompaniesPage />} />
      <Route path="/admin/categories" element={<AdminCategoriesPage />} />
    </Routes>
  );
}

export default App;
