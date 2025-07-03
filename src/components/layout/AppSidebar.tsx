
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  MapPin, 
  Clock, 
  CreditCard,
  UserCheck,
  ChevronDown,
  Calendar,
  BarChart3,
  Building2,
  User,
  FileText
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-orange-100 text-orange-700 font-semibold border-r-4 border-orange-500 shadow-sm" 
      : "hover:bg-orange-50 text-orange-600 hover:text-orange-700 transition-all duration-200";

  const isReportsActive = currentPath.startsWith('/reports') || 
                         currentPath.startsWith('/weekly-reports') || 
                         currentPath.startsWith('/master-reports') || 
                         currentPath.startsWith('/employee-reports');

  return (
    <Sidebar className={state === "collapsed" ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-gradient-to-b from-orange-50 to-yellow-50 border-r border-orange-100">
        <SidebarGroup>
          <SidebarGroupLabel className="text-orange-800 font-bold text-lg px-4 py-3">
            {state !== "collapsed" && (
              <div className="flex items-center">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                ConstructCo
              </div>
            )}
          </SidebarGroupLabel>
          
          <SidebarGroupContent className="px-2">
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/" className={getNavCls}>
                    <Home className="mr-3 h-5 w-5" />
                    {state !== "collapsed" && <span>Dashboard</span>}
                    {state !== "collapsed" && isActive('/') && (
                      <Badge className="ml-auto bg-orange-500 text-white">Live</Badge>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/employees" className={getNavCls}>
                    <Users className="mr-3 h-5 w-5" />
                    {state !== "collapsed" && <span>Employees</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/job-sites" className={getNavCls}>
                    <Building2 className="mr-3 h-5 w-5" />
                    {state !== "collapsed" && <span>Job Sites</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/attendance" className={getNavCls}>
                    <Clock className="mr-3 h-5 w-5" />
                    {state !== "collapsed" && <span>Attendance</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/rate-cards" className={getNavCls}>
                    <CreditCard className="mr-3 h-5 w-5" />
                    {state !== "collapsed" && <span>Rate Cards</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/project-managers" className={getNavCls}>
                    <UserCheck className="mr-3 h-5 w-5" />
                    {state !== "collapsed" && <span>Project Managers</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {state !== "collapsed" && (
                <Collapsible defaultOpen={isReportsActive}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className={`hover:bg-orange-50 text-orange-600 hover:text-orange-700 transition-all duration-200 ${isReportsActive ? 'bg-orange-100 text-orange-700 font-semibold' : ''}`}>
                      <BarChart3 className="mr-3 h-5 w-5" />
                      <span>Reports</span>
                      <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="ml-8 mt-1 space-y-1">
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild size="sm">
                          <NavLink to="/reports" className={getNavCls}>
                            <FileText className="mr-2 h-4 w-4" />
                            <span>Payroll Reports</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild size="sm">
                          <NavLink to="/weekly-reports" className={getNavCls}>
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>Weekly Reports</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild size="sm">
                          <NavLink to="/master-reports" className={getNavCls}>
                            <BarChart3 className="mr-2 h-4 w-4" />
                            <span>Master Reports</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild size="sm">
                          <NavLink to="/employee-reports" className={getNavCls}>
                            <User className="mr-2 h-4 w-4" />
                            <span>Employee Reports</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
