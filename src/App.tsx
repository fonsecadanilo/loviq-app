import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import Campaigns from "./pages/Campaigns";
import { BrandLogin } from "./pages/BrandLogin";
import { BrandSignup } from "./pages/BrandSignup";
import { BrandDashboard } from "./pages/BrandDashboard";
import { CreateCampaign } from "./components/campaign/CreateCampaign";

import { Influencers } from "./pages/Influencers";
import { OrdersProducts } from "./pages/OrdersProducts";
import { Wallet } from "./pages/Wallet";
import { StoreIntegration } from "./pages/StoreIntegration";
import { Chat } from "./pages/Chat";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<BrandLogin />} />
        <Route path="/signup" element={<BrandSignup />} />
        <Route path="/dashboard" element={<BrandDashboard />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/campaigns/create" element={<CreateCampaign />} />
        <Route path="/orders" element={<OrdersProducts />} />
        <Route path="/influencers" element={<Influencers />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/integrations" element={<StoreIntegration />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/settings" element={<div className="text-center text-xl p-8">Settings Page - Coming Soon</div>} />
      </Routes>
    </Router>
  );
}
