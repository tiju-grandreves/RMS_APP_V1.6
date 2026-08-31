import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Users from './pages/Users';
import AdminDashboard from './pages/AdminDashboard';
import AdminReports from './pages/AdminReports';
import AccountantHome from './pages/AccountantHome';
import { Toaster } from "react-hot-toast";
// import EventManagerRequestsPage from './pages/EventManagerRequestsPage';
import './index.css';
import Profile from './pages/ProfileScreen/profilescreen';
import ResetPassword from './pages/PasswordScreens/ResetPassword';
import UpdatePassword from './pages/PasswordScreens/UpdatePassword';
import ForgetPassword from './pages/PasswordScreens/ForgotPassword';
import ProtectedRoute from './pages/ProtectedRoute';
import { EventCountProvider } from './services/EventCountContext';
import { ShopProvider } from './services/ShopContext';
import NoShopLinkPage from './pages/NoShopLinkPage';
import ShopRootRedirect from './pages/ShopRootRedirect';
import AutoLogoutProvider from './hooks/useAutoLogoutProvider';

// import { ReceptionistDashboard } from './pages/RequestListing';
// import ServiceOfficerHome from './pages/ServiceOffHome';

import WorkflowConfig from './pages/WorkflowConfig';
// import ReceptionistHome from './pages/ReceptionistHome';
import Dashboard from './pages/Dashbord';
import { RequestListing } from './pages/RequestListing';
import ProfileView from './pages/ProfileView';

const DEFAULT_SHOP_SLUG = process.env.REACT_APP_DEFAULT_SHOP_SLUG;

function App() {
  return (
    <EventCountProvider>
      <ShopProvider>
      <Router>
        <AutoLogoutProvider />
        <Toaster position="top-right" reverseOrder={false} />
        <div className="App">
          <Routes>

            {/* Shop-specific bookmarked login link, e.g. /fixit-edappally/login */}
            <Route path="/:shopSlug/login" element={<LoginPage />} />

            {/* Bare shop slug (no /login suffix) - forward to that shop's login */}
            <Route path="/:shopSlug" element={<ShopRootRedirect />} />

            {/* Plain /login has no shop context - show fallback instead of a broken form */}
            <Route path="/login" element={<NoShopLinkPage />} />

            <Route
              path="/"
              element={
                DEFAULT_SHOP_SLUG
                  ? <Navigate to={`/${DEFAULT_SHOP_SLUG}/login`} replace />
                  : <Navigate to="/login" replace />
              }
            />

            <Route
              path="/AdminDashboard"
              element={
                <ProtectedRoute>
                 <Dashboard role="admin" />
                </ProtectedRoute>
              }
            />
           <Route path="/ReceptionistHome" element={<ProtectedRoute><Dashboard role="receptionist" /></ProtectedRoute>} />
<Route path="/ServiceOfficerHome" element={<ProtectedRoute><Dashboard role="serviceOfficer" /></ProtectedRoute>} />
            
                          <Route
                            path="/AccountantHome"
                            element={
                              <ProtectedRoute>
                                <Dashboard role="account manager" />
                              </ProtectedRoute>
                            }
                          />

            {/* Admin fallback */}
            <Route
              // path="/requests"
              path="/RequestListing"
              element={
                <ProtectedRoute>
                  <RequestListing />
                </ProtectedRoute>
              }
            />
<Route path="/ProfileView" element={<ProfileView />} />
            {/* Receptionist */}
            <Route
              path="/RequestListing"
              element={
                <ProtectedRoute>
                  <RequestListing/>
                </ProtectedRoute>
              }
            />

            {/* <Route
              path="/ServiceOfficerHome"
              element={
                <ProtectedRoute>
                <ServiceOfficerHome />
                </ProtectedRoute>
               }
             /> */}

            {/* Service Officer - with tab param */}
            {/* <Route
              path="/eventmanager-requests/:tab"
              element={
                <ProtectedRoute>
                  <EventManagerRequestsPage />
                </ProtectedRoute>
              }
            /> */}

            {/* Service Officer - without tab param (redirects to default tab) */}
            {/* <Route
              path="/eventmanager-requests"
              element={<Navigate to="/eventmanager-requests/pending" replace />}
            /> */}

            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <Users />
                </ProtectedRoute>
              }
            />

            <Route
              path="/AdminReports"
              element={
                <ProtectedRoute>
                  <AdminReports />
                </ProtectedRoute>
              }
            />

            {/* Accountant */}
            {/* <Route
              path="/AccountantHome"
              element={
                <ProtectedRoute>
                  <AccountantHome />
                </ProtectedRoute>
              }
            /> */}

            <Route path="/forgotpassword" element={<ForgetPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/updatepassword" element={<UpdatePassword />} />

          {/* <Route
  path="/ReceptionistHome"
  element={
    <ProtectedRoute>
      <ReceptionistHome />
    </ProtectedRoute>
  }
/> */}
<Route
  path="/WorkflowConfig"
  element={
    <ProtectedRoute>
      <WorkflowConfig />
    </ProtectedRoute>
  }
/>

<Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
      </ShopProvider>
    </EventCountProvider>
  );
}

export default App;