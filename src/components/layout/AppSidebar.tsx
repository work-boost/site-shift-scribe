
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
  Menu,
  ChevronDown,
  ChevronRight,
  Calendar,
  BarChart3
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const menuItems = [
  { title: 'Dashboard', url: '/', icon: Home },
  { title: 'Employees', url: '/employees', icon: Users },
  { title: 'Job Sites', url: '/job-sites', icon: MapPin },
  { title: 'Attendance', url: '/attendance', icon: Clock },
  { title: 'Rate Cards', url: '/rate-cards', icon: CreditCard },
];

const reportsSubItems = [
  { title: 'Payroll Report', url: '/reports', icon: FileText },
  { title: 'Weekly Report', url: '/reports/weekly', icon: Calendar },
  { title: 'Master Report', url: '/reports/master', icon: BarChart3 },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(location.pathname.startsWith('/reports'));

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
    <Sidebar className="border-r-2 border-orange-300 bg-gradient-to-b from-orange-50 via-orange-100 to-yellow-50 shadow-xl">
      <SidebarHeader className="border-b-2 border-orange-300 p-6 bg-gradient-to-r from-orange-500 to-yellow-500">
        <div className="flex items-center gap-4">
          <div className="bg-white p-3 rounded-xl shadow-lg">
            <HardHat className="h-8 w-8 text-orange-600" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="font-bold text-white text-xl tracking-wide">ConstructCo</h1>
              <p className="text-sm text-orange-100 font-medium">Management System</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-orange-800 font-bold text-sm uppercase tracking-wide mb-3">
            {!isCollapsed && 'Main Menu'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                          isActive
                            ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg transform scale-105'
                            : 'text-orange-800 hover:bg-orange-200 hover:text-orange-900 hover:shadow-md'
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        {!isCollapsed && <span className="font-semibold">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              
              {/* Reports with sub-menu */}
              <SidebarMenuItem>
                <Collapsible open={reportsOpen} onOpenChange={setReportsOpen}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-300 w-full ${
                      location.pathname.startsWith('/reports')
                        ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg'
                        : 'text-orange-800 hover:bg-orange-200 hover:text-orange-900 hover:shadow-md'
                    }`}>
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5" />
                        {!isCollapsed && <span className="font-semibold">Reports</span>}
                      </div>
                      {!isCollapsed && (
                        reportsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  {!isCollapsed && (
                    <CollapsibleContent>
                      <SidebarMenuSub className="ml-4 mt-2 space-y-1">
                        {reportsSubItems.map((subItem) => {
                          const isSubActive = location.pathname === subItem.url;
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild>
                                <NavLink
                                  to={subItem.url}
                                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                                    isSubActive
                                      ? 'bg-orange-400 text-white shadow-md'
                                      : 'text-orange-700 hover:bg-orange-150 hover:text-orange-900'
                                  }`}
                                >
                                  <subItem.icon className="h-4 w-4" />
                                  <span className="font-medium text-sm">{subItem.title}</span>
                                </NavLink>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  )}
                </Collapsible>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t-2 border-orange-300 p-4 bg-gradient-to-r from-orange-100 to-yellow-100">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white shadow-lg rounded-lg p-2">
            <Menu className="h-4 w-4" />
          </SidebarTrigger>
          {!isCollapsed && (
            <Button
              onClick={handleSignOut}
              disabled={isLoggingOut}
              variant="ghost"
              className="flex-1 justify-start text-orange-800 hover:bg-orange-200 hover:text-orange-900 rounded-lg font-semibold"
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
