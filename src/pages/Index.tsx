
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

const Index = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [employees, jobSites, attendance, reports] = await Promise.all([
        supabase.from('employees').select('*', { count: 'exact' }),
        supabase.from('job_sites').select('*', { count: 'exact' }),
        supabase.from('attendance').select('*', { count: 'exact' }),
        supabase.from('pay_report_view').select('total_pay', { count: 'exact' })
      ]);

      const totalPayroll = reports.data?.reduce((sum, record) => sum + (record.total_pay || 0), 0) || 0;

      return {
        employees: employees.count || 0,
        jobSites: jobSites.count || 0,
        attendance: attendance.count || 0,
        totalPayroll
      };
    }
  });

  const quickStats = [
    {
      title: 'Total Employees',
      value: stats?.employees || 0,
      icon: Users,
      color: 'bg-blue-500',
      trend: '+12%',
      description: 'Active workforce'
    },
    {
      title: 'Active Job Sites',
      value: stats?.jobSites || 0,
      icon: MapPin,
      color: 'bg-green-500',
      trend: '+8%',
      description: 'Current projects'
    },
    {
      title: 'Attendance Records',
      value: stats?.attendance || 0,
      icon: Clock,
      color: 'bg-orange-500',
      trend: '+25%',
      description: 'This month'
    },
    {
      title: 'Total Payroll',
      value: `$${(stats?.totalPayroll || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-purple-500',
      trend: '+15%',
      description: 'Monthly total'
    }
  ];

  const quickActions = [
    { title: 'Add Employee', icon: Users, href: '/employees', color: 'bg-blue-50 hover:bg-blue-100 text-blue-700' },
    { title: 'New Job Site', icon: MapPin, href: '/job-sites', color: 'bg-green-50 hover:bg-green-100 text-green-700' },
    { title: 'Mark Attendance', icon: Clock, href: '/attendance', color: 'bg-orange-50 hover:bg-orange-100 text-orange-700' },
    { title: 'Generate Report', icon: BarChart3, href: '/reports', color: 'bg-purple-50 hover:bg-purple-100 text-purple-700' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-yellow-500 text-white p-8 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">ConstructCo Dashboard</h1>
            <p className="text-orange-100 text-lg">
              Streamline your construction management operations
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              <Activity className="w-4 h-4 mr-1" />
              Live Updates
            </Badge>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <Badge variant="secondary" className="text-green-700 bg-green-100 border-green-200">
                      {stat.trend}
                    </Badge>
                    <span className="text-sm text-gray-500 ml-2">{stat.description}</span>
                  </div>
                </div>
                <div className={`${stat.color} p-3 rounded-xl`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gray-50 rounded-t-lg">
          <CardTitle className="text-xl text-gray-800">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="ghost"
                className={`h-20 ${action.color} transition-all duration-200 hover:scale-105`}
                onClick={() => window.location.href = action.href}
              >
                <div className="flex flex-col items-center space-y-2">
                  <action.icon className="w-6 h-6" />
                  <span className="font-medium">{action.title}</span>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-blue-50 rounded-t-lg">
            <CardTitle className="text-lg text-blue-800 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Project Completion Rate</span>
                <Badge className="bg-green-100 text-green-800">92%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Average Attendance</span>
                <Badge className="bg-blue-100 text-blue-800">87%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Safety Score</span>
                <Badge className="bg-orange-100 text-orange-800">95%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-green-50 rounded-t-lg">
            <CardTitle className="text-lg text-green-800 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Project Alpha - Phase 2</span>
                <Badge variant="destructive">3 days</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Safety Training Renewal</span>
                <Badge className="bg-yellow-100 text-yellow-800">1 week</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Equipment Maintenance</span>
                <Badge className="bg-blue-100 text-blue-800">2 weeks</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
