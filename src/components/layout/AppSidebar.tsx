
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  MapPin, 
  Clock, 
  FileText, 
  CreditCard,
  HardHat,
  LogOut,
  Menu
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const menuItems = [
  { title: 'Dashboard', url: '/', icon: Home },
  { title: 'Employees', url: '/employees', icon: Users },
  { title: 'Job Sites', url: '/job-sites', icon: MapPin },
  { title: 'Attendance', url: '/attendance', icon: Clock },
  { title: 'Rate Cards', url: '/rate-cards', icon: CreditCard },
  { title: 'Reports', url: '/reports', icon: FileText },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to log out');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar className="border-r border-orange-200 bg-gradient-to-b from-orange-100 to-yellow-100">
      <SidebarHeader className="border-b border-orange-200 p-4">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500 p-2 rounded-lg">
            <HardHat className="h-6 w-6 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="font-bold text-orange-900 text-lg">ConstructCo</h1>
              <p className="text-xs text-orange-600">Management System</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-orange-700 font-semibold">
            {!isCollapsed && 'Main Menu'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                          isActive
                            ? 'bg-orange-500 text-white shadow-lg'
                            : 'text-orange-800 hover:bg-orange-200 hover:text-orange-900'
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        {!isCollapsed && <span className="font-medium">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-orange-200 p-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="bg-orange-500 hover:bg-orange-600 text-white">
            <Menu className="h-4 w-4" />
          </SidebarTrigger>
          {!isCollapsed && (
            <Button
              onClick={handleSignOut}
              disabled={isLoggingOut}
              variant="ghost"
              className="flex-1 justify-start text-orange-800 hover:bg-orange-200 hover:text-orange-900"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
