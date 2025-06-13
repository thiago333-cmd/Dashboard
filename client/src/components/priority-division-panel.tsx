import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit3, Save, X, Target, Shield, Heart, Smile } from "lucide-react";
import { useCashFlowData, useUpdateCashFlowData, formatCashFlowCurrency } from "@/hooks/use-cash-flow-data";
import { useUserSettings } from "@/hooks/use-financial-data";
import { useTranslation } from "@/lib/translations";

export function PriorityDivisionPanel() {
  const { data: cashFlowData, isLoading } = useCashFlowData();
  const { data: userSettings } = useUserSettings();
  const updateCashFlowMutation = useUpdateCashFlowData();
  const { t } = useTranslation(userSettings?.language);
  
  const [isEditing, setIsEditing] = useState(false);
  const [priorities, setPriorities] = useState({
    reinvest: "",
    reserve: "",
    responsibilities: "",
    enjoy: ""
  });

  const handleEdit = () => {
    setPriorities({
      reinvest: cashFlowData?.priorityReinvest || "0",
      reserve: cashFlowData?.priorityReserve || "0",
      responsibilities: cashFlowData?.priorityResponsibilities || "0",
      enjoy: cashFlowData?.priorityEnjoy || "0"
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateCashFlowMutation.mutateAsync({
        priorityReinvest: priorities.reinvest,
        priorityReserve: priorities.reserve,
        priorityResponsibilities: priorities.responsibilities,
        priorityEnjoy: priorities.enjoy
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update priorities:", error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setPriorities({
      reinvest: "",
      reserve: "",
      responsibilities: "",
      enjoy: ""
    });
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border-indigo-200 dark:border-indigo-800 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
            <Target className="h-5 w-5" />
            {t('priorityDivision')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse grid grid-cols-4 gap-4">
            <div className="h-24 bg-indigo-200 dark:bg-indigo-800 rounded"></div>
            <div className="h-24 bg-indigo-200 dark:bg-indigo-800 rounded"></div>
            <div className="h-24 bg-indigo-200 dark:bg-indigo-800 rounded"></div>
            <div className="h-24 bg-indigo-200 dark:bg-indigo-800 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const priorityData = [
    {
      key: 'reinvest',
      title: t('Reinvest/Multiply'),
      value: cashFlowData?.priorityReinvest || "0",
      icon: Target,
      color: 'green',
      gradient: 'from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900'
    },
    {
      key: 'reserve',
      title: t('Priority Opportunity Reserve'),
      value: cashFlowData?.priorityReserve || "0",
      icon: Shield,
      color: 'blue',
      gradient: 'from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900'
    },
    {
      key: 'responsibilities',
      title: t('Responsibilities'),
      value: cashFlowData?.priorityResponsibilities || "0",
      icon: Heart,
      color: 'orange',
      gradient: 'from-orange-100 to-orange-200 dark:from-orange-800 dark:to-orange-900'
    },
    {
      key: 'enjoy',
      title: t('Enjoy'),
      value: cashFlowData?.priorityEnjoy || "0",
      icon: Smile,
      color: 'pink',
      gradient: 'from-pink-300 to-pink-500 dark:from-pink-600 dark:to-pink-800'
    }
  ];

  const totalPriorities = priorityData.reduce((sum, priority) => 
    sum + (parseFloat(priority.value) || 0), 0
  );

  return (
    <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border-indigo-200 dark:border-indigo-800 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-indigo-700 dark:text-indigo-300">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {t('Priority Division')}
          </div>
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {priorityData.map((priority) => (
                <div key={priority.key} className="space-y-2">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block">
                    {priority.title}
                  </label>
                  <Input
                    type="number"
                    value={priorities[priority.key as keyof typeof priorities]}
                    onChange={(e) => setPriorities(prev => ({ 
                      ...prev, 
                      [priority.key]: e.target.value 
                    }))}
                    placeholder="0.00"
                    className="text-sm"
                    step="0.01"
                    min="0"
                  />
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={updateCashFlowMutation.isPending}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600"
              >
                <Save className="h-4 w-4 mr-2" />
                {t('save')}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={updateCashFlowMutation.isPending}
                className="flex-1 border-indigo-300 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-300 dark:hover:bg-indigo-950"
              >
                <X className="h-4 w-4 mr-2" />
                {t('cancel')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {priorityData.map((priority) => {
                const Icon = priority.icon;
                const value = parseFloat(priority.value) || 0;
                const percentage = totalPriorities > 0 ? (value / totalPriorities * 100) : 0;
                
                return (
                  <div
                    key={priority.key}
                    className={`bg-gradient-to-br ${priority.gradient} rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200`}
                  >
                    <Icon className={`h-6 w-6 mx-auto mb-2 text-${priority.color}-600 dark:text-${priority.color}-400`} />
                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      {priority.title}
                    </h4>
                    <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                      {formatCashFlowCurrency(value, userSettings?.currency)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {percentage.toFixed(1)}%
                    </p>
                  </div>
                );
              })}
            </div>
            
            <div className="bg-indigo-100 dark:bg-indigo-900 rounded-lg p-4 text-center">
              <p className="text-sm text-indigo-700 dark:text-indigo-300 mb-2">
                {t('Total Allocated')}
              </p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCashFlowCurrency(totalPriorities, userSettings?.currency)}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}