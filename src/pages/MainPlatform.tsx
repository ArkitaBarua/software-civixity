import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ChatBot from "@/components/ChatBot";
import { supabase } from "@/lib/supabaseClient";

const MainPlatform = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user ?? null);
      setLoading(false);
    });
    return () => listener?.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && !user) navigate('/');
  }, [user, loading]);

  return (
    <div className="min-h-screen">
      <Navbar 
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        user={user}
      />
      
      <div className="flex">
        <Sidebar collapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />
        <main
          className={`flex-1 transition-all duration-300 pt-16 ${
            sidebarCollapsed ? 'ml-0 lg:ml-16' : 'ml-0 lg:ml-64'
          }`}
        >
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
      <ChatBot />
    </div>
  );
};

export default MainPlatform;