
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  MapPin, 
  Clock, 
  CreditCard, 
  TrendingUp, 
  Calendar,
  BarChart3,
  Activity,
  DollarSign,
  UserCheck
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import DashboardCards from '@/components/dashboard/DashboardCards';

const Index = () => {
  const quickActions = [
    { title: 'Add Employee', icon: Users, href: '/employees', color: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200' },
    { title: 'New Job Site', icon: MapPin, href: '/job-sites', color: 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200' },
    { title: 'Mark Attendance', icon: Clock, href: '/attendance', color: 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200' },
    { title: 'Generate Report', icon: BarChart3, href: '/reports', color: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200' },
    { title: 'Project Managers', icon: UserCheck, href: '/project-managers', color: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200' },
    { title: 'Rate Cards', icon: CreditCard, href: '/rate-cards', color: 'bg-pink-50 hover:bg-pink-100 text-pink-700 border-pink-200' }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-yellow-500 text-white p-6 sm:p-8 rounded-2xl shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">ConstructCo Dashboard</h1>
            <p className="text-orange-100 text-base sm:text-lg">
              Streamline your construction management operations
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              <Activity className="w-4 h-4 mr-1" />
              Live Updates
            </Badge>
          </div>
        </div>
      </div>

      {/* Dashboard Cards */}
      <DashboardCards />

      {/* Quick Actions */}
      <Card className="border-2 border-orange-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-t-lg">
          <CardTitle className="text-xl text-orange-800">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="ghost"
                className={`h-20 ${action.color} border-2 transition-all duration-200 hover:scale-105 flex flex-col`}
                onClick={() => window.location.href = action.href}
              >
                <action.icon className="w-6 h-6 mb-2" />
                <span className="font-medium text-xs sm:text-sm text-center">{action.title}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-2 border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
            <CardTitle className="text-lg text-blue-800 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Project Completion Rate</span>
                <Badge className="bg-green-100 text-green-800 border-green-200">92%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Average Attendance</span>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">87%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Safety Score</span>
                <Badge className="bg-orange-100 text-orange-800 border-orange-200">95%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg">
            <CardTitle className="text-lg text-green-800 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-gray-600">Project Alpha - Phase 2</span>
                <Badge variant="destructive" className="w-fit">3 days</Badge>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-gray-600">Safety Training Renewal</span>
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 w-fit">1 week</Badge>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-gray-600">Equipment Maintenance</span>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200 w-fit">2 weeks</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
