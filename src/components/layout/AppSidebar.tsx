
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
  BarChart3,
  Building2,
  UserCheck,
  User
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
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-orange-100 text-orange-700 font-semibold border-r-4 border-orange-500" : "hover:bg-orange-50 text-orange-600";

  return (
    <Sidebar className={state === "collapsed" ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-gradient-to-b from-orange-50 to-yellow-50">
        <SidebarGroup>
          <SidebarGroupLabel className="text-orange-800 font-bold text-lg">
            {state !== "collapsed" && "ConstructCo"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/" className={getNavCls}>
                    <Home className="mr-3 h-5 w-5" />
                    {state !== "collapsed" && <span>Dashboard</span>}
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

              <Collapsible>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="hover:bg-orange-50 text-orange-600">
                    <BarChart3 className="mr-3 h-5 w-5" />
                    {state !== "collapsed" && <span>Reports</span>}
                    {state !== "collapsed" && <ChevronDown className="ml-auto h-4 w-4" />}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenu className="ml-6 space-y-1">
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild size="sm">
                        <NavLink to="/reports" className={getNavCls}>
                          <FileText className="mr-2 h-4 w-4" />
                          {state !== "collapsed" && <span>Payroll Reports</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild size="sm">
                        <NavLink to="/weekly-reports" className={getNavCls}>
                          <Calendar className="mr-2 h-4 w-4" />
                          {state !== "collapsed" && <span>Weekly Reports</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild size="sm">
                        <NavLink to="/master-reports" className={getNavCls}>
                          <BarChart3 className="mr-2 h-4 w-4" />
                          {state !== "collapsed" && <span>Master Reports</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild size="sm">
                        <NavLink to="/employee-reports" className={getNavCls}>
                          <User className="mr-2 h-4 w-4" />
                          {state !== "collapsed" && <span>Employee Reports</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
