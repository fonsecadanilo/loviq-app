import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "./contexts/SidebarContext";
import { AuthProvider } from "./contexts/AuthContext";
import { UserProfileProvider } from "./contexts/UserProfileContext";
import { LandingPage } from "./pages/LandingPage";
import Campaigns from "./pages/Campaigns";
import { AuthPage } from "./pages/AuthPage";
import { AuthCallback } from "./pages/AuthCallback";
import { OnboardingPage } from "./pages/OnboardingPage";
import { BrandDashboard } from "./pages/BrandDashboard";
import { CreateCampaign } from "./components/campaign/CreateCampaign";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

import { Influencers } from "./pages/Influencers";
import { Wallet } from "./pages/Wallet";
import { StoreIntegration } from "./pages/StoreIntegration";
import { Chat } from "./pages/Chat";
import { ShopifyCallback } from "./pages/ShopifyCallback";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <UserProfileProvider>
          <SidebarProvider>
            <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AuthPage initialView="login" />} />
            <Route path="/signup" element={<AuthPage initialView="register" />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            {/* Protected routes */}
            <Route path="/onboarding" element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <BrandDashboard />
              </ProtectedRoute>
            } />
            <Route path="/campaigns" element={
              <ProtectedRoute>
                <Campaigns />
              </ProtectedRoute>
            } />
            <Route path="/campaigns/create" element={
              <ProtectedRoute>
                <CreateCampaign />
              </ProtectedRoute>
            } />
            <Route path="/influencers" element={
              <ProtectedRoute>
                <Influencers />
              </ProtectedRoute>
            } />
            <Route path="/wallet" element={
              <ProtectedRoute>
                <Wallet />
              </ProtectedRoute>
            } />
            <Route path="/store-integration" element={
              <ProtectedRoute>
                <StoreIntegration />
              </ProtectedRoute>
            } />
            <Route path="/shopify/callback" element={
              <ProtectedRoute>
                <ShopifyCallback />
              </ProtectedRoute>
            } />
            <Route path="/chat" element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <div className="text-center text-xl p-8">Settings Page - Coming Soon</div>
              </ProtectedRoute>
            } />
            </Routes>
          </SidebarProvider>
        </UserProfileProvider>
      </AuthProvider>
    </Router>
  );
}
