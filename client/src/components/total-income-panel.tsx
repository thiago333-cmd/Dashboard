import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit3, Save, X, TrendingUp, Plus, Trash2 } from "lucide-react";
import { useCashFlowData, useUpdateCashFlowData, formatCashFlowCurrency } from "@/hooks/use-cash-flow-data";
import { useUserSettings } from "@/hooks/use-financial-data";
import { useTranslation } from "@/lib/translations";

export function TotalIncomePanel() {
  const { data: cashFlowData, isLoading } = useCashFlowData();
  const { data: userSettings } = useUserSettings();
  const updateCashFlowMutation = useUpdateCashFlowData();
  const { t } = useTranslation(userSettings?.language);
  
  const [isEditing, setIsEditing] = useState(false);
  const [incomeCategories, setIncomeCategories] = useState<Record<string, string>>({});
  const [newSalaryCategory, setNewSalaryCategory] = useState("");
  const [newExtraIncomeCategory, setNewExtraIncomeCategory] = useState("");
  const [newBusinessCategory, setNewBusinessCategory] = useState("");

  const handleEdit = () => {
    const existingIncomeData = JSON.parse(cashFlowData?.incomeData || '{}');
    setIncomeCategories(existingIncomeData);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      // Calculate total income from all categories
      const totalIncome = Object.values(incomeCategories).reduce((sum, value) => sum + parseFloat(value || "0"), 0);
      
      await updateCashFlowMutation.mutateAsync({
        totalIncome: totalIncome.toString(),
        incomeData: JSON.stringify(incomeCategories)
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update income data:", error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIncomeCategories({});
    setNewSalaryCategory("");
    setNewExtraIncomeCategory("");
    setNewBusinessCategory("");
  };

  const addIncomeCategory = (type: string, categoryName: string) => {
    if (!categoryName.trim()) return;
    
    const key = `${type}_${categoryName}`;
    setIncomeCategories(prev => ({ ...prev, [key]: "0" }));
    
    if (type === "salary") setNewSalaryCategory("");
    else if (type === "extra") setNewExtraIncomeCategory("");
    else if (type === "business") setNewBusinessCategory("");
  };

  const removeIncomeCategory = (key: string) => {
    setIncomeCategories(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const updateIncomeAmount = (key: string, value: string) => {
    setIncomeCategories(prev => ({ ...prev, [key]: value }));
  };

  const getCategoriesByType = (type: string) => {
    return Object.entries(incomeCategories).filter(([key]) => key.startsWith(`${type}_`));
  };

  if (isLoading) {
    return (
      <Card className="h-[380px] bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border-emerald-200 dark:border-emerald-800 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <TrendingUp className="h-5 w-5" />
            {t('Total Income')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-8 bg-emerald-200 dark:bg-emerald-800 rounded mb-4"></div>
            <div className="h-4 bg-emerald-200 dark:bg-emerald-800 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalIncome = cashFlowData?.totalIncome || "0";
  const formattedAmount = formatCashFlowCurrency(totalIncome, userSettings?.currency);

  return (
    <Card className="h-[420px] bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-8">
        <CardTitle className="flex items-center justify-between text-green-700 dark:text-green-300 mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            <span className="font-semibold">{t('Total Income')}</span>
          </div>
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isEditing ? (
          <div className="space-y-4">
            <Tabs defaultValue="salary" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="salary">{t('Salary')}</TabsTrigger>
                <TabsTrigger value="extra">{t('Extra Income')}</TabsTrigger>
                <TabsTrigger value="business">{t('Own Business')}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="salary" className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder={t('Add Salary Category')}
                    value={newSalaryCategory}
                    onChange={(e) => setNewSalaryCategory(e.target.value)}
                    className="text-sm"
                  />
                  <Button
                    onClick={() => addIncomeCategory("salary", newSalaryCategory)}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {getCategoriesByType("salary").map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-sm text-emerald-700 dark:text-emerald-300 flex-1">
                      {key.replace("salary_", "")}
                    </span>
                    <Input
                      type="number"
                      value={value}
                      onChange={(e) => updateIncomeAmount(key, e.target.value)}
                      className="w-24 text-sm"
                      step="0.01"
                      min="0"
                    />
                    <Button
                      onClick={() => removeIncomeCategory(key)}
                      size="sm"
                      variant="destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="extra" className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder={t('Add Extra Income Category')}
                    value={newExtraIncomeCategory}
                    onChange={(e) => setNewExtraIncomeCategory(e.target.value)}
                    className="text-sm"
                  />
                  <Button
                    onClick={() => addIncomeCategory("extra", newExtraIncomeCategory)}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {getCategoriesByType("extra").map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-sm text-emerald-700 dark:text-emerald-300 flex-1">
                      {key.replace("extra_", "")}
                    </span>
                    <Input
                      type="number"
                      value={value}
                      onChange={(e) => updateIncomeAmount(key, e.target.value)}
                      className="w-24 text-sm"
                      step="0.01"
                      min="0"
                    />
                    <Button
                      onClick={() => removeIncomeCategory(key)}
                      size="sm"
                      variant="destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="business" className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder={t('Add Business Category')}
                    value={newBusinessCategory}
                    onChange={(e) => setNewBusinessCategory(e.target.value)}
                    className="text-sm"
                  />
                  <Button
                    onClick={() => addIncomeCategory("business", newBusinessCategory)}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {getCategoriesByType("business").map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-sm text-emerald-700 dark:text-emerald-300 flex-1">
                      {key.replace("business_", "")}
                    </span>
                    <Input
                      type="number"
                      value={value}
                      onChange={(e) => updateIncomeAmount(key, e.target.value)}
                      className="w-24 text-sm"
                      step="0.01"
                      min="0"
                    />
                    <Button
                      onClick={() => removeIncomeCategory(key)}
                      size="sm"
                      variant="destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
            
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSave}
                disabled={updateCashFlowMutation.isPending}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
              >
                <Save className="h-4 w-4 mr-2" />
                {t('Save')}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={updateCashFlowMutation.isPending}
                className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-950"
              >
                <X className="h-4 w-4 mr-2" />
                {t('Cancel')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-800 dark:text-emerald-200 mb-4">
                {formattedAmount}
              </div>
            </div>
            
            <div className="bg-emerald-100 dark:bg-emerald-900 rounded-lg p-4">
              <p className="text-sm text-emerald-700 dark:text-emerald-300 text-center">
                {t('Income Description')}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}