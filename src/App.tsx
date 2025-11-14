import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { BrandLogin } from "./pages/BrandLogin";
import { BrandSignup } from "./pages/BrandSignup";
import { BrandDashboard } from "./pages/BrandDashboard";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<BrandLogin />} />
        <Route path="/signup" element={<BrandSignup />} />
        <Route path="/dashboard" element={<BrandDashboard />} />
        <Route path="/campaigns" element={<div className="text-center text-xl p-8">Campaigns Page - Coming Soon</div>} />
        <Route path="/influencers" element={<div className="text-center text-xl p-8">Influencers Page - Coming Soon</div>} />
        <Route path="/wallet" element={<div className="text-center text-xl p-8">Wallet Page - Coming Soon</div>} />
        <Route path="/settings" element={<div className="text-center text-xl p-8">Settings Page - Coming Soon</div>} />
      </Routes>
    </Router>
  );
}
