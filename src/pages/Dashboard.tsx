
import DashboardCards from '@/components/dashboard/DashboardCards';
import { Construction } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center gap-3">
          <Construction className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold">ConstructCo Dashboard</h1>
            <p className="text-orange-100">
              Welcome to your construction management system
            </p>
          </div>
        </div>
      </div>
      
      <DashboardCards />
    </div>
  );
};

export default Dashboard;
