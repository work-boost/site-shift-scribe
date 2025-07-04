
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const rateCardSchema = z.object({
  regular_rate: z.number().min(0, 'Regular rate must be positive'),
  overtime_rate: z.number().min(0, 'Overtime rate must be positive'),
});

type RateCardFormData = z.infer<typeof rateCardSchema>;

interface RateCardFormProps {
  rateCard?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const RateCardForm = ({ rateCard, onSuccess, onCancel }: RateCardFormProps) => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RateCardFormData>({
    resolver: zodResolver(rateCardSchema),
    defaultValues: rateCard ? {
      regular_rate: rateCard.regular_rate || 0,
      overtime_rate: rateCard.overtime_rate || 0,
    } : {
      regular_rate: 0,
      overtime_rate: 0,
    },
  });

  const watchedRegularRate = watch('regular_rate');
  const watchedOvertimeRate = watch('overtime_rate');

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PM': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Foreman': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  const onSubmit = async (data: RateCardFormData) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('employees')
        .update({
          regular_rate: data.regular_rate,
          overtime_rate: data.overtime_rate,
        })
        .eq('id', rateCard.id);

      if (error) throw error;
      toast({ title: 'Employee rates updated successfully' });
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
    <Card className="w-full max-w-2xl mx-auto border-2 border-purple-300 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
        <CardTitle className="text-2xl font-bold">
          Edit Rates - {rateCard?.first_name} {rateCard?.last_name}
        </CardTitle>
        {rateCard?.type && (
          <Badge className={`${getTypeColor(rateCard.type)} w-fit mt-2`}>
            {rateCard.type}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="regular_rate" className="text-purple-800 font-semibold">
                Regular Rate ($/hour)
              </Label>
              <Input
                id="regular_rate"
                type="number"
                step="0.01"
                min="0"
                {...register('regular_rate', { valueAsNumber: true })}
                placeholder="0.00"
                className="border-2 border-purple-200 focus:border-purple-500 text-lg p-3"
              />
              {errors.regular_rate && (
                <p className="text-sm text-red-500 font-medium">{errors.regular_rate.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="overtime_rate" className="text-purple-800 font-semibold">
                Overtime Rate ($/hour)
              </Label>
              <Input
                id="overtime_rate"
                type="number"
                step="0.01"
                min="0"
                {...register('overtime_rate', { valueAsNumber: true })}
                placeholder="0.00"
                className="border-2 border-purple-200 focus:border-purple-500 text-lg p-3"
              />
              {errors.overtime_rate && (
                <p className="text-sm text-red-500 font-medium">{errors.overtime_rate.message}</p>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200">
            <h4 className="font-bold text-purple-800 mb-3 text-lg">Pay Calculation Preview (8 Hours)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-purple-700">
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>First 4 hours:</strong> ${(4 * (watchedRegularRate || 0)).toFixed(2)}
                </p>
                <p className="text-sm">
                  <strong>Hours 5-8:</strong> ${(4 * (watchedOvertimeRate || 0)).toFixed(2)}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-purple-200">
                <p className="text-lg font-bold text-purple-800">
                  Total for 8 hours: ${((4 * (watchedRegularRate || 0)) + (4 * (watchedOvertimeRate || 0))).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 text-lg font-medium"
            >
              {loading ? 'Updating...' : 'Update Rates'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="border-2 border-purple-200 text-purple-600 hover:bg-purple-50 px-6 py-3 text-lg font-medium"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default RateCardForm;
