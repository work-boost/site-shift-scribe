
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MapPin, Clock, DollarSign } from 'lucide-react';

interface DashboardStats {
  totalEmployees: number;
  totalPMs: number;
  totalJobSites: number;
  activeJobSites: number;
  todayAttendance: number;
  weeklyHours: number;
}

const DashboardCards = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    totalPMs: 0,
    totalJobSites: 0,
    activeJobSites: 0,
    todayAttendance: 0,
    weeklyHours: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Get employee counts
      const { data: employees } = await supabase
        .from('employees')
        .select('type');

      const totalEmployees = employees?.length || 0;
      const totalPMs = employees?.filter(emp => emp.type === 'PM').length || 0;

      // Get job site counts
      const { data: jobSites } = await supabase
        .from('job_sites')
        .select('status');

      const totalJobSites = jobSites?.length || 0;
      const activeJobSites = jobSites?.filter(site => site.status === 'Active').length || 0;

      // Get today's attendance
      const today = new Date().toISOString().split('T')[0];
      const { data: todayAttendanceData } = await supabase
        .from('attendance')
        .select('id')
        .eq('date', today);

      const todayAttendance = todayAttendanceData?.length || 0;

      // Get this week's total hours
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekStartStr = weekStart.toISOString().split('T')[0];

      const { data: weeklyAttendance } = await supabase
        .from('attendance')
        .select('shift_hours')
        .gte('date', weekStartStr);

      const weeklyHours = weeklyAttendance?.reduce((total, record) => 
        total + (parseFloat(record.shift_hours) || 0), 0) || 0;

      setStats({
        totalEmployees,
        totalPMs,
        totalJobSites,
        activeJobSites,
        todayAttendance,
        weeklyHours,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Project Managers',
      value: stats.totalPMs,
      icon: Users,
      color: 'bg-green-500',
    },
    {
      title: 'Total Job Sites',
      value: stats.totalJobSites,
      icon: MapPin,
      color: 'bg-purple-500',
    },
    {
      title: 'Active Job Sites',
      value: stats.activeJobSites,
      icon: MapPin,
      color: 'bg-orange-500',
    },
    {
      title: "Today's Attendance",
      value: stats.todayAttendance,
      icon: Clock,
      color: 'bg-red-500',
    },
    {
      title: 'Weekly Hours',
      value: Math.round(stats.weeklyHours * 10) / 10,
      icon: DollarSign,
      color: 'bg-indigo-500',
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={`${card.color} p-2 rounded-lg`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DashboardCards;
