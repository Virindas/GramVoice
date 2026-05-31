import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./app/landing/page";
import LoginPage from "./app/login/page";
import OTPVerificationPage from "./app/otp-verify/page";
import SplashPage from "./app/splash/page";
import LanguagePage from "./app/language/page";
import VillagerDashboard from "./app/villager-dashboard/page";
import AdminDashboard from "./app/admin-dashboard/page";
import RecordComplaint from "./app/record-complaint/page";
import TrackComplaint from "./app/track-complaint/page";
import EmergencySOS from "./app/emergency/page";
import GovernmentSchemes from "./app/schemes/page";
import VillageAnnouncements from "./app/announcements/page";
import EmergencyContacts from "./app/emergency-contacts/page";
import MarketplaceTimings from "./app/marketplace/page";
import ProfileSettings from "./app/profile/page";
import AIVoiceAssistant from "./app/ai-assistant/page";
import VillageRulebook from "./app/rulebook/page";
import ImportantContacts from "./app/important-contacts/page";
import VillageServices from "./app/village-services/page";
import ServiceRequest from "./app/service-request/page";
import HelpSupport from "./app/help-support/page";

// Phase 4 - Advanced Modules
import SmartAnalytics from "./app/smart-analytics/page";
import CommunityEvents from "./app/community-events/page";
import DigitalDocuments from "./app/documents/page";
import VoiceHub from "./app/voice-hub/page";
import CommunityProfile from "./app/community-profile/page";
import SystemStatus from "./app/system-status/page";

// Phase 5 - Panchayat Admin Portal Expansion
import AdminComplaints from "./app/admin-complaints/page";
import AdminProfile from "./app/admin-profile/page";
import AnnouncementManagement from "./app/announcement-management/page";
import OperationsControl from "./app/operations-control/page";
import EmergencyControl from "./app/emergency-control/page";
import AdminAnalytics from "./app/admin-analytics/page";
import AdminDirectoryRules from "./app/admin-directory-rules/page";

import { getUser } from "./lib/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  role: 'villager' | 'admin';
}

function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const user = getUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== role) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/splash" replace />} />
        <Route path="/splash" element={<SplashPage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/language" element={<LanguagePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/otp-verify" element={<OTPVerificationPage />} />
        
        {/* Protected Villager Routes */}
        <Route path="/villager-dashboard" element={<ProtectedRoute role="villager"><VillagerDashboard /></ProtectedRoute>} />
        <Route path="/record-complaint" element={<ProtectedRoute role="villager"><RecordComplaint /></ProtectedRoute>} />
        <Route path="/track-complaint" element={<ProtectedRoute role="villager"><TrackComplaint /></ProtectedRoute>} />
        <Route path="/emergency" element={<ProtectedRoute role="villager"><EmergencySOS /></ProtectedRoute>} />
        <Route path="/schemes" element={<ProtectedRoute role="villager"><GovernmentSchemes /></ProtectedRoute>} />
        <Route path="/announcements" element={<ProtectedRoute role="villager"><VillageAnnouncements /></ProtectedRoute>} />
        <Route path="/emergency-contacts" element={<ProtectedRoute role="villager"><EmergencyContacts /></ProtectedRoute>} />
        <Route path="/marketplace" element={<ProtectedRoute role="villager"><MarketplaceTimings /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute role="villager"><ProfileSettings /></ProtectedRoute>} />
        <Route path="/ai-assistant" element={<ProtectedRoute role="villager"><AIVoiceAssistant /></ProtectedRoute>} />
        <Route path="/rulebook" element={<ProtectedRoute role="villager"><VillageRulebook /></ProtectedRoute>} />
        <Route path="/important-contacts" element={<ProtectedRoute role="villager"><ImportantContacts /></ProtectedRoute>} />
        <Route path="/village-services" element={<ProtectedRoute role="villager"><VillageServices /></ProtectedRoute>} />
        <Route path="/service-request" element={<ProtectedRoute role="villager"><ServiceRequest /></ProtectedRoute>} />
        <Route path="/help-support" element={<ProtectedRoute role="villager"><HelpSupport /></ProtectedRoute>} />
        
        {/* Phase 4 Protected Villager Routes */}
        <Route path="/community-events" element={<ProtectedRoute role="villager"><CommunityEvents /></ProtectedRoute>} />
        <Route path="/documents" element={<ProtectedRoute role="villager"><DigitalDocuments /></ProtectedRoute>} />
        <Route path="/voice-hub" element={<ProtectedRoute role="villager"><VoiceHub /></ProtectedRoute>} />
        <Route path="/community-profile" element={<ProtectedRoute role="villager"><CommunityProfile /></ProtectedRoute>} />
        <Route path="/system-status" element={<ProtectedRoute role="villager"><SystemStatus /></ProtectedRoute>} />

        {/* Protected Admin Routes */}
        <Route path="/admin-dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin-complaints" element={<ProtectedRoute role="admin"><AdminComplaints /></ProtectedRoute>} />
        <Route path="/admin-profile" element={<ProtectedRoute role="admin"><AdminProfile /></ProtectedRoute>} />
        <Route path="/announcement-management" element={<ProtectedRoute role="admin"><AnnouncementManagement /></ProtectedRoute>} />
        <Route path="/operations-control" element={<ProtectedRoute role="admin"><OperationsControl /></ProtectedRoute>} />
        <Route path="/emergency-control" element={<ProtectedRoute role="admin"><EmergencyControl /></ProtectedRoute>} />
        <Route path="/admin-analytics" element={<ProtectedRoute role="admin"><AdminAnalytics /></ProtectedRoute>} />
        <Route path="/admin-directory-rules" element={<ProtectedRoute role="admin"><AdminDirectoryRules /></ProtectedRoute>} />
        <Route path="/smart-analytics" element={<ProtectedRoute role="admin"><SmartAnalytics /></ProtectedRoute>} />

        <Route path="/dashboard" element={<Navigate to="/landing" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;