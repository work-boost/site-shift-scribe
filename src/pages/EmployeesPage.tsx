
import { useState } from 'react';
import EmployeeForm from '@/components/employees/EmployeeForm';
import EmployeeList from '@/components/employees/EmployeeList';

const EmployeesPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAdd = () => {
    setEditingEmployee(null);
    setShowForm(true);
  };

  const handleEdit = (employee: any) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditingEmployee(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEmployee(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Employees</h2>
        <p className="text-muted-foreground">
          Manage your construction team members
        </p>
      </div>
      
      {showForm ? (
        <EmployeeForm
          employee={editingEmployee}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      ) : (
        <EmployeeList
          onEdit={handleEdit}
          onAdd={handleAdd}
          refreshTrigger={refreshTrigger}
        />
      )}
    </div>
  );
};

export default EmployeesPage;
