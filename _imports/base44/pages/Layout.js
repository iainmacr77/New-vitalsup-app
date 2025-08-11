import React from "react";
import { useLocation } from "react-router-dom";
import AppShell from "./components/app-shell/AppShell";
import { NAV_ITEMS } from "./components/app-shell/types";
import { User } from "@/entities/User";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await User.me();
        setUser({ 
          name: userData.full_name, 
          email: userData.email 
          // avatarUrl could be added here if it exists on the User entity
        });
      } catch (error) {
        // User not authenticated or error loading
        setUser({
          name: 'Guest User',
          email: 'guest@example.com'
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-purple-400 to-blue-400"></div>
        </div>
      </div>
    );
  }

  return (
    <AppShell
      nav={NAV_ITEMS}
      user={user}
      currentRoute={location.pathname}
      planLabel="Free"
    >
      {children}
    </AppShell>
  );
}
