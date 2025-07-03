
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Search, Upload, FileText, Image } from 'lucide-react';
import ProjectManagerForm from './ProjectManagerForm';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface ProjectManager {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile_number: string;
  type: string;
  sst_number: string;
  sst_image_url: string;
  assigned_sites: Array<{
    id: string;
    name: string;
    address: string;
    status: string;
  }>;
}

const ProjectManagerList = () => {
  const [projectManagers, setProjectManagers] = useState<ProjectManager[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchProjectManagers();
  }, [searchTerm]);

  const fetchProjectManagers = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('employees')
        .select(`
          *,
          assigned_sites:job_sites!job_sites_assigned_pm_fkey(id, name, address, status)
        `)
        .eq('type', 'PM')
        .order('last_name');

      if (searchTerm) {
        query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProjectManagers(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch project managers');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuccess = () => {
    setShowForm(false);
    fetchProjectManagers();
  };

  const exportToExcel = () => {
    const exportData = projectManagers.map(pm => ({
      'Full Name': `${pm.first_name} ${pm.last_name}`,
      'Email': pm.email || 'N/A',
      'Mobile Number': pm.mobile_number || 'N/A',
      'Type': pm.type,
      'SST Number': pm.sst_number || 'N/A',
      'Assigned Sites': pm.assigned_sites?.map(site => site.name).join(', ') || 'None',
      'Active Sites': pm.assigned_sites?.filter(site => site.status === 'Active').length || 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Project Managers');
    
    const fileName = `project_managers_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    toast.success('Excel file downloaded successfully');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Project Manager List', 14, 22);
    
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);

    const tableData = projectManagers.map(pm => [
      `${pm.first_name} ${pm.last_name}`,
      pm.email || 'N/A',
      pm.type,
      pm.mobile_number || 'N/A',
      pm.sst_number || 'N/A',
      pm.assigned_sites?.length || 0,
    ]);

    (doc as any).autoTable({
      head: [['Full Name', 'Email', 'Type', 'Mobile', 'SST', 'Sites']],
      body: tableData,
      startY: 40,
    });

    doc.save(`project_managers_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('PDF file downloaded successfully');
  };

  if (showForm) {
    return <ProjectManagerForm onSuccess={handleAddSuccess} onCancel={() => setShowForm(false)} />;
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">Loading project managers...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-indigo-300 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-t-lg">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold">PROJECT MANAGER LIST</CardTitle>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={exportToExcel} className="bg-white text-indigo-600 hover:bg-gray-100">
              <Upload className="h-4 w-4 mr-2" />
              Export to Excel
            </Button>
            <Button variant="secondary" onClick={exportToPDF} className="bg-white text-indigo-600 hover:bg-gray-100">
              <FileText className="h-4 w-4 mr-2" />
              Export to PDF
            </Button>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-indigo-700 hover:bg-indigo-800"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Project Manager
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 border-2 border-indigo-200 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto border-2 border-indigo-200 rounded-xl shadow-lg">
          <Table>
            <TableHeader className="bg-gradient-to-r from-indigo-100 to-blue-100">
              <TableRow>
                <TableHead className="text-indigo-800 font-bold">Full Name</TableHead>
                <TableHead className="text-indigo-800 font-bold">Site Name</TableHead>
                <TableHead className="text-indigo-800 font-bold">Email</TableHead>
                <TableHead className="text-indigo-800 font-bold">Type</TableHead>
                <TableHead className="text-indigo-800 font-bold">Mobile Number</TableHead>
                <TableHead className="text-indigo-800 font-bold">SST</TableHead>
                <TableHead className="text-indigo-800 font-bold">Osho Image</TableHead>
                <TableHead className="text-indigo-800 font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projectManagers.map((pm) => (
                <TableRow key={pm.id} className="hover:bg-indigo-50 transition-colors">
                  <TableCell className="font-semibold text-indigo-900">
                    {pm.first_name} {pm.last_name}
                  </TableCell>
                  <TableCell>
                    <div className="bg-cyan-400 text-white px-3 py-1 rounded text-center font-medium">
                      {pm.assigned_sites?.[0]?.address || 'No site assigned'}
                    </div>
                  </TableCell>
                  <TableCell className="text-indigo-700">
                    {pm.email || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                      {pm.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-indigo-700">
                    {pm.mobile_number || 'N/A'}
                  </TableCell>
                  <TableCell className="text-indigo-700">
                    {pm.sst_number || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {pm.sst_image_url ? (
                      <div className="w-12 h-8 bg-gray-200 border rounded flex items-center justify-center">
                        <Image className="h-4 w-4 text-gray-500" />
                      </div>
                    ) : (
                      <div className="w-12 h-8 bg-gray-100 border rounded flex items-center justify-center">
                        <span className="text-xs text-gray-400">No Image</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-indigo-600 hover:bg-indigo-100"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        className="bg-cyan-500 hover:bg-cyan-600 text-white"
                        size="sm"
                      >
                        Active
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {projectManagers.length === 0 && (
          <div className="text-center py-8 text-indigo-600">
            No project managers found.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectManagerList;
