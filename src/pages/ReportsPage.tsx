
import PayrollReport from '@/components/reports/PayrollReport';

const ReportsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
        <p className="text-muted-foreground">
          Generate attendance and payroll reports
        </p>
      </div>
      
      <PayrollReport />
    </div>
  );
};

export default ReportsPage;
