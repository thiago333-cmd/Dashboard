import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useCashFlowData, calculateTotalExpensesCosts, formatCashFlowCurrency } from "@/hooks/use-cash-flow-data";
import { useUserSettings } from "@/hooks/use-financial-data";
import { useTranslation } from "@/lib/translations";

export function CashFlowPieChart() {
  const { data: cashFlowData, isLoading } = useCashFlowData();
  const { data: userSettings } = useUserSettings();
  const { t } = useTranslation(userSettings?.language);

  if (isLoading) {
    return (
      <Card className="h-[380px] bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border-purple-200 dark:border-purple-800 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
            <TrendingUp className="h-5 w-5" />
            {t('cashFlowOverview')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="w-full h-48 bg-purple-200 dark:bg-purple-800 rounded-full mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalIncome = parseFloat(cashFlowData?.totalIncome || "0");
  
  // Parse expenses and costs data to show individual categories
  const expensesData = JSON.parse(cashFlowData?.expensesData || '{}');
  const costsData = JSON.parse(cashFlowData?.costsData || '{}');
  
  // Calculate total expenses and costs
  const totalExpenses = Object.values(expensesData).reduce((sum: number, value: any) => sum + parseFloat(value || "0"), 0);
  const totalCosts = Object.values(costsData).reduce((sum: number, value: any) => sum + parseFloat(value || "0"), 0);
  const totalExpensesCosts = totalExpenses + totalCosts;
  const remainingIncome = Math.max(0, totalIncome - totalExpensesCosts);

  // Create data array with individual categories and available balance
  const data = [];
  
  // Add individual expense categories
  Object.entries(expensesData).forEach(([category, value]) => {
    const amount = parseFloat(value as string || "0");
    if (amount > 0) {
      data.push({
        name: category,
        value: amount,
        type: 'expense'
      });
    }
  });
  
  // Add individual cost categories
  Object.entries(costsData).forEach(([category, value]) => {
    const amount = parseFloat(value as string || "0");
    if (amount > 0) {
      data.push({
        name: category,
        value: amount,
        type: 'cost'
      });
    }
  });
  
  // Add available balance as the largest slice
  if (remainingIncome > 0) {
    data.push({
      name: t('Available'),
      value: remainingIncome,
      type: 'available'
    });
  }

  const COLORS = ['#0ea5e9', '#ef4444', '#f97316', '#eab308', '#8b5cf6'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const total = totalIncome;
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(0) : 0;
      
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            {data.payload.name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {percentage}%
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatCashFlowCurrency(data.value, userSettings?.currency)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-[420px] bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border-purple-200 dark:border-purple-800 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
          <TrendingUp className="h-5 w-5" />
          {t('Cash Flow Overview')}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-purple-600 dark:text-purple-400">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">{t('No Data Available')}</p>
              <p className="text-xs mt-2">{t('Add Income Expenses To See Chart')}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <defs>
                    <filter id="dropshadow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
                      <feOffset dx="3" dy="6" result="offset"/>
                      <feComponentTransfer>
                        <feFuncA type="linear" slope="0.3"/>
                      </feComponentTransfer>
                      <feMerge> 
                        <feMergeNode/>
                        <feMergeNode in="SourceGraphic"/> 
                      </feMerge>
                    </filter>
                    <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0ea5e9" />
                      <stop offset="100%" stopColor="#0284c7" />
                    </linearGradient>
                    <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="#dc2626" />
                    </linearGradient>
                    <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f97316" />
                      <stop offset="100%" stopColor="#ea580c" />
                    </linearGradient>
                    <linearGradient id="yellowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#eab308" />
                      <stop offset="100%" stopColor="#ca8a04" />
                    </linearGradient>
                    <linearGradient id="grayGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6b7280" />
                      <stop offset="100%" stopColor="#4b5563" />
                    </linearGradient>
                    <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="45%"
                    innerRadius={0}
                    outerRadius={90}
                    paddingAngle={1}
                    dataKey="value"
                    filter="url(#dropshadow)"
                  >
                    {data.map((entry, index) => {
                      const gradients = ['url(#blueGradient)', 'url(#redGradient)', 'url(#orangeGradient)', 'url(#yellowGradient)', 'url(#grayGradient)'];
                      const fillColor = entry.name === 'Available' ? 'url(#greenGradient)' : gradients[index % gradients.length];
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={fillColor}
                          stroke="#ffffff"
                          strokeWidth={1}
                        />
                      );
                    })}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Balance indicator - moved outside chart area */}
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-lg p-3 text-center border border-purple-200 dark:border-purple-700">
              <p className="text-xs text-purple-600 dark:text-purple-400 mb-1 font-medium">
                {t('Remaining Balance')}
              </p>
              <p className={`text-lg font-bold ${
                remainingIncome >= 0 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {formatCashFlowCurrency(remainingIncome, userSettings?.currency)}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}