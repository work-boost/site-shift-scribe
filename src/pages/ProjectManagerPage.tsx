
import ProjectManagerList from '@/components/projectmanager/ProjectManagerList';

const ProjectManagerPage = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-500 to-blue-500 p-6 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold tracking-tight text-white">Project Manager List</h2>
        <p className="text-indigo-100 mt-2">
          Manage project managers and their assignments
        </p>
      </div>
      
      <ProjectManagerList />
    </div>
  );
};

export default ProjectManagerPage;
