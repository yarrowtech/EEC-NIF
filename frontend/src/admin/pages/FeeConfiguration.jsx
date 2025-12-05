// // export default FeeConfiguration;


// import React, { useState, useEffect } from "react";
// import { ChevronDown, Plus, Trash2, Save, X, Percent } from "lucide-react";
// import Swal from "sweetalert2";

// const API_BASE = (
//   import.meta.env.VITE_API_BASE_URL ||
//   import.meta.env.VITE_API_URL ||
//   "http://localhost:5000"
// ).replace(/\/+$/, "");

// // Map your dropdown labels → backend programType codes
// const PROGRAM_OPTIONS = [
//   { label: "4 Year B DES", value: "B_DES", years: [1, 2, 3, 4] },
//   { label: "3 Year B VOC", value: "B_VOC", years: [1, 2, 3] },
//   { label: "2 Year M VOC", value: "M_VOC", years: [1, 2] },
//   { label: "2 Year Advanced Certificate", value: "ADV_CERT_2", years: [1, 2] },
//   { label: "1 Year Certificate", value: "ADV_CERT_1", years: [1] },
// ];

// const STREAMS = ["Fashion Design", "Interior Design", "Graphic Design"];

// const FeeConfiguration = ({ setShowAdminHeader }) => {
//   useEffect(() => {
//     setShowAdminHeader(false);
//   }, [setShowAdminHeader]);

//   const [selectedProgramLabel, setSelectedProgramLabel] =
//     useState("4 Year B DES");
//   const [selectedStream, setSelectedStream] = useState("Fashion Design");
//   const [selectedYear, setSelectedYear] = useState(1);

//   const [feeComponents, setFeeComponents] = useState([
//     { id: 1, name: "Time of Admission", amount: 0 },
//     { id: 2, name: "Registration fee", amount: 0 },
//     { id: 3, name: "MSU fees", amount: 0 },
//     { id: 4, name: "1st Installment", amount: 0 },
//     { id: 5, name: "2nd Installment", amount: 0 },
//   ]);

//   const [showDiscountModal, setShowDiscountModal] = useState(false);
//   const [discountData, setDiscountData] = useState({
//     type: "percentage",
//     value: 0,
//     description: "",
//     applicableCategories: [],
//   });

//   const [saving, setSaving] = useState(false);
//   const [loadingConfig, setLoadingConfig] = useState(false);
//   const [alert, setAlert] = useState(null); // {type:'success'|'error', message:''}

//   const currentProgram = PROGRAM_OPTIONS.find(
//     (p) => p.label === selectedProgramLabel
//   );
//   const availableYears = currentProgram?.years || [1];

//   useEffect(() => {
//     // reset year if not valid for chosen program
//     if (!availableYears.includes(selectedYear)) {
//       setSelectedYear(availableYears[0]);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedProgramLabel]);

//   const addFeeComponent = () => {
//     const newComponent = {
//       id: Date.now(),
//       name: "",
//       amount: 0,
//     };
//     setFeeComponents((prev) => [...prev, newComponent]);
//   };

//   const updateFeeComponent = (id, field, value) => {
//     setFeeComponents((prev) =>
//       prev.map((component) =>
//         component.id === id
//           ? {
//               ...component,
//               [field]:
//                 field === "amount" ? Number(value || 0) : value,
//             }
//           : component
//       )
//     );
//   };

//   const deleteFeeComponent = (id) => {
//     setFeeComponents((prev) => prev.filter((c) => c.id !== id));
//   };

//   const getTotalFee = () =>
//     feeComponents.reduce((sum, c) => sum + (c.amount || 0), 0);

//   const showAlert = (type, message) => {
//     setAlert({ type, message });
//     setTimeout(() => setAlert(null), 3500);
//   };

//   // ------- FETCH EXISTING STRUCTURE FROM BACKEND -------
//   const handleViewStructure = async () => {
//     if (!currentProgram) return;
//     setLoadingConfig(true);
//     try {
//       const programType = currentProgram.value;
//       // for now we treat stream === course
//       const params = new URLSearchParams({
//         programType,
//         stream: selectedStream,
//         course: selectedStream,
//         year: String(selectedYear),
//       }).toString();

//       const res = await fetch(
//         `${API_BASE}/api/nif/fees/config/fetch?${params}`,
//         {
//           headers: {
//             "Content-Type": "application/json",
//             authorization: `Bearer ${localStorage.getItem("token") || ""}`,
//           },
//         }
//       );

//       if (res.status === 404) {
//         showAlert(
//           "error",
//           "No fee structure found. Create a new one and click Save."
//         );
//         setLoadingConfig(false);
//         return;
//       }

//       if (!res.ok) throw new Error("Failed to fetch fee structure");

//       const cfg = await res.json();

//       setFeeComponents(
//         (cfg.feeComponents || []).map((row, idx) => ({
//           id: idx + 1,
//           name: row.label,
//           amount: Number(row.amount || 0),
//         }))
//       );
//       Swal.fire({
//             icon: "success",
//             title: "Fee structure loaded from server .",
//             toast: true,
//             position: "top-end",
//             showConfirmButton: false,
//             timer: 2000,
//             timerProgressBar: true,
//           });
//       // showAlert("success", "Fee structure loaded from server.");
//     } catch (err) {
//       console.error(err);
//       showAlert("error", "Failed to load fee structure.");
//     } finally {
//       setLoadingConfig(false);
//     }
//   };

//   // ------- SAVE STRUCTURE TO BACKEND -------
//   const handleSave = async () => {
//     if (!currentProgram) return;
//     if (!feeComponents.length) {
//       showAlert("error", "Add at least one fee component.");
//       return;
//     }

//     const cleanedComponents = feeComponents
//       .filter((c) => (c.name || "").trim())
//       .map((c) => ({
//         label: c.name.trim(),
//         amount: Number(c.amount || 0),
//       }));

//     if (!cleanedComponents.length) {
//       showAlert("error", "Component names cannot be empty.");
//       return;
//     }

//     setSaving(true);
//     try {
//       const programType = currentProgram.value;

//       const discountsToSend =
//         discountData.value && discountData.description
//           ? [discountData]
//           : [];

//       const res = await fetch(`${API_BASE}/api/nif/fees/config/save`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           authorization: `Bearer ${localStorage.getItem("token") || ""}`,
//         },
//         body: JSON.stringify({
//           programType,
//           stream: selectedStream,
//           course: selectedStream, // align with backend
//           yearNumber: selectedYear,
//           feeComponents: cleanedComponents,
//           discounts: discountsToSend,
//         }),
//       });

//       if (!res.ok) throw new Error("Save failed");
//       await res.json();
//       Swal.fire({
//             icon: "success",
//             title: "Fee structure saved successfully .",
//             toast: true,
//             position: "top-end",
//             showConfirmButton: false,
//             timer: 2000,
//             timerProgressBar: true,
//           });

//       // showAlert("success", "Fee structure saved successfully.");
//     } catch (err) {
//       console.error(err);
//       showAlert("error", "Failed to save fee structure.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleDiscountSave = () => {
//     if (!discountData.value || !discountData.description) return;
//     showAlert(
//       "success",
//       `Discount of ${
//         discountData.type === "percentage"
//           ? discountData.value + "%"
//           : "₹" + discountData.value
//       } added locally. It will be saved with the fee structure.`
//     );
//     setShowDiscountModal(false);
//   };

//   return (
//     <div className="space-y-6">
//       {/* Alert */}
//       {alert && (
//         <div
//           className={`p-3 rounded-lg text-sm ${
//             alert.type === "success"
//               ? "bg-green-100 text-green-800 border border-green-200"
//               : "bg-red-100 text-red-800 border border-red-200"
//           }`}
//         >
//           {alert.message}
//         </div>
//       )}

//       {/* Header */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//         <div className="flex flex-col gap-2 mb-6">
//           <h1 className="text-3xl font-bold text-gray-800">
//             Manage Fee Structure
//           </h1>
//           <p className="text-gray-600">
//             Define and update the fee structure for each program, stream and
//             year.
//           </p>
//         </div>

//         {/* Filters */}
//         <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-6 items-end">
//           {/* Program */}
//           <div className="flex flex-col gap-2">
//             <label className="text-sm font-medium text-gray-700">
//               Select Program
//             </label>
//             <div className="relative">
//               <select
//                 value={selectedProgramLabel}
//                 onChange={(e) => setSelectedProgramLabel(e.target.value)}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
//               >
//                 {PROGRAM_OPTIONS.map((p) => (
//                   <option key={p.label} value={p.label}>
//                     {p.label}
//                   </option>
//                 ))}
//               </select>
//               <ChevronDown
//                 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
//                 size={20}
//               />
//             </div>
//           </div>

//           {/* Stream */}
//           <div className="flex flex-col gap-2">
//             <label className="text-sm font-medium text-gray-700">
//               Select Stream
//             </label>
//             <div className="relative">
//               <select
//                 value={selectedStream}
//                 onChange={(e) => setSelectedStream(e.target.value)}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
//               >
//                 {STREAMS.map((s) => (
//                   <option key={s} value={s}>
//                     {s}
//                   </option>
//                 ))}
//               </select>
//               <ChevronDown
//                 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
//                 size={20}
//               />
//             </div>
//           </div>

//           {/* Year */}
//           <div className="flex flex-col gap-2">
//             <label className="text-sm font-medium text-gray-700">
//               Select Year
//             </label>
//             <div className="relative">
//               <select
//                 value={selectedYear}
//                 onChange={(e) => setSelectedYear(Number(e.target.value))}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
//               >
//                 {availableYears.map((y) => (
//                   <option key={y} value={y}>
//                     Year {y}
//                   </option>
//                 ))}
//               </select>
//               <ChevronDown
//                 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
//                 size={20}
//               />
//             </div>
//           </div>

//           {/* View structure button */}
//           <button
//             onClick={handleViewStructure}
//             disabled={loadingConfig}
//             className="h-12 px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400"
//           >
//             {loadingConfig ? "Loading..." : "View Structure"}
//           </button>
//         </div>
//       </div>

//       {/* Section Header */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//         <h2 className="text-xl font-bold text-gray-800">
//           Fee Structure for: {selectedProgramLabel} - {selectedStream} (Year{" "}
//           {selectedYear})
//         </h2>
//       </div>

//       {/* Fee Structure Table */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className="bg-gray-50 border-b border-gray-200">
//                 <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
//                   Fee Component Name
//                 </th>
//                 <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
//                   Amount (INR)
//                 </th>
//                 <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {feeComponents.map((component) => (
//                 <tr key={component.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4">
//                     <input
//                       type="text"
//                       value={component.name}
//                       onChange={(e) =>
//                         updateFeeComponent(
//                           component.id,
//                           "name",
//                           e.target.value
//                         )
//                       }
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="Enter fee component name"
//                     />
//                   </td>
//                   <td className="px-6 py-4">
//                     <input
//                       type="number"
//                       value={component.amount}
//                       onChange={(e) =>
//                         updateFeeComponent(
//                           component.id,
//                           "amount",
//                           e.target.value
//                         )
//                       }
//                       className="w-48 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="0"
//                     />
//                   </td>
//                   <td className="px-6 py-4 text-right">
//                     <button
//                       onClick={() => deleteFeeComponent(component.id)}
//                       className="text-gray-400 hover:text-red-600 transition-colors"
//                     >
//                       <Trash2 size={20} />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Footer */}
//         <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-200 bg-gray-50">
//           <div className="flex items-center gap-3">
//             <button
//               onClick={addFeeComponent}
//               className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
//             >
//               <Plus size={16} />
//               Add Fee Component
//             </button>
//             <button
//               onClick={() => setShowDiscountModal(true)}
//               className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors"
//             >
//               <Percent size={16} />
//               Add Discount
//             </button>
//           </div>
//           <div className="flex items-center gap-4 mt-4 sm:mt-0">
//             <p className="text-sm font-medium text-gray-600">Total Fee:</p>
//             <p className="text-lg font-bold text-gray-900">
//               ₹{getTotalFee().toLocaleString()}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Action Buttons */}
//       <div className="flex justify-end gap-4">
//         <button
//           onClick={() => window.location.reload()}
//           className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
//         >
//           <X size={16} />
//           Cancel
//         </button>
//         <button
//           onClick={handleSave}
//           disabled={saving}
//           className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400"
//         >
//           <Save size={16} />
//           {saving ? "Saving..." : "Save Changes"}
//         </button>
//       </div>

//       {/* Discount Modal */}
//       {showDiscountModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg shadow-xl max-w-md w-full m-4">
//             <div className="flex items-center justify-between p-6 border-b border-gray-200">
//               <h3 className="text-lg font-semibold text-gray-900">
//                 Add Discount
//               </h3>
//               <button
//                 onClick={() => setShowDiscountModal(false)}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 <X size={20} />
//               </button>
//             </div>

//             <div className="p-6 space-y-4">
//               {/* Discount Type */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Discount Type
//                 </label>
//                 <select
//                   value={discountData.type}
//                   onChange={(e) =>
//                     setDiscountData((prev) => ({
//                       ...prev,
//                       type: e.target.value,
//                     }))
//                   }
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 >
//                   <option value="percentage">Percentage (%)</option>
//                   <option value="fixed">Fixed Amount (₹)</option>
//                 </select>
//               </div>

//               {/* Discount Value */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Discount Value{" "}
//                   {discountData.type === "percentage" ? "(%)" : "(₹)"}
//                 </label>
//                 <input
//                   type="number"
//                   value={discountData.value}
//                   onChange={(e) =>
//                     setDiscountData((prev) => ({
//                       ...prev,
//                       value: Number(e.target.value || 0),
//                     }))
//                   }
//                   min="0"
//                   max={discountData.type === "percentage" ? "100" : undefined}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder={
//                     discountData.type === "percentage"
//                       ? "Enter percentage (0-100)"
//                       : "Enter amount"
//                   }
//                 />
//               </div>

//               {/* Description */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Description
//                 </label>
//                 <input
//                   type="text"
//                   value={discountData.description}
//                   onChange={(e) =>
//                     setDiscountData((prev) => ({
//                       ...prev,
//                       description: e.target.value,
//                     }))
//                   }
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="e.g., Early bird, Sibling discount"
//                 />
//               </div>

//               {/* Applicable Categories */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Applicable Categories
//                 </label>
//                 <div className="space-y-2">
//                   {[
//                     "Academic Excellence",
//                     "Financial Need",
//                     "Sibling Discount",
//                     "Early Payment",
//                     "Staff Family",
//                   ].map((category) => (
//                     <label key={category} className="flex items-center">
//                       <input
//                         type="checkbox"
//                         checked={discountData.applicableCategories.includes(
//                           category
//                         )}
//                         onChange={(e) =>
//                           setDiscountData((prev) => ({
//                             ...prev,
//                             applicableCategories: e.target.checked
//                               ? [...prev.applicableCategories, category]
//                               : prev.applicableCategories.filter(
//                                   (c) => c !== category
//                                 ),
//                           }))
//                         }
//                         className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                       />
//                       <span className="ml-2 text-sm text-gray-700">
//                         {category}
//                       </span>
//                     </label>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
//               <button
//                 onClick={() => setShowDiscountModal(false)}
//                 className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleDiscountSave}
//                 disabled={!discountData.value || !discountData.description}
//                 className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
//               >
//                 <Percent size={16} className="inline mr-2" />
//                 Add Discount
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default FeeConfiguration;
// src/NIF/FeeConfiguration.jsx
import React, { useState, useEffect } from "react";
import { Plus, Trash2, Save } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const FeeConfiguration = ({ setShowAdminHeader }) => {
  useEffect(() => {
    if (setShowAdminHeader) setShowAdminHeader(false);
  }, [setShowAdminHeader]);

  const programs = [
    { value: "ADV_CERT", label: "Advance Certification (1 / 2 Years)" },
    { value: "B_VOC", label: "B.Voc (3 Years)" },
    { value: "M_VOC", label: "M.Voc (2 Years)" },
    { value: "B_DES", label: "B.Des (4 Years)" },
  ];

  const streams = ["Fashion Design", "Interior Design"];

  const [programType, setProgramType] = useState("ADV_CERT");
  const [stream, setStream] = useState("Fashion Design");
  const [yearNumber, setYearNumber] = useState(1);

  const [feeComponents, setFeeComponents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Add a blank row
  const addComponent = () => {
    setFeeComponents((prev) => [
      ...prev,
      { id: Date.now(), label: "", amount: 0 },
    ]);
  };

  const updateComponent = (id, field, value) => {
    setFeeComponents((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]: field === "amount" ? Number(value || 0) : value,
            }
          : row
      )
    );
  };

  const removeComponent = (id) => {
    setFeeComponents((prev) => prev.filter((r) => r.id !== id));
  };

  const totalFee = feeComponents.reduce(
    (sum, row) => sum + (Number(row.amount) || 0),
    0
  );

  const validate = () => {
    if (!programType || !stream || !yearNumber) {
      alert("Please select program, stream and year.");
      return false;
    }
    if (!feeComponents.length) {
      alert("Please add at least one fee component.");
      return false;
    }
    if (feeComponents.some((c) => !c.label || !c.amount)) {
      alert("Each component must have a name and amount.");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/nif/fees/config/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          programType,
          stream,
          course: stream, // if you separate course later, change this
          yearNumber,
          feeComponents: feeComponents.map((row) => ({
            label: row.label,
            amount: Number(row.amount),
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to save fee configuration");
      }

      alert("Fee configuration saved successfully ✅");
    } catch (err) {
      console.error(err);
      alert(`Error saving configuration: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header / Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          NIF Fee Configuration
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Define the official fee breakup per Program / Stream / Year
        </p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500">
              Program
            </label>
            <select
              value={programType}
              onChange={(e) => setProgramType(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
            >
              {programs.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500">
              Stream / Course
            </label>
            <select
              value={stream}
              onChange={(e) => setStream(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
            >
              {streams.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500">
              Academic Year
            </label>
            <select
              value={yearNumber}
              onChange={(e) => setYearNumber(Number(e.target.value))}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
            >
              {[1, 2, 3, 4].map((yr) => (
                <option key={yr} value={yr}>
                  Year {yr}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Components Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-900 text-lg">
            Fee Components
          </h2>
          <button
            onClick={addComponent}
            className="inline-flex items-center px-3 py-1.5 text-sm rounded-lg border border-blue-500 text-blue-600 hover:bg-blue-50"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Row
          </button>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs uppercase text-gray-500">
              <th className="px-6 py-3 text-left">Component Name</th>
              <th className="px-6 py-3 text-right">Amount (₹)</th>
              <th className="px-6 py-3 text-right"></th>
            </tr>
          </thead>
          <tbody>
            {feeComponents.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-6 py-8 text-center text-gray-400"
                >
                  No components yet. Click “Add Row” to start.
                </td>
              </tr>
            )}

            {feeComponents.map((row) => (
              <tr key={row.id} className="border-t last:border-b">
                <td className="px-6 py-3">
                  <input
                    type="text"
                    value={row.label}
                    onChange={(e) =>
                      updateComponent(row.id, "label", e.target.value)
                    }
                    placeholder="e.g. Time of Admission, 1st Installment"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </td>
                <td className="px-6 py-3 text-right">
                  <input
                    type="number"
                    value={row.amount}
                    onChange={(e) =>
                      updateComponent(row.id, "amount", e.target.value)
                    }
                    className="w-32 border rounded-lg px-3 py-2 text-sm text-right"
                  />
                </td>
                <td className="px-6 py-3 text-right">
                  <button
                    onClick={() => removeComponent(row.id)}
                    className="inline-flex items-center px-2 py-1 text-xs rounded-md bg-red-50 text-red-600 hover:bg-red-100"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
          <p className="text-sm text-gray-600">
            Total Components:{" "}
            <span className="font-semibold">{feeComponents.length}</span>
          </p>
          <p className="text-sm font-semibold text-gray-900">
            Total Fee:{" "}
            <span className="text-blue-600">
              ₹{totalFee.toLocaleString("en-IN")}
            </span>
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="inline-flex items-center px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
        >
          <Save className="w-4 h-4 mr-2" />
          {loading ? "Saving..." : "Save Fee Structure"}
        </button>
      </div>
    </div>
  );
};

export default FeeConfiguration;
