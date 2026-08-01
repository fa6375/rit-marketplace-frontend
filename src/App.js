import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { SettingsProvider } from "./context/SettingsContext";
import { CompareProvider } from "./context/CompareContext";
import { TourProvider } from "./context/TourContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { MaintenanceBanner } from "./components/MaintenanceBanner";
import { GreetingBanner } from "./components/GreetingBanner";
import AuthPage from "./pages/AuthPage";
import VerifyEmail from "./pages/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import CreateListing from "./pages/CreateListing";
import ListingDetails from "./pages/ListingDetails";
import MyListings from "./pages/MyListings";
import AccountSettings from "./pages/AccountSettings";
import SellerProfile from "./pages/SellerProfile";
import SavedListings from "./pages/SavedListings";
import Offers from "./pages/Offers";
import CompareListings from "./pages/CompareListings";
import SellerAnalytics from "./pages/SellerAnalytics";
import LostFound from "./pages/LostFound";
import LostFoundCreate from "./pages/LostFoundCreate";
import { CompareBar } from "./components/CompareBar";
import { MaintenanceGate } from "./components/MaintenanceGate";
import { AdminRoute } from "./components/AdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
import { AdminDashboard, ListingsManager, UsersManager, ReportsManager, CategoriesManager, WebsiteSettings, MaintenanceManager, Analytics, AdminLogs } from "./pages/admin/AdminPages";
import { LocationsManager, LostFoundManager, AchievementsManager, OffersManager, CommunityStats } from "./pages/admin/AdminExtraPages";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsOfService from "./pages/legal/TermsOfService";
import CommunityGuidelines from "./pages/legal/CommunityGuidelines";
import AboutUs from "./pages/legal/AboutUs";
import ContactUs from "./pages/legal/ContactUs";
import FAQ from "./pages/legal/FAQ";
import "@/App.css";

const Shell = ({ children }) => (
  <div className="min-h-screen bg-[#F8F9FA]">
    <MaintenanceBanner />
    <Navbar />
    <GreetingBanner />
    <AnimatePresence mode="wait">{children}</AnimatePresence>
    <CompareBar />
    <Footer />
  </div>
);

// Same chrome as Shell, but without auth-only banners — used for the
// public legal/informational pages, which must also be reachable from
// the registration screen before an account exists.
const PublicShell = ({ children }) => (
  <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
    <Navbar />
    <div className="flex-1">
      <AnimatePresence mode="wait">{children}</AnimatePresence>
    </div>
    <Footer />
  </div>
);

function App() {
  return (
    <ThemeProvider>
    <SettingsProvider>
    <AuthProvider>
    <CompareProvider>
      <BrowserRouter>
        <TourProvider>
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

          {/* Public legal & informational pages */}
          <Route path="/privacy" element={<PublicShell><PrivacyPolicy /></PublicShell>} />
          <Route path="/terms" element={<PublicShell><TermsOfService /></PublicShell>} />
          <Route path="/guidelines" element={<PublicShell><CommunityGuidelines /></PublicShell>} />
          <Route path="/about" element={<PublicShell><AboutUs /></PublicShell>} />
          <Route path="/contact" element={<PublicShell><ContactUs /></PublicShell>} />
          <Route path="/faq" element={<PublicShell><FAQ /></PublicShell>} />

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
          <Route
            path="/seller/:uid"
            element={
              <ProtectedRoute>
                <Shell>
                  <SellerProfile />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/saved"
            element={
              <ProtectedRoute>
                <Shell>
                  <SavedListings />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/offers"
            element={
              <ProtectedRoute>
                <Shell>
                  <Offers />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/compare"
            element={
              <ProtectedRoute>
                <Shell>
                  <CompareListings />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Shell>
                  <SellerAnalytics />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/lost-found"
            element={
              <ProtectedRoute>
                <Shell>
                  <LostFound />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/lost-found/new"
            element={
              <ProtectedRoute>
                <Shell>
                  <LostFoundCreate />
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
            <Route path="locations" element={<LocationsManager />} />
            <Route path="offers" element={<OffersManager />} />
            <Route path="lost-found" element={<LostFoundManager />} />
            <Route path="achievements" element={<AchievementsManager />} />
            <Route path="community" element={<CommunityStats />} />
            <Route path="settings" element={<WebsiteSettings />} />
            <Route path="maintenance" element={<MaintenanceManager />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="logs" element={<AdminLogs />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes></MaintenanceGate>
        </TourProvider>
      </BrowserRouter>
    </CompareProvider>
    </AuthProvider>
    </SettingsProvider>
    </ThemeProvider>
  );
}

export default App;
