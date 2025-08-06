import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ChartBarIcon,
  SparklesIcon,
  Bars3Icon,
  XMarkIcon,
  PaperClipIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon as CheckCircleSolidIcon,
  XCircleIcon,
  PaperAirplaneIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  CogIcon,
  BellIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

function AdminDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [adminUser, setAdminUser] = useState(null);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:6969/api/complaints/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchComplaints = async (status = null) => {
    setLoadingData(true);
    try {
      let url = 'http://localhost:6969/api/complaints/all';
      if (status) {
        url += `?status=${status}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setComplaints(data.data.complaints);
      }
    } catch (error) {
      setError('Failed to fetch complaints');
    } finally {
      setLoadingData(false);
    }
  };

  // First useEffect - always called
  useEffect(() => {
    // Check for admin authentication
    const adminToken = localStorage.getItem('adminToken');
    const adminUserData = localStorage.getItem('adminUser');
    
    if (!adminToken || !adminUserData) {
      navigate('/admin-login');
      return;
    }

    try {
      const userData = JSON.parse(adminUserData);
      setAdminUser(userData);
    } catch (error) {
      console.error('Error parsing admin user data:', error);
      navigate('/admin-login');
    }
  }, [navigate]);

  // Second useEffect - always called
  useEffect(() => {
    // Only fetch data if adminUser is set
    if (adminUser) {
      fetchStats();
      if (activeSection === 'all-complaints' || activeSection === 'dashboard') {
        fetchComplaints();
      } else if (activeSection === 'pending') {
        fetchComplaints('pending');
      } else if (activeSection === 'in-progress') {
        fetchComplaints('in_progress');
      } else if (activeSection === 'resolved') {
        fetchComplaints('resolved');
      }
    }
  }, [activeSection, adminUser]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin-login');
  };

  const navigation = [
    { name: 'Dashboard', icon: ChartBarIcon, href: 'dashboard', current: activeSection === 'dashboard' },
    { name: 'All Complaints', icon: DocumentTextIcon, href: 'all-complaints', current: activeSection === 'all-complaints' },
    { name: 'Pending', icon: ClockIcon, href: 'pending', current: activeSection === 'pending' },
    { name: 'In Progress', icon: CogIcon, href: 'in-progress', current: activeSection === 'in-progress' },
    { name: 'Resolved', icon: CheckCircleIcon, href: 'resolved', current: activeSection === 'resolved' },
    { name: 'Users', icon: UserGroupIcon, href: 'users', current: activeSection === 'users' },
    { name: 'Settings', icon: CogIcon, href: 'settings', current: activeSection === 'settings' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const updateComplaintStatus = async (complaintId, newStatus, adminResponse = '') => {
    try {
      const response = await fetch(`http://localhost:6969/api/complaints/${complaintId}/update-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          status: newStatus,
          admin_response: adminResponse
        })
      });

      const data = await response.json();
      if (data.success) {
        // Refresh complaints list
        fetchComplaints();
        fetchStats();
      } else {
        setError(data.message || 'Failed to update status');
      }
    } catch (error) {
      setError('Failed to update complaint status');
    }
  };

  // Show loading state while checking auth
  if (!adminUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center">
                  <ShieldCheckIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Welcome, {adminUser?.name}!</h2>
                  <p className="text-gray-600">Admin Dashboard - Manage complaints and users</p>
                </div>
              </div>

              {/* Admin Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium text-gray-900">{adminUser?.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{adminUser?.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                  <ShieldCheckIcon className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="font-medium text-gray-900 capitalize">admin</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Complaints</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total_complaints}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.status_stats.pending}</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <ClockIcon className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">In Progress</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.status_stats.in_progress}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <CogIcon className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Resolved</p>
                      <p className="text-2xl font-bold text-green-600">{stats.status_stats.resolved}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <CheckCircleIcon className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Complaints */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Recent Complaints</h3>
                <button
                  onClick={() => setActiveSection('all-complaints')}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  View all
                </button>
              </div>
              
              {loadingData ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <span className="ml-3 text-gray-600">Loading complaints...</span>
                </div>
              ) : complaints.length === 0 ? (
                <div className="text-center py-8">
                  <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">No complaints found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {complaints.slice(0, 5).map((complaint) => (
                    <div key={complaint.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">{complaint.title}</h4>
                            <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {complaint.ticket_id}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{complaint.description.substring(0, 100)}...</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(complaint.status)}`}>
                          {complaint.status.replace('_', ' ')}
                        </span>
                        <button
                          onClick={() => setActiveSection('all-complaints')}
                          className="text-purple-600 hover:text-purple-700"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'all-complaints':
      case 'pending':
      case 'in-progress':
      case 'resolved':
        return (
          <div className="space-y-8">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {activeSection === 'all-complaints' && 'All Complaints'}
                    {activeSection === 'pending' && 'Pending Complaints'}
                    {activeSection === 'in-progress' && 'In Progress Complaints'}
                    {activeSection === 'resolved' && 'Resolved Complaints'}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {complaints.length} complaints found
                  </p>
                </div>
              </div>
            </div>

            {/* Complaints List */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8">
              {loadingData ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <span className="ml-3 text-gray-600">Loading complaints...</span>
                </div>
              ) : complaints.length === 0 ? (
                <div className="text-center py-12">
                  <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No complaints found</h3>
                  <p className="text-gray-600">No complaints match the current filter.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {complaints.map((complaint) => (
                    <div key={complaint.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">{complaint.title}</h4>
                            <span className="text-sm font-mono text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
                              {complaint.ticket_id}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-4">{complaint.description}</p>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(complaint.status)}`}>
                              {complaint.status.replace('_', ' ')}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(complaint.priority)}`}>
                              {complaint.priority}
                            </span>
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Created: {formatDate(complaint.created_at)}</span>
                            {complaint.resolved_at && (
                              <span>Resolved: {formatDate(complaint.resolved_at)}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {complaint.status === 'pending' && (
                            <button
                              onClick={() => updateComplaintStatus(complaint.id, 'in_progress')}
                              className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Start Progress
                            </button>
                          )}
                          {complaint.status === 'in_progress' && (
                            <button
                              onClick={() => updateComplaintStatus(complaint.id, 'resolved')}
                              className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Mark Resolved
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Admin Response */}
                      {complaint.admin_response && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <h5 className="text-sm font-medium text-blue-900 mb-2">Admin Response:</h5>
                          <p className="text-sm text-blue-800">{complaint.admin_response}</p>
                        </div>
                      )}

                      {/* Attachments */}
                      {complaint.attachments && complaint.attachments.length > 0 && (
                        <div className="mt-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-3">Attachments:</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {complaint.attachments.map((attachment, index) => (
                              <div key={index} className="relative group">
                                {attachment.file_type.startsWith('image/') ? (
                                  <div className="aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                                    <img
                                      src={attachment.file_url}
                                      alt={attachment.original_filename}
                                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.parentElement.innerHTML = `
                                          <div class="w-full h-full flex items-center justify-center bg-gray-100">
                                            <svg class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                          </div>
                                        `;
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div className="aspect-square bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                                    <DocumentTextIcon className="h-12 w-12 text-gray-400" />
                                  </div>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white text-xs p-2 rounded-b-xl">
                                  <p className="truncate font-medium">{attachment.original_filename}</p>
                                  <p className="text-xs opacity-75">{attachment.file_type}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">User Management</h2>
            <p className="text-gray-600">User management interface will be implemented here.</p>
          </div>
        );

      case 'settings':
        return (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Settings</h2>
            <p className="text-gray-600">Admin settings interface will be implemented here.</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-purple-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-white/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
                >
                  <Bars3Icon className="h-6 w-6" />
                </button>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent ml-4 lg:ml-0">
                  Query Pro Admin
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <ShieldCheckIcon className="h-5 w-5 text-purple-600" />
                  <span className="text-sm text-gray-700">{adminUser?.name}</span>
                </div>
                <button 
                  onClick={() => setAiAssistantOpen(true)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-purple-600 transition-colors bg-white/50 rounded-lg"
                >
                  <SparklesIcon className="h-5 w-5" />
                  <span>AI Assistant</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/90 backdrop-blur-sm transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0 transition duration-300 ease-in-out shadow-xl lg:shadow-none`}>
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <nav className="mt-8 px-4">
              <ul className="space-y-2">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <button
                      onClick={() => setActiveSection(item.href)}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                        item.current
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </button>
                  </li>
                ))}
                
                {/* Logout Button */}
                <li className="pt-4 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                    Logout
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 lg:ml-0">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {renderContent()}
            </main>
          </div>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
