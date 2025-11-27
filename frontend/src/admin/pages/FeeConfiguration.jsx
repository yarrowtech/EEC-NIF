import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus, Trash2, Save, X, Percent } from 'lucide-react';

const FeeConfiguration = ({ setShowAdminHeader }) => {
  useEffect(() => {
    setShowAdminHeader(false);
  }, [setShowAdminHeader]);

  const [selectedProgram, setSelectedProgram] = useState('4 Year B DES');
  const [selectedStream, setSelectedStream] = useState('Fashion Design');
  const [feeComponents, setFeeComponents] = useState([
    { id: 1, name: 'Time of Admission', amount: 60000 },
    { id: 2, name: 'Registration fee', amount: 5000 },
    { id: 3, name: 'MSU fees', amount: 1500 },
    { id: 4, name: '1st Installment', amount: 45000 },
    { id: 5, name: '2nd Installment', amount: 45000 }
  ]);
  
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountData, setDiscountData] = useState({
    type: 'percentage', // 'percentage' or 'fixed'
    value: 0,
    description: '',
    applicableCategories: []
  });

  const programs = [
    '4 Year B DES',
    '3 Year B VOC', 
    '2 Year M VOC',
    '2 Year Advanced Certificate',
    '1 Year Certificate'
  ];

  const streams = [
    'Fashion Design',
    'Interior Design',
    'Graphic Design'
  ];

  const addFeeComponent = () => {
    const newComponent = {
      id: Date.now(),
      name: '',
      amount: 0
    };
    setFeeComponents([...feeComponents, newComponent]);
  };

  const updateFeeComponent = (id, field, value) => {
    setFeeComponents(feeComponents.map(component => 
      component.id === id 
        ? { ...component, [field]: field === 'amount' ? Number(value) : value }
        : component
    ));
  };

  const deleteFeeComponent = (id) => {
    setFeeComponents(feeComponents.filter(component => component.id !== id));
  };

  const getTotalFee = () => {
    return feeComponents.reduce((sum, component) => sum + component.amount, 0);
  };

  const handleSave = () => {
    alert('Fee structure saved successfully!');
  };

  const handleDiscountSave = () => {
    // Here you would typically save the discount to the backend
    console.log('Discount data:', discountData);
    alert(`Discount of ${discountData.type === 'percentage' ? discountData.value + '%' : '₹' + discountData.value} saved successfully!`);
    setShowDiscountModal(false);
    setDiscountData({
      type: 'percentage',
      value: 0,
      description: '',
      applicableCategories: []
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col gap-2 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Manage Fee Structure</h1>
          <p className="text-gray-600">
            Define and update the fee structure for each program and stream offered by the college.
          </p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 items-end">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Select Program</label>
            <div className="relative">
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                {programs.map((program) => (
                  <option key={program} value={program}>{program}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Select Stream</label>
            <div className="relative">
              <select
                value={selectedStream}
                onChange={(e) => setSelectedStream(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                {streams.map((stream) => (
                  <option key={stream} value={stream}>{stream}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
            </div>
          </div>

          <button 
            className="h-12 px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            View Structure
          </button>
        </div>
      </div>

      {/* Section Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800">
          Fee Structure for: {selectedProgram} - {selectedStream}
        </h2>
      </div>

      {/* Fee Structure Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Fee Component Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Amount (INR)
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {feeComponents.map((component) => (
                <tr key={component.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={component.name}
                      onChange={(e) => updateFeeComponent(component.id, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter fee component name"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      value={component.amount}
                      onChange={(e) => updateFeeComponent(component.id, 'amount', e.target.value)}
                      className="w-48 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => deleteFeeComponent(component.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <button
              onClick={addFeeComponent}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Plus size={16} />
              Add Fee Component
            </button>
            <button
              onClick={() => setShowDiscountModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            >
              <Percent size={16} />
              Add Discount
            </button>
          </div>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <p className="text-sm font-medium text-gray-600">Total Fee:</p>
            <p className="text-lg font-bold text-gray-900">₹{getTotalFee().toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <button className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
          <X size={16} />
          Cancel
        </button>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Save size={16} />
          Save Changes
        </button>
      </div>

      {/* Discount Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full m-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add Discount</h3>
              <button 
                onClick={() => setShowDiscountModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Discount Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
                <select
                  value={discountData.type}
                  onChange={(e) => setDiscountData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>

              {/* Discount Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Value {discountData.type === 'percentage' ? '(%)' : '(₹)'}
                </label>
                <input
                  type="number"
                  value={discountData.value}
                  onChange={(e) => setDiscountData(prev => ({ ...prev, value: Number(e.target.value) }))}
                  min="0"
                  max={discountData.type === 'percentage' ? '100' : undefined}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={discountData.type === 'percentage' ? 'Enter percentage (0-100)' : 'Enter amount'}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  value={discountData.description}
                  onChange={(e) => setDiscountData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Early bird discount, Sibling discount, Merit scholarship"
                />
              </div>

              {/* Applicable Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Applicable Categories</label>
                <div className="space-y-2">
                  {['Academic Excellence', 'Financial Need', 'Sibling Discount', 'Early Payment', 'Staff Family'].map((category) => (
                    <label key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={discountData.applicableCategories.includes(category)}
                        onChange={(e) => {
                          setDiscountData(prev => ({
                            ...prev,
                            applicableCategories: e.target.checked
                              ? [...prev.applicableCategories, category]
                              : prev.applicableCategories.filter(c => c !== category)
                          }));
                        }}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowDiscountModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDiscountSave}
                disabled={!discountData.value || !discountData.description}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Percent size={16} className="inline mr-2" />
                Add Discount
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeConfiguration;