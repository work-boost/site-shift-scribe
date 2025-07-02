
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import EmployeesPage from "@/pages/EmployeesPage";
import JobSitesPage from "@/pages/JobSitesPage";
import AttendancePage from "@/pages/AttendancePage";
import ReportsPage from "@/pages/ReportsPage";
import WeeklyReportPage from "@/pages/WeeklyReportPage";
import MasterReportPage from "@/pages/MasterReportPage";
import RateCardsPage from "@/pages/RateCardsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner 
        position="top-right" 
        toastOptions={{
          style: {
            background: 'linear-gradient(135deg, #fed7aa 0%, #fef3c7 100%)',
            border: '2px solid #fb923c',
            color: '#9a3412',
            fontWeight: '600',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(251, 146, 60, 0.3)',
          },
        }}
      />
      <BrowserRouter>
        <AuthProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/employees" element={<EmployeesPage />} />
              <Route path="/job-sites" element={<JobSitesPage />} />
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/reports/weekly" element={<WeeklyReportPage />} />
              <Route path="/reports/master" element={<MasterReportPage />} />
              <Route path="/rate-cards" element={<RateCardsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
