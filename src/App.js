import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { SettingsProvider, useSettings } from "./context/SettingsContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { MaintenanceBanner } from "./components/MaintenanceBanner";
import { Megaphone } from "lucide-react";
import AuthPage from "./pages/AuthPage";
import VerifyEmail from "./pages/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import CreateListing from "./pages/CreateListing";
import ListingDetails from "./pages/ListingDetails";
import MyListings from "./pages/MyListings";
import AccountSettings from "./pages/AccountSettings";
import { MaintenanceGate } from "./components/MaintenanceGate";
import { AdminRoute } from "./components/AdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
import { AdminDashboard, ListingsManager, UsersManager, ReportsManager, CategoriesManager, WebsiteSettings, MaintenanceManager, Analytics, AdminLogs } from "./pages/admin/AdminPages";
import "@/App.css";

const AnnouncementBanner = () => {
  const { announcement } = useSettings();
  if (!announcement?.trim()) return null;
  return (
    <div
      className="w-full bg-orange-50 border-b border-orange-100 text-orange-900 dark:bg-orange-500/10 dark:border-orange-500/20 dark:text-orange-300 px-4 py-2 text-center text-sm flex items-center justify-center gap-2"
      data-testid="announcement-banner"
    >
      <Megaphone className="w-4 h-4 shrink-0" />
      {announcement}
    </div>
  );
};

const Shell = ({ children }) => (
  <div className="min-h-screen bg-[#F8F9FA]">
    <MaintenanceBanner />
    <Navbar />
    <AnnouncementBanner />
    <AnimatePresence mode="wait">{children}</AnimatePresence>
    <Footer />
  </div>
);

function App() {
  return (
    <ThemeProvider>
    <SettingsProvider>
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          richColors
          position="top-center"
          toastOptions={{
            style: { borderRadius: "12px", fontFamily: "inherit" },
          }}
        />
        <MaintenanceGate><Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Shell>
                  <Dashboard />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <Shell>
                  <CreateListing />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit/:id"
            element={
              <ProtectedRoute>
                <Shell>
                  <CreateListing editMode />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/listing/:id"
            element={
              <ProtectedRoute>
                <Shell>
                  <ListingDetails />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-listings"
            element={
              <ProtectedRoute>
                <Shell>
                  <MyListings />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Shell>
                  <AccountSettings />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="listings" element={<ListingsManager />} />
            <Route path="users" element={<UsersManager />} />
            <Route path="reports" element={<ReportsManager />} />
            <Route path="categories" element={<CategoriesManager />} />
            <Route path="settings" element={<WebsiteSettings />} />
            <Route path="maintenance" element={<MaintenanceManager />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="logs" element={<AdminLogs />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes></MaintenanceGate>
      </BrowserRouter>
    </AuthProvider>
    </SettingsProvider>
    </ThemeProvider>
  );
}

export default App;
