
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const employeeSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  type: z.enum(['Employee', 'Foreman', 'PM']),
  mobile_number: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  sst_number: z.string().optional(),
  sst_expire_date: z.date().optional(),
  regular_rate: z.number().min(0).default(0),
  overtime_rate: z.number().min(0).default(0),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  employee?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const EmployeeForm = ({ employee, onSuccess, onCancel }: EmployeeFormProps) => {
  const [loading, setLoading] = useState(false);
  const [sstFile, setSstFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: employee ? {
      ...employee,
      sst_expire_date: employee.sst_expire_date ? new Date(employee.sst_expire_date) : undefined,
    } : {
      type: 'Employee',
      regular_rate: 0,
      overtime_rate: 0,
    },
  });

  const watchedDate = watch('sst_expire_date');

  const uploadSstImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `sst-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('sst-images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('sst-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const onSubmit = async (data: EmployeeFormData) => {
    setLoading(true);
    try {
      let sst_image_url = employee?.sst_image_url;

      if (sstFile) {
        const uploadedUrl = await uploadSstImage(sstFile);
        if (uploadedUrl) {
          sst_image_url = uploadedUrl;
        }
      }

      const employeeData = {
        first_name: data.first_name,
        last_name: data.last_name,
        type: data.type,
        email: data.email || null,
        mobile_number: data.mobile_number || null,
        sst_number: data.sst_number || null,
        sst_expire_date: data.sst_expire_date ? format(data.sst_expire_date, 'yyyy-MM-dd') : null,
        regular_rate: data.regular_rate,
        overtime_rate: data.overtime_rate,
        sst_image_url,
      };

      if (employee) {
        const { error } = await supabase
          .from('employees')
          .update(employeeData)
          .eq('id', employee.id);

        if (error) throw error;
        toast({ title: 'Employee updated successfully' });
      } else {
        const { error } = await supabase
          .from('employees')
          .insert([employeeData]);

        if (error) throw error;
        toast({ title: 'Employee created successfully' });
      }

      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{employee ? 'Edit Employee' : 'Add Employee'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                {...register('first_name')}
                placeholder="Enter first name"
              />
              {errors.first_name && (
                <p className="text-sm text-red-500">{errors.first_name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                {...register('last_name')}
                placeholder="Enter last name"
              />
              {errors.last_name && (
                <p className="text-sm text-red-500">{errors.last_name.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="type">Employee Type</Label>
            <Select
              onValueChange={(value) => setValue('type', value as any)}
              defaultValue={employee?.type || 'Employee'}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select employee type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Employee">Employee</SelectItem>
                <SelectItem value="Foreman">Foreman</SelectItem>
                <SelectItem value="PM">Project Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mobile_number">Mobile Number</Label>
              <Input
                id="mobile_number"
                {...register('mobile_number')}
                placeholder="Enter mobile number"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="Enter email"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sst_number">SST Number</Label>
              <Input
                id="sst_number"
                {...register('sst_number')}
                placeholder="Enter SST number"
              />
            </div>
            <div>
              <Label>SST Expiry Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !watchedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watchedDate ? format(watchedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={watchedDate}
                    onSelect={(date) => setValue('sst_expire_date', date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <Label htmlFor="sst_image">SST Certificate Image</Label>
            <Input
              id="sst_image"
              type="file"
              accept="image/*"
              onChange={(e) => setSstFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="regular_rate">Regular Rate ($)</Label>
              <Input
                id="regular_rate"
                type="number"
                step="0.01"
                {...register('regular_rate', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="overtime_rate">Overtime Rate ($)</Label>
              <Input
                id="overtime_rate"
                type="number"
                step="0.01"
                {...register('overtime_rate', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : employee ? 'Update Employee' : 'Add Employee'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EmployeeForm;
