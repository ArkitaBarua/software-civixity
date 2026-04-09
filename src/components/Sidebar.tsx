
import { NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Users, 
  Gift, 
  Map, 
  Award, 
  FileText,
  PieChart,
  BarChart2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const Sidebar = ({ collapsed, setSidebarCollapsed }: SidebarProps) => {
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: "Home", path: "/platform" },
    { icon: Users, label: "Volunteer Activities", path: "/platform/volunteer" },
    { icon: Gift, label: "Redeem Points", path: "/platform/redeem" },
    { icon: Map, label: "Heatmaps & Insights", path: "/platform/heatmaps" },
    { icon: Award, label: "Badges & Achievements", path: "/platform/badges" },
    { icon: FileText, label: "Documents", path: "/platform/documents" },
    { icon: [BarChart2], label: "Polls", path: "/platform/polls" },
    // Test harness menu item
    { icon: FileText, label: "Testing", path: "/platform/testing" },
  ];

  const isActive = (path: string) => {
    if (path === "/platform") {
      return location.pathname === "/platform";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 z-40 ${
        collapsed ? 'w-16' : 'w-64'
      } hidden lg:block`}>
        {/* Collapse Toggle */}
        <div className="flex justify-end p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!collapsed)}
            className="h-8 w-8"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation Menu */}
        <nav className="px-2 pb-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === "/platform"}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {Array.isArray(item.icon) ? (
                    <span className="flex items-center gap-1">
                      {item.icon.map((IconComp, idx) => (
                        <IconComp key={idx} className="h-5 w-5 flex-shrink-0" />
                      ))}
                    </span>
                  ) : (
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                  )}
                  {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <div className={`lg:hidden fixed inset-0 z-50 ${collapsed ? 'hidden' : 'block'}`}>
        <div 
          className="absolute inset-0 bg-black/50"
          onClick={() => setSidebarCollapsed(true)}
        />
        <aside className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
          <div className="p-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                  Civixity
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarCollapsed(true)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>

            <nav>
              <ul className="space-y-2">
                {menuItems.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      end={item.path === "/platform"}
                      onClick={() => setSidebarCollapsed(true)}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive(item.path)
                          ? 'bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {Array.isArray(item.icon) ? (
                        <span className="flex items-center gap-1">
                          {item.icon.map((IconComp, idx) => (
                            <IconComp key={idx} className="h-5 w-5 flex-shrink-0" />
                          ))}
                        </span>
                      ) : (
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                      )}
                      <span className="text-sm font-medium">{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>
      </div>
    </>
  );
};

export default Sidebar;
