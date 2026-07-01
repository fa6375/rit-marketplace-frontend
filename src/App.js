import { maintenanceMode } from './maintenanceConfig';
import MaintenancePage from './MaintenancePage';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import AuthPage from "./pages/AuthPage";
import VerifyEmail from "./pages/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import CreateListing from "./pages/CreateListing";
import ListingDetails from "./pages/ListingDetails";
import MyListings from "./pages/MyListings";
import AccountSettings from "./pages/AccountSettings";
import "@/App.css";

const Shell = ({ children }) => (
  <div className="min-h-screen bg-[#F8F9FA]">
    <Navbar />
    <AnimatePresence mode="wait">{children}</AnimatePresence>
    <Footer />
  </div>
);

function App() {
 if(maintenanceMode) return <MaintenancePage/>;

  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          richColors
          position="top-center"
          toastOptions={{
            style: { borderRadius: "12px", fontFamily: "inherit" },
          }}
        />
        <Routes>
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
