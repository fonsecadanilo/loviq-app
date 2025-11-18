import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { BrandLogin } from "./pages/BrandLogin";
import { BrandSignup } from "./pages/BrandSignup";
import { BrandDashboard } from "./pages/BrandDashboard";
import Chat from "./pages/Chat";
import Campaigns from "./pages/Campaigns";
import OrdersProducts from "./pages/OrdersProducts";
import BrandLayout from "./components/dashboard/BrandLayout";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<BrandLogin />} />
        <Route path="/signup" element={<BrandSignup />} />
        <Route path="/dashboard" element={<BrandDashboard />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/orders-products" element={<OrdersProducts />} />
        <Route path="/live-shop" element={<BrandLayout><div className="text-center text-xl p-8">Live Shop - Coming Soon</div></BrandLayout>} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/settings" element={<BrandLayout><div className="text-center text-xl p-8">Settings - Coming Soon</div></BrandLayout>} />
        <Route path="/activity" element={<div className="text-center text-xl p-8">Activity - Coming Soon</div>} />
        <Route path="/help" element={<div className="text-center text-xl p-8">Help Center - Coming Soon</div>} />
      </Routes>
    </Router>
  );
}
