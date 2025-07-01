
import { useState } from 'react';
import JobSiteForm from '@/components/jobsites/JobSiteForm';
import JobSiteList from '@/components/jobsites/JobSiteList';

const JobSitesPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingJobSite, setEditingJobSite] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAdd = () => {
    setEditingJobSite(null);
    setShowForm(true);
  };

  const handleEdit = (jobSite: any) => {
    setEditingJobSite(jobSite);
    setShowForm(true);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditingJobSite(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingJobSite(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Job Sites</h2>
        <p className="text-muted-foreground">
          Manage construction job sites and projects
        </p>
      </div>
      
      {showForm ? (
        <JobSiteForm
          jobSite={editingJobSite}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      ) : (
        <JobSiteList
          onEdit={handleEdit}
          onAdd={handleAdd}
          refreshTrigger={refreshTrigger}
        />
      )}
    </div>
  );
};

export default JobSitesPage;
