
import DashboardCards from '@/components/dashboard/DashboardCards';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your construction management system
        </p>
      </div>
      <DashboardCards />
    </div>
  );
};

export default Dashboard;
