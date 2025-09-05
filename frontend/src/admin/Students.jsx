import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, MoreVertical, Heart, AlertCircle, CheckCircle, IndianRupee, Calendar } from 'lucide-react';

const Students = ({ setShowAdminHeader }) => {
	const [studentData, setStudentData] = useState([])
	const [searchTerm, setSearchTerm] = useState('');
	const [showAddForm, setShowAddForm] = useState(false);
	const [newStudent, setNewStudent] = useState({
		name: '',
		roll: '',
		class: '',
		section: '',
		gender: '',
		phone: '',
		email: '',
		address: '',
		status: 'Active',
	});

	const filteredStudents = studentData.filter(student =>
		student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
		student.roll.includes(searchTerm) ||
		student.email.toLowerCase().includes(searchTerm.toLowerCase())
	);

	// Helper functions for new features
	const getTodayAttendance = (student) => {
		if (!student.attendance || student.attendance.length === 0) return null;
		const today = new Date().toDateString();
		return student.attendance.find(att => new Date(att.date).toDateString() === today);
	};

	const getHealthStatus = (student) => {
		// Mock health status - in real app, this would come from backend
		const healthStatuses = ['healthy', 'sick', 'injured', 'absent-sick'];
		return student.healthStatus || healthStatuses[Math.floor(Math.random() * healthStatuses.length)];
	};

	const getFeesStatus = () => {
		// Mock fees data - integrate with actual fees system
		const mockFees = {
			totalDue: 18700,
			paidAmount: Math.floor(Math.random() * 18700),
			dueDate: '2024-02-15'
		};
		mockFees.dueAmount = mockFees.totalDue - mockFees.paidAmount;
		mockFees.status = mockFees.dueAmount === 0 ? 'paid' : mockFees.dueAmount < mockFees.totalDue ? 'partial' : 'due';
		return mockFees;
	};

	// making the admin header invisible
	useEffect(() => {
		setShowAdminHeader(false);
		fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/get-students`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'authorization': `Bearer ${localStorage.getItem('token')}`
			}
		})
		.then(res => {
			if(!res.ok) {
				throw new Error('Failed to fetch students');
			}
			return res.json();
		})
		.then(data => {
			setStudentData(data);
		}).catch(err => {
			console.error('Error fetching students:', err);
		})
	}, [setShowAdminHeader]);

	const handleAddStudentChange = (e) => {
		const { name, value } = e.target;
		setNewStudent(prev => ({ ...prev, [name]: value }));
	};

	const handleAddStudentSubmit = async (e) => {
		e.preventDefault();
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/student/auth/register`,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newStudent)
      })
      const data = await res.json();
      if (!res.ok) { 
        console.error('Registration failed:', data);
        throw new Error('Registration failed');
      }
      console.log('New student added:', data);
		// Here you would send newStudent to backend or update state
		setShowAddForm(false);
		setNewStudent({
			name: '', roll: '', grade: '', section: '', gender: '', mobile: '', email: '', address: '', dob: '',
			pincode: ''
		});
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-yellow-50 via-yellow-100 to-amber-100 p-8">
			<div className="max-w-7xl mx-auto bg-white/90 rounded-2xl shadow-2xl p-8 border border-yellow-200">
				{/* Header */}
				<div className="flex justify-between items-center mb-8">
					<div>
						<h1 className="text-3xl font-bold text-yellow-700">Student Management</h1>
						<p className="text-gray-600 mt-2">Manage and monitor student information, health status, attendance, and fees</p>
					</div>
					
				</div>

				{/* Summary Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
					<div className="bg-white p-4 rounded-lg shadow-sm border border-yellow-200">
						<div className="flex items-center justify-between">
							<div>
								<h3 className="text-sm font-medium text-gray-600">Total Students</h3>
								<p className="text-2xl font-bold text-gray-900">{studentData.length}</p>
							</div>
							<div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
								<span className="text-blue-600 font-semibold">{studentData.length}</span>
							</div>
						</div>
					</div>
					
					<div className="bg-white p-4 rounded-lg shadow-sm border border-yellow-200">
						<div className="flex items-center justify-between">
							<div>
								<h3 className="text-sm font-medium text-gray-600">Present Today</h3>
								<p className="text-2xl font-bold text-green-600">
									{studentData.filter(s => getTodayAttendance(s)?.status === 'present').length}
								</p>
							</div>
							<CheckCircle className="w-8 h-8 text-green-500" />
						</div>
					</div>
					
					<div className="bg-white p-4 rounded-lg shadow-sm border border-yellow-200">
						<div className="flex items-center justify-between">
							<div>
								<h3 className="text-sm font-medium text-gray-600">Health Issues</h3>
								<p className="text-2xl font-bold text-red-600">
									{studentData.filter(s => {
										const health = getHealthStatus(s);
										return health === 'sick' || health === 'injured' || health === 'absent-sick';
									}).length}
								</p>
							</div>
							<Heart className="w-8 h-8 text-red-500" />
						</div>
					</div>
					
					<div className="bg-white p-4 rounded-lg shadow-sm border border-yellow-200">
						<div className="flex items-center justify-between">
							<div>
								<h3 className="text-sm font-medium text-gray-600">Fees Pending</h3>
								<p className="text-2xl font-bold text-orange-600">
									{studentData.filter(() => {
										const fees = getFeesStatus();
										return fees.status !== 'paid';
									}).length}
								</p>
							</div>
							<IndianRupee className="w-8 h-8 text-orange-500" />
						</div>
					</div>
				</div>

				{/* Search and Filter */}
				<div className="mb-6 flex gap-4">
					<div className="flex-1 relative">
						<Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
						<input
							type="text"
							placeholder="Search students..."
							className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
					<select className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500">
						<option value="">All Classes</option>
						<option value="X">Class X</option>
						<option value="IX">Class IX</option>
						{/* Add more class options */}
					</select>
					<select className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500">
						<option value="">All Sections</option>
						<option value="A">Section A</option>
						<option value="B">Section B</option>
						{/* Add more section options */}
					</select>
					<select className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500">
						<option value="">All Health Status</option>
						<option value="healthy">Healthy</option>
						<option value="sick">Sick</option>
						<option value="injured">Injured</option>
						<option value="absent-sick">Absent (Sick)</option>
					</select>
					<select className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500">
						<option value="">All Attendance</option>
						<option value="present">Present Today</option>
						<option value="absent">Absent Today</option>
						<option value="not-marked">Not Marked</option>
					</select>
				</div>

				{/* Students Table */}
				<div className="overflow-x-auto">
					<table className="w-full border-collapse">
						<thead>
							<tr className="bg-yellow-50">
								<th className="border-b border-yellow-100 px-6 py-3 text-left text-sm font-semibold text-yellow-800">Name</th>
								<th className="border-b border-yellow-100 px-6 py-3 text-left text-sm font-semibold text-yellow-800">Roll No.</th>
								<th className="border-b border-yellow-100 px-6 py-3 text-left text-sm font-semibold text-yellow-800">Class</th>
								<th className="border-b border-yellow-100 px-6 py-3 text-left text-sm font-semibold text-yellow-800">Section</th>
								<th className="border-b border-yellow-100 px-6 py-3 text-left text-sm font-semibold text-yellow-800">Health Status</th>
								<th className="border-b border-yellow-100 px-6 py-3 text-left text-sm font-semibold text-yellow-800">Attendance Today</th>
								<th className="border-b border-yellow-100 px-6 py-3 text-left text-sm font-semibold text-yellow-800">Fees Due</th>
								<th className="border-b border-yellow-100 px-6 py-3 text-left text-sm font-semibold text-yellow-800">Phone</th>
								<th className="border-b border-yellow-100 px-6 py-3 text-left text-sm font-semibold text-yellow-800">Actions</th>
							</tr>
						</thead>
						<tbody>
							{filteredStudents.map((student) => (
								<tr
									key={student.id}
									className="hover:bg-yellow-50 transition-colors"
								>
									<td className="border-b border-yellow-100 px-6 py-4">
										<div className="flex items-center gap-3">
											<div className="w-8 h-8 rounded-full bg-yellow-200 flex items-center justify-center">
												{student.name.charAt(0)}
											</div>
											<div>
												<div className="font-medium text-gray-900">{student.name}</div>
												<div className="text-sm text-gray-500">{student.email}</div>
											</div>
										</div>
									</td>
									<td className="border-b border-yellow-100 px-6 py-4 text-gray-600">{student.roll}</td>
									<td className="border-b border-yellow-100 px-6 py-4 text-gray-600">{student.grade}</td>
									<td className="border-b border-yellow-100 px-6 py-4 text-gray-600">{student.section}</td>
									
									{/* Health Status */}
									<td className="border-b border-yellow-100 px-6 py-4">
										{(() => {
											const healthStatus = getHealthStatus(student);
											const healthConfig = {
												healthy: { icon: Heart, color: 'text-green-600', bg: 'bg-green-100', text: 'Healthy' },
												sick: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100', text: 'Sick' },
												injured: { icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-100', text: 'Injured' },
												'absent-sick': { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100', text: 'Absent (Sick)' }
											};
											const config = healthConfig[healthStatus] || healthConfig.healthy;
											const Icon = config.icon;
											return (
												<div className="flex items-center gap-2">
													<Icon size={16} className={config.color} />
													<span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
														{config.text}
													</span>
												</div>
											);
										})()}
									</td>
									
									{/* Today's Attendance */}
									<td className="border-b border-yellow-100 px-6 py-4">
										{(() => {
											const todayAttendance = getTodayAttendance(student);
											if (!todayAttendance) {
												return (
													<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
														<Calendar size={12} className="mr-1" />
														Not Marked
													</span>
												);
											}
											return (
												<span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
													todayAttendance.status === 'present' 
														? 'bg-green-100 text-green-800' 
														: 'bg-red-100 text-red-800'
												}`}>
													{todayAttendance.status === 'present' ? (
														<><CheckCircle size={12} className="mr-1" />Present</>
													) : (
														<><AlertCircle size={12} className="mr-1" />Absent</>
													)}
												</span>
											);
										})()}
									</td>
									
									{/* Fees Due */}
									<td className="border-b border-yellow-100 px-6 py-4">
										{(() => {
											const feesStatus = getFeesStatus();
											return (
												<div className="space-y-1">
													<div className="flex items-center gap-1">
														<IndianRupee size={12} className="text-gray-500" />
														<span className={`text-sm font-medium ${
															feesStatus.status === 'paid' ? 'text-green-600' :
															feesStatus.status === 'partial' ? 'text-orange-600' : 'text-red-600'
														}`}>
															₹{feesStatus.dueAmount.toLocaleString()}
														</span>
													</div>
													<span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
														feesStatus.status === 'paid' ? 'bg-green-100 text-green-800' :
														feesStatus.status === 'partial' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
													}`}>
														{feesStatus.status === 'paid' ? 'Paid' :
														 feesStatus.status === 'partial' ? 'Partial' : 'Due'}
													</span>
												</div>
											);
										})()}
									</td>
									
									<td className="border-b border-yellow-100 px-6 py-4 text-gray-600">{student.mobile}</td>
									{/* <td className="border-b border-yellow-100 px-6 py-4">
										<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${student.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
											{student.status}
										</span>
									</td> */}
									<td className="border-b border-yellow-100 px-6 py-4">
										<div className="flex items-center gap-2">
											<button 
												className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50" 
												title="Mark Present"
											>
												<CheckCircle size={16} />
											</button>
											<button 
												className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50" 
												title="Mark Absent"
											>
												<AlertCircle size={16} />
											</button>
											<button 
												className="text-purple-600 hover:text-purple-800 p-1 rounded hover:bg-purple-50" 
												title="Health Status"
											>
												<Heart size={16} />
											</button>
											<button 
												className="text-orange-600 hover:text-orange-800 p-1 rounded hover:bg-orange-50" 
												title="Fees"
											>
												<IndianRupee size={16} />
											</button>
											<button className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50">
												<Edit2 size={16} />
											</button>
											<button className="text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-50">
												<MoreVertical size={16} />
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{/* Pagination */}
				<div className="mt-6 flex items-center justify-between">
					<div className="text-gray-600">
						Showing {filteredStudents.length} of {studentData.length} students
					</div>
					<div className="flex gap-2">
						<button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-yellow-50">Previous</button>
						<button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-yellow-50">Next</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Students;
