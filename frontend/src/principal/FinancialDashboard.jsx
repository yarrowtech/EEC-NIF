import React from 'react';
import { DollarSign, TrendingUp, PieChart, BarChart3, Users, CreditCard, AlertCircle, ArrowUpRight } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

const FinancialDashboard = () => {
  // Dummy data for revenue trend
  const revenueData = [
    { month: 'Jan', revenue: 12000000, expenses: 8500000 },
    { month: 'Feb', revenue: 14500000, expenses: 9200000 },
    { month: 'Mar', revenue: 13800000, expenses: 8900000 },
    { month: 'Apr', revenue: 16200000, expenses: 10100000 },
    { month: 'May', revenue: 15800000, expenses: 9800000 },
    { month: 'Jun', revenue: 18200000, expenses: 11200000 },
    { month: 'Jul', revenue: 17500000, expenses: 10800000 },
    { month: 'Aug', revenue: 19800000, expenses: 12100000 },
  ];

  // Dummy data for expense breakdown
  const expenseData = [
    { name: 'Salaries', value: 45, color: '#3B82F6' },
    { name: 'Infrastructure', value: 25, color: '#10B981' },
    { name: 'Equipment', value: 15, color: '#F59E0B' },
    { name: 'Utilities', value: 10, color: '#EF4444' },
    { name: 'Others', value: 5, color: '#8B5CF6' },
  ];

  // Dummy data for department wise budget
  const departmentBudget = [
    { department: 'Engineering', allocated: 5000000, utilized: 4200000 },
    { department: 'Medical', allocated: 4500000, utilized: 3800000 },
    { department: 'Business', allocated: 3500000, utilized: 2900000 },
    { department: 'Arts', allocated: 2800000, utilized: 2400000 },
    { department: 'Science', allocated: 4200000, utilized: 3600000 },
  ];

  // Dummy recent transactions
  const recentTransactions = [
    { id: 1, description: 'Faculty Salary - Engineering', amount: 850000, type: 'expense', date: '2024-08-15' },
    { id: 2, description: 'Student Fee Collection', amount: 1200000, type: 'income', date: '2024-08-14' },
    { id: 3, description: 'Laboratory Equipment', amount: 320000, type: 'expense', date: '2024-08-13' },
    { id: 4, description: 'Government Grant', amount: 500000, type: 'income', date: '2024-08-12' },
    { id: 5, description: 'Utility Bills', amount: 85000, type: 'expense', date: '2024-08-11' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Financial Dashboard</h1>
        <p className="text-green-100">Comprehensive financial overview and budget management</p>
      </div>
      
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">₹19.8 Cr</div>
              <div className="text-sm text-gray-500">Total Revenue</div>
              <div className="flex items-center mt-2 text-green-600">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-xs font-medium">+12.5%</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">₹12.1 Cr</div>
              <div className="text-sm text-gray-500">Total Expenses</div>
              <div className="flex items-center mt-2 text-blue-600">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-xs font-medium">+8.2%</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">78.5%</div>
              <div className="text-sm text-gray-500">Budget Utilization</div>
              <div className="flex items-center mt-2 text-orange-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs font-medium">High usage</span>
              </div>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <PieChart className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">₹7.7 Cr</div>
              <div className="text-sm text-gray-500">Net Profit</div>
              <div className="flex items-center mt-2 text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium">+15.3%</span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Expenses Trend */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue vs Expenses Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `₹${(value/10000000).toFixed(1)}Cr`} />
              <Tooltip formatter={(value) => [`₹${(value/10000000).toFixed(2)}Cr`, '']} />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10B981" 
                strokeWidth={3}
                name="Revenue"
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#EF4444" 
                strokeWidth={3}
                name="Expenses"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Expense Breakdown Pie Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Tooltip formatter={(value) => [`${value}%`, '']} />
              <Pie data={expenseData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={120}>
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </RechartsPieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {expenseData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-gray-600">{item.name}: {item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department Budget Utilization */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Budget Utilization</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={departmentBudget}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="department" />
            <YAxis tickFormatter={(value) => `₹${(value/10000000).toFixed(1)}Cr`} />
            <Tooltip formatter={(value) => [`₹${(value/10000000).toFixed(2)}Cr`, '']} />
            <Bar dataKey="allocated" fill="#3B82F6" name="Allocated" />
            <Bar dataKey="utilized" fill="#10B981" name="Utilized" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Description</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">{transaction.description}</td>
                  <td className="py-3 px-4 text-gray-900">
                    ₹{(transaction.amount/100000).toFixed(1)}L
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      transaction.type === 'income' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500">{transaction.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;