import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { 
  Menu, 
  X
} from 'lucide-react'
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Settings,
  ChevronDown,
  ChevronRight,
  User,
  LogOut,
  Plus,
  ArrowLeft,
  Save,
  RefreshCw,
  Eye,
  ArrowRight
} from 'lucide-react'
import { jobsAPI, signsAPI, standardRatesAPI, supabase } from './lib/supabase.js'
import { netsuiteClient } from './lib/netsuiteClient.js'
import './App.css'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [adminMenuOpen, setAdminMenuOpen] = useState(false)
  const [jobEstimatesMenuOpen, setJobEstimatesMenuOpen] = useState(false)
  const [activeMenuItem, setActiveMenuItem] = useState('dashboard')
  
  // Database states
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [standardRates, setStandardRates] = useState({})
  
  // NetSuite states
  const [estimateRequests, setEstimateRequests] = useState([])
  const [netsuiteLoading, setNetsuiteLoading] = useState(false)
  const [netsuiteError, setNetsuiteError] = useState(null)
  const [selectedRequest, setSelectedRequest] = useState(null)
  
  // Job creation states
  const [jobCreationStep, setJobCreationStep] = useState(null) // null, 'job-info', 'job-estimate-summary', 'sign-entry'
  const [editingSignIndex, setEditingSignIndex] = useState(null)
  const [currentJob, setCurrentJob] = useState({
    id: null,
    jobNumber: '',
    jobName: '',
    jobAddress: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    estimateCompletedBy: '',
    projectManager: '',
    estimateDate: '',
    signs: []
  })
  
  const [currentSign, setCurrentSign] = useState({
    signType: '',
    quantity: 1,
    artDept: {
      design: { hours: 0, rate: 127.33 },
      cad: { hours: 0, rate: 127.33 },
      router: { hours: 0, rate: 75.40 },
      vinyl: { hours: 0, rate: 75.40 },
      printing: { hours: 0, rate: 75.40 },
      cutting: { hours: 0, rate: 75.40 },
      drill: { hours: 0, rate: 75.40 },
      misc: { hours: 0, rate: 75.40 }
    },
    fabrication: {
      channelLetters: { hours: 0, rate: 100.55 },
      trimcap: { hours: 0, rate: 49.02 },
      aluminum: { hours: 0, rate: 97.83 },
      wiring: { hours: 0, rate: 100.55 },
      prep: { hours: 0, rate: 53.13 },
      paint: { hours: 0, rate: 97.96 },
      assembly: { hours: 0, rate: 100.55 },
      packing: { hours: 0, rate: 94.36 },
      receive: { hours: 0, rate: 94.36 },
      steel: { hours: 0, rate: 97.83 },
      misc1: { hours: 0, rate: 97.83 },
      misc2: { hours: 0, rate: 97.83 }
    },
    installation: {
      serviceTruck: { hours: 0, rate: 173.00 },
      bucketVan: { hours: 0, rate: 233.55 },
      elliot60: { hours: 0, rate: 259.50 },
      elliot75: { hours: 0, rate: 324.37 },
      install3: { hours: 0, rate: 389.25 },
      install4: { hours: 0, rate: 519.00 }
    },
    subs: [
      { name: 'Buckhoe', cost: 0 },
      { name: 'Soil Removal', cost: 432.50 },
      { name: 'Concrete', cost: 432.50 },
      { name: 'Delivery', cost: 605.50 },
      { name: 'Environmental chg', cost: 43.25 },
      { name: 'Fuel Surcharge 6.5%', cost: 0 }
    ],
    subcontractors: [
      { name: '', cost: 0 }
    ],
    materials: [
      { name: '', type: '', qty: 0, cost: 0 }
    ],
    crating: {
      cratingLabor: { qty: 0, cost: 81.81 },
      packingMaterials: { qty: 1, cost: 0 },
      perDiem: { qty: 0, cost: 0 },
      hotel: { qty: 0, cost: 225.00 }
    }
  })

  // Load data on component mount
  useEffect(() => {
    loadJobs()
    loadStandardRates()
  }, [])

  // Database functions
  const loadJobs = async () => {
    try {
      setLoading(true)
      const jobsData = await jobsAPI.getAllJobs()
      setJobs(jobsData)
    } catch (err) {
      setError('Failed to load jobs: ' + err.message)
      console.error('Error loading jobs:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadStandardRates = async () => {
    try {
      const rates = await standardRatesAPI.getStandardRates()
      const ratesMap = {}
      rates.forEach(rate => {
        if (!ratesMap[rate.department]) {
          ratesMap[rate.department] = {}
        }
        ratesMap[rate.department][rate.task_name] = rate.standard_rate
      })
      setStandardRates(ratesMap)
    } catch (err) {
      console.error('Error loading standard rates:', err)
    }
  }

  // NetSuite functions
  const loadEstimateRequests = async () => {
    try {
      setNetsuiteLoading(true)
      setNetsuiteError(null)
      const response = await netsuiteClient.fetchPendingEstimateRequests()
      setEstimateRequests(response.items)
    } catch (err) {
      setNetsuiteError('Failed to load estimate requests: ' + err.message)
      console.error('Error loading estimate requests:', err)
    } finally {
      setNetsuiteLoading(false)
    }
  }

  const convertRequestToJobEstimate = async (requestId) => {
    try {
      setNetsuiteLoading(true)
      const result = await netsuiteClient.convertRequestToJobEstimate(requestId)
      
      if (result.success) {
        // Find the request to convert
        const request = estimateRequests.find(req => req.id === requestId)
        if (request) {
          // Create a new job estimate with the request data
          const jobData = {
            jobNumber: result.jobEstimateId,
            jobName: request.job_name,
            jobAddress: '', // Not available in estimate request
            contactName: request.requested_by_name,
            contactEmail: '', // Not available in estimate request
            contactPhone: '', // Not available in estimate request
            estimateCompletedBy: request.assigned_to_name,
            projectManager: request.assigned_to_name,
            estimateDate: new Date().toISOString().split('T')[0]
          }
          
          // Create the job estimate
          await createJob(jobData)
          
          // Refresh estimate requests to remove the converted one
          await loadEstimateRequests()
          
          // Switch to job estimates view
          setActiveMenuItem('job-estimates')
          
          return { success: true, message: 'Successfully converted to job estimate!' }
        }
      }
      
      return result
    } catch (err) {
      console.error('Error converting request:', err)
      return { success: false, error: err.message }
    } finally {
      setNetsuiteLoading(false)
    }
  }

  const createJob = async (jobData) => {
    try {
      setLoading(true)
      const newJob = await jobsAPI.createJob(jobData)
      setCurrentJob({
        ...currentJob,
        id: newJob.id,
        ...jobData,
        signs: [] // Initialize empty signs array
      })
      await loadJobs() // Refresh jobs list
      return newJob
    } catch (err) {
      setError('Failed to create job: ' + err.message)
      console.error('Error creating job:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const loadSignsForJob = async (jobId) => {
    try {
      const signs = await signsAPI.getSignsByJobId(jobId)
      setCurrentJob(prev => ({
        ...prev,
        signs: signs || []
      }))
    } catch (err) {
      console.error('Error loading signs:', err)
      setError('Failed to load signs: ' + err.message)
    }
  }

  const saveJob = async () => {
    try {
      setLoading(true)
      if (currentJob.id) {
        await jobsAPI.updateJob(currentJob.id, {
          job_number: currentJob.jobNumber,
          job_name: currentJob.jobName,
          job_address: currentJob.jobAddress,
          contact_name: currentJob.contactName,
          contact_email: currentJob.contactEmail,
          contact_phone: currentJob.contactPhone,
          estimate_completed_by: currentJob.estimateCompletedBy,
          project_manager: currentJob.projectManager,
          estimate_date: currentJob.estimateDate
        })
        await loadJobs()
      }
    } catch (err) {
      setError('Failed to save job: ' + err.message)
      console.error('Error saving job:', err)
    } finally {
      setLoading(false)
    }
  }

  const deleteJob = async (jobId) => {
    try {
      setLoading(true)
      await jobsAPI.deleteJob(jobId)
      await loadJobs()
    } catch (err) {
      setError('Failed to delete job: ' + err.message)
      console.error('Error deleting job:', err)
    } finally {
      setLoading(false)
    }
  }

  const saveDepartmentData = async (signId) => {
    try {
      // Save Art Department data
      for (const [task, data] of Object.entries(currentSign.artDept)) {
        if (data.hours > 0) {
          await supabase.from('jobestimate_art_department').insert({
            sign_id: signId,
            task_name: task,
            task_type: task,
            hours: data.hours,
            rate: data.rate
          })
        }
      }

      // Save Fabrication Department data
      for (const [task, data] of Object.entries(currentSign.fabrication)) {
        if (data.hours > 0) {
          await supabase.from('jobestimate_fabrication_department').insert({
            sign_id: signId,
            task_name: task,
            task_type: task,
            hours: data.hours,
            rate: data.rate
          })
        }
      }

      // Save Installation Department data
      for (const [task, data] of Object.entries(currentSign.installation)) {
        if (data.hours > 0) {
          await supabase.from('jobestimate_installation_department').insert({
            sign_id: signId,
            task_name: task,
            task_type: task,
            hours: data.hours,
            rate: data.rate
          })
        }
      }

      // Save SubContractors data
      for (const item of currentSign.subcontractors) {
        if (item.name && item.cost > 0) {
          await supabase.from('jobestimate_subcontractors').insert({
            sign_id: signId,
            description: item.name,
            cost: item.cost
          })
        }
      }

      // Save Materials data
      for (const item of currentSign.materials) {
        if (item.name && item.cost > 0) {
          await supabase.from('jobestimate_materials').insert({
            sign_id: signId,
            material_name: item.name,
            material_type: item.type || '',
            quantity: item.qty || 1,
            unit_cost: item.cost,
            markup_percentage: 0 // Default markup
          })
        }
      }

      // Save Crating & Other Fees data
      for (const [item, data] of Object.entries(currentSign.crating)) {
        if (data.qty > 0 && data.cost > 0) {
          await supabase.from('jobestimate_crating_fees').insert({
            sign_id: signId,
            item_name: item,
            quantity: data.qty,
            unit_cost: data.cost,
            total: data.qty * data.cost
          })
        }
      }
    } catch (error) {
      console.error('Error saving department data:', error)
      throw error
    }
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { 
      id: 'job-estimates-parent', 
      label: 'Job Estimates', 
      icon: FileText, 
      isParent: true,
      submenu: [
        { id: 'job-estimate-request', label: 'Job Estimate Request', icon: Plus },
        { id: 'job-estimates', label: 'Job Estimates', icon: FileText }
      ]
    },
    { id: 'netsuite-chat', label: 'Netsuite Chat', icon: MessageSquare },
  ]

  const adminItems = [
    { id: 'configuration', label: 'Configuration', icon: Settings },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200">
          <h1 className="text-xl font-bold text-slate-900">Ais360</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-500 hover:text-slate-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              
              if (item.isParent) {
                return (
                  <div key={item.id}>
                    <button
                      onClick={() => setJobEstimatesMenuOpen(!jobEstimatesMenuOpen)}
                      className="w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </div>
                      {jobEstimatesMenuOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    
                    {jobEstimatesMenuOpen && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.submenu.map((subItem) => {
                          const SubIcon = subItem.icon
                          return (
                            <button
                              key={subItem.id}
                              onClick={() => {
                                setActiveMenuItem(subItem.id)
                                setSidebarOpen(false)
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-3 transition-colors text-sm ${
                                activeMenuItem === subItem.id
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'text-slate-500 hover:bg-slate-50'
                              }`}
                            >
                              <SubIcon className="h-4 w-4" />
                              <span>{subItem.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              }
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveMenuItem(item.id)
                    setSidebarOpen(false)
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-3 transition-colors ${
                    activeMenuItem === item.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              )
            })}
            
            {/* Admin Section */}
            <div className="pt-4">
              <button
                onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                className="w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Settings className="h-5 w-5" />
                  <span>Admin</span>
                </div>
                {adminMenuOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              
              {adminMenuOpen && (
                <div className="ml-8 mt-2 space-y-1">
                  {adminItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveMenuItem(item.id)
                          setSidebarOpen(false)
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-3 transition-colors ${
                          activeMenuItem === item.id
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-sm">{item.label}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>

      {/* Header */}
      <header className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-white border-b border-slate-200 h-16">
        <div className="flex items-center justify-between h-full px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-500 hover:text-slate-700"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 text-slate-700 hover:text-slate-900"
              >
                <User className="h-5 w-5" />
                <span className="hidden sm:block">John Doe</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1">
                  <a href="#" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Profile</a>
                  <a href="#" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    <div className="flex items-center space-x-2">
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </div>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className={`pt-16 transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'lg:ml-64' : 'ml-0'
      } lg:ml-64`}>
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Dashboard */}
            {activeMenuItem === 'dashboard' && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Dashboard</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Total Jobs</h3>
                    <p className="text-3xl font-bold text-blue-600">24</p>
                    <p className="text-sm text-slate-500 mt-1">+12% from last month</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Active Estimates</h3>
                    <p className="text-3xl font-bold text-green-600">8</p>
                    <p className="text-sm text-slate-500 mt-1">3 pending approval</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Revenue</h3>
                    <p className="text-3xl font-bold text-purple-600">$45,230</p>
                    <p className="text-sm text-slate-500 mt-1">This month</p>
                  </div>
                </div>
              </div>
            )}

            {/* Job Estimate Request */}
            {activeMenuItem === 'job-estimate-request' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Job Estimate Requests</h2>
                  <Button
                    onClick={loadEstimateRequests}
                    disabled={netsuiteLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {netsuiteLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Loading...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                      </>
                    )}
                  </Button>
                </div>

                {/* Error Display */}
                {netsuiteError && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800">{netsuiteError}</p>
                    <button 
                      onClick={() => setNetsuiteError(null)}
                      className="text-red-600 hover:text-red-800 text-sm underline mt-1"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {/* Estimate Requests Table */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                  <div className="p-6">
                    {netsuiteLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-slate-600">Loading estimate requests...</span>
                      </div>
                    ) : estimateRequests.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-slate-400 mb-4">
                          <FileText className="h-12 w-12 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 mb-2">No Pending Requests</h3>
                        <p className="text-slate-500">All estimate requests have been completed or there are no new requests.</p>
                        <Button
                          onClick={loadEstimateRequests}
                          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Check for New Requests
                        </Button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Request ID
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Job Name
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Priority
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Assigned To
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Due Date
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-slate-200">
                            {estimateRequests.map((request) => (
                              <tr key={request.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                  {request.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                  {request.job_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${netsuiteClient.getPriorityColor(request.priority_name)}`}>
                                    {request.priority_name}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${netsuiteClient.getStatusColor(request.status_name)}`}>
                                    {request.status_name}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                  {request.assigned_to_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                  {netsuiteClient.formatDate(request.bid_due_date)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                  <Button
                                    onClick={() => setSelectedRequest(request)}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3 py-1"
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                  <Button
                                    onClick={() => convertRequestToJobEstimate(request.id)}
                                    disabled={netsuiteLoading}
                                    className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1"
                                  >
                                    <ArrowRight className="h-3 w-3 mr-1" />
                                    Convert
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* Request Detail Modal */}
                {selectedRequest && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-slate-900">
                            Request Details - {selectedRequest.id}
                          </h3>
                          <button
                            onClick={() => setSelectedRequest(null)}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-slate-700">Job Name</label>
                              <p className="text-slate-900">{selectedRequest.job_name}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-700">Priority</label>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${netsuiteClient.getPriorityColor(selectedRequest.priority_name)}`}>
                                {selectedRequest.priority_name}
                              </span>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-700">Status</label>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${netsuiteClient.getStatusColor(selectedRequest.status_name)}`}>
                                {selectedRequest.status_name}
                              </span>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-700">Assigned To</label>
                              <p className="text-slate-900">{selectedRequest.assigned_to_name}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-700">Requested By</label>
                              <p className="text-slate-900">{selectedRequest.requested_by_name}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-700">Due Date</label>
                              <p className="text-slate-900">{netsuiteClient.formatDate(selectedRequest.bid_due_date)}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-700">Date Submitted</label>
                              <p className="text-slate-900">{netsuiteClient.formatDate(selectedRequest.date_submitted)}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-700">Estimate Due</label>
                              <p className="text-slate-900">{netsuiteClient.formatDate(selectedRequest.estimate_due_date)}</p>
                            </div>
                          </div>
                          
                          {selectedRequest.estimator_note && (
                            <div>
                              <label className="text-sm font-medium text-slate-700">Estimator Notes</label>
                              <p className="text-slate-900 bg-slate-50 p-3 rounded-lg mt-1">
                                {selectedRequest.estimator_note}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-slate-200">
                          <Button
                            onClick={() => setSelectedRequest(null)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700"
                          >
                            Close
                          </Button>
                          <Button
                            onClick={() => {
                              convertRequestToJobEstimate(selectedRequest.id)
                              setSelectedRequest(null)
                            }}
                            disabled={netsuiteLoading}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <ArrowRight className="h-4 w-4 mr-2" />
                            Convert to Job Estimate
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Job Estimates */}
            {activeMenuItem === 'job-estimates' && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Job Estimates</h2>
                
                {/* Error Display */}
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800">{error}</p>
                    <button 
                      onClick={() => setError(null)}
                      className="text-red-600 hover:text-red-800 text-sm underline mt-1"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
                
                <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-slate-900">Recent Estimates</h3>
                      <Button
                        onClick={() => {
                          // Reset current job state
                          setCurrentJob({
                            id: null,
                            jobNumber: '',
                            jobName: '',
                            jobAddress: '',
                            contactName: '',
                            contactEmail: '',
                            contactPhone: '',
                            estimateCompletedBy: '',
                            projectManager: '',
                            estimateDate: new Date().toISOString().split('T')[0],
                            signs: []
                          })
                          setActiveMenuItem('job-creation')
                          setJobCreationStep('job-info')
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        New Estimate
                      </Button>
                    </div>
                    
                    {loading ? (
                      <div className="text-center py-8">
                        <p className="text-slate-500">Loading jobs...</p>
                      </div>
                    ) : jobs.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-slate-500">No job estimates found. Create your first estimate to get started.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {jobs.map((job) => (
                          <div key={job.id} className="border border-slate-200 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-slate-900">{job.job_name}</h4>
                                <p className="text-sm text-slate-500">
                                  {job.job_number} • Created: {new Date(job.created_at).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-slate-600 mt-1">
                                  Contact: {job.contact_name} • PM: {job.project_manager}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  job.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                  job.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                                  job.status === 'approved' ? 'bg-green-100 text-green-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={async () => {
                                    setCurrentJob({
                                      id: job.id,
                                      jobNumber: job.job_number,
                                      jobName: job.job_name,
                                      jobAddress: job.job_address,
                                      contactName: job.contact_name,
                                      contactEmail: job.contact_email,
                                      contactPhone: job.contact_phone,
                                      estimateCompletedBy: job.estimate_completed_by,
                                      projectManager: job.project_manager,
                                      estimateDate: job.estimate_date,
                                      signs: []
                                    })
                                    await loadSignsForJob(job.id)
                                    setActiveMenuItem('job-creation')
                                    setJobCreationStep('job-estimate-summary')
                                  }}
                                >
                                  View
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteJob(job.id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Netsuite Chat */}
            {activeMenuItem === 'netsuite-chat' && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Netsuite Chat</h2>
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 h-96">
                  <div className="p-6 h-full flex flex-col">
                    <div className="flex-1 bg-slate-50 rounded-lg p-4 mb-4">
                      <p className="text-slate-500">Chat interface will be available here.</p>
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Type your message..."
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <Button className="bg-blue-600 hover:bg-blue-700">Send</Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Job Creation */}
            {activeMenuItem === 'job-creation' && (
              <div>
                {/* Job Creation Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setActiveMenuItem('job-estimates')
                        setJobCreationStep(null)
                      }}
                      className="flex items-center space-x-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back to Estimates</span>
                    </Button>
                    <h2 className="text-2xl font-bold text-slate-900">
                      {jobCreationStep === 'job-info' && 'Job Information'}
                      {jobCreationStep === 'job-estimate-summary' && 'Job Estimate Summary'}
                      {jobCreationStep === 'sign-entry' && 'Sign Entry'}
                    </h2>
                  </div>
                  
                  {/* Progress Steps */}
                  <div className="flex items-center space-x-2">
                    <div className={`px-3 py-1 rounded-full text-sm ${
                      jobCreationStep === 'job-info' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      1. Job Info
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm ${
                      jobCreationStep === 'job-estimate-summary' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      2. Job Estimate Summary
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm ${
                      jobCreationStep === 'sign-entry' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      3. Sign Entry
                    </div>
                  </div>
                </div>

                {/* Job Information Form */}
                {jobCreationStep === 'job-info' && (
                  <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Job Number</label>
                        <input
                          type="text"
                          value={currentJob.jobNumber}
                          onChange={(e) => setCurrentJob({...currentJob, jobNumber: e.target.value})}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter job number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Job Name</label>
                        <input
                          type="text"
                          value={currentJob.jobName}
                          onChange={(e) => setCurrentJob({...currentJob, jobName: e.target.value})}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter job name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Job Address</label>
                        <input
                          type="text"
                          value={currentJob.jobAddress}
                          onChange={(e) => setCurrentJob({...currentJob, jobAddress: e.target.value})}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter job address"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Contact Name</label>
                        <input
                          type="text"
                          value={currentJob.contactName}
                          onChange={(e) => setCurrentJob({...currentJob, contactName: e.target.value})}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter contact name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Contact Email</label>
                        <input
                          type="email"
                          value={currentJob.contactEmail}
                          onChange={(e) => setCurrentJob({...currentJob, contactEmail: e.target.value})}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter contact email"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Contact Phone</label>
                        <input
                          type="tel"
                          value={currentJob.contactPhone}
                          onChange={(e) => setCurrentJob({...currentJob, contactPhone: e.target.value})}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter contact phone"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Estimate Completed By</label>
                        <input
                          type="text"
                          value={currentJob.estimateCompletedBy}
                          onChange={(e) => setCurrentJob({...currentJob, estimateCompletedBy: e.target.value})}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter estimator name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Project Manager</label>
                        <input
                          type="text"
                          value={currentJob.projectManager}
                          onChange={(e) => setCurrentJob({...currentJob, projectManager: e.target.value})}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter project manager"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Estimate Date</label>
                        <input
                          type="date"
                          value={currentJob.estimateDate}
                          onChange={(e) => setCurrentJob({...currentJob, estimateDate: e.target.value})}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-6">
                      <Button
                        onClick={async () => {
                          try {
                            if (!currentJob.estimateDate) {
                              setCurrentJob({...currentJob, estimateDate: new Date().toISOString().split('T')[0]})
                            }
                            await createJob({
                              jobNumber: currentJob.jobNumber,
                              jobName: currentJob.jobName,
                              jobAddress: currentJob.jobAddress,
                              contactName: currentJob.contactName,
                              contactEmail: currentJob.contactEmail,
                              contactPhone: currentJob.contactPhone,
                              estimateCompletedBy: currentJob.estimateCompletedBy,
                              projectManager: currentJob.projectManager,
                              estimateDate: currentJob.estimateDate || new Date().toISOString().split('T')[0]
                            })
                            setJobCreationStep('job-estimate-summary')
                          } catch (err) {
                            // Error is handled in createJob function
                          }
                        }}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                      >
                        {loading ? 'Creating...' : 'Create Job Estimate'}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Job Estimate Summary */}
                {jobCreationStep === 'job-estimate-summary' && (
                  <div className="space-y-6">
                    {/* Job Info Display */}
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Job Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div><strong>Job #:</strong> {currentJob.jobNumber}</div>
                        <div><strong>Job Name:</strong> {currentJob.jobName}</div>
                        <div><strong>Address:</strong> {currentJob.jobAddress}</div>
                        <div><strong>Contact:</strong> {currentJob.contact}</div>
                        <div><strong>Estimator:</strong> {currentJob.estimateCompletedBy}</div>
                        <div><strong>PM:</strong> {currentJob.projectManager}</div>
                      </div>
                    </div>

                    {/* Signs Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                      <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-lg font-semibold text-slate-900">Signs</h3>
                          <Button
                            onClick={() => {
                              setEditingSignIndex(null)
                              setJobCreationStep('sign-entry')
                            }}
                            className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
                          >
                            <Plus className="h-4 w-4" />
                            <span>Add Sign Estimate</span>
                          </Button>
                        </div>

                        {currentJob.signs.length === 0 ? (
                          <div className="text-center py-8 text-slate-500">
                            <p>No signs added yet. Click "Add Sign Estimate" to get started.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {currentJob.signs.map((sign, index) => (
                              <div key={index} className="border border-slate-200 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h4 className="font-medium text-slate-900">Sign #{index + 1}: {sign.signType}</h4>
                                    <p className="text-sm text-slate-500">Quantity: {sign.quantity}</p>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setEditingSignIndex(index)
                                        setCurrentSign(sign)
                                        setJobCreationStep('sign-entry')
                                      }}
                                      className="text-blue-600 hover:text-blue-800"
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={async () => {
                                        try {
                                          setLoading(true)
                                          const signToDelete = currentJob.signs[index]
                                          if (signToDelete.id) {
                                            await signsAPI.deleteSign(signToDelete.id)
                                          }
                                          const newSigns = [...currentJob.signs]
                                          newSigns.splice(index, 1)
                                          setCurrentJob({...currentJob, signs: newSigns})
                                        } catch (error) {
                                          console.error('Error deleting sign:', error)
                                          setError('Failed to delete sign. Please try again.')
                                        } finally {
                                          setLoading(false)
                                        }
                                      }}
                                      className="text-red-600 hover:text-red-800"
                                      disabled={loading}
                                    >
                                      Delete
                                    </Button>
                                  </div>
                                </div>
                                <div className="text-sm text-slate-600">
                                  <p>Total: $0.00</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        onClick={() => setJobCreationStep('job-info')}
                        className="flex items-center space-x-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Job Info</span>
                      </Button>
                      <div className="flex space-x-3">
                        <Button
                          variant="outline"
                          className="flex items-center space-x-2"
                        >
                          <Save className="h-4 w-4" />
                          <span>Save Draft</span>
                        </Button>
                        <Button
                          className="bg-green-600 hover:bg-green-700 flex items-center space-x-2"
                          onClick={() => {
                            setActiveMenuItem('job-estimates')
                            setJobCreationStep(null)
                          }}
                        >
                          <span>Complete Job Estimate</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sign Entry Screen */}
                {jobCreationStep === 'sign-entry' && (
                  <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                    <div className="p-6">
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {editingSignIndex !== null ? 'Edit Sign Estimate' : 'Add Sign Estimate'}
                        </h3>
                      </div>

                      {/* Sign Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Sign Type</label>
                          <input
                            type="text"
                            value={currentSign.signType}
                            onChange={(e) => setCurrentSign({...currentSign, signType: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter sign type"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Quantity</label>
                          <input
                            type="number"
                            value={currentSign.quantity}
                            onChange={(e) => setCurrentSign({...currentSign, quantity: parseInt(e.target.value) || 1})}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="1"
                          />
                        </div>
                      </div>

                      <div className="space-y-8">
                        {/* Art Department */}
                        <div>
                          <h4 className="text-lg font-semibold text-slate-900 mb-4 bg-blue-100 p-3 rounded-t-lg">Art Department</h4>
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-slate-300">
                              <thead>
                                <tr className="bg-slate-100">
                                  <th className="border border-slate-300 px-4 py-2 text-left font-medium">Task</th>
                                  <th className="border border-slate-300 px-4 py-2 text-center font-medium">Hours</th>
                                  <th className="border border-slate-300 px-4 py-2 text-center font-medium">Rate</th>
                                  <th className="border border-slate-300 px-4 py-2 text-center font-medium">Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {Object.entries(currentSign.artDept).map(([key, value]) => (
                                  <tr key={key} className="hover:bg-slate-50">
                                    <td className="border border-slate-300 px-4 py-2 font-medium capitalize bg-yellow-100">
                                      {key === 'cutting' ? 'Cutting lexan/acrylic' : 
                                       key === 'drill' ? 'Drill & Tap' :
                                       key === 'misc' ? 'Misc. / Install Patterns' :
                                       key.replace(/([A-Z])/g, ' $1')}
                                    </td>
                                    <td className="border border-slate-300 px-2 py-2">
                                      <input
                                        type="number"
                                        step="0.1"
                                        value={value.hours}
                                        onChange={(e) => setCurrentSign({
                                          ...currentSign,
                                          artDept: {
                                            ...currentSign.artDept,
                                            [key]: { ...value, hours: parseFloat(e.target.value) || 0 }
                                          }
                                        })}
                                        className="w-full px-2 py-1 border-0 bg-transparent text-center focus:outline-none focus:bg-white focus:border focus:border-blue-500 rounded"
                                      />
                                    </td>
                                    <td className="border border-slate-300 px-2 py-2">
                                      <input
                                        type="number"
                                        step="0.01"
                                        value={value.rate}
                                        onChange={(e) => setCurrentSign({
                                          ...currentSign,
                                          artDept: {
                                            ...currentSign.artDept,
                                            [key]: { ...value, rate: parseFloat(e.target.value) || 0 }
                                          }
                                        })}
                                        className="w-full px-2 py-1 border-0 bg-transparent text-center focus:outline-none focus:bg-white focus:border focus:border-blue-500 rounded"
                                      />
                                    </td>
                                    <td className="border border-slate-300 px-4 py-2 text-center font-medium">
                                      ${(value.hours * value.rate).toFixed(2)}
                                    </td>
                                  </tr>
                                ))}
                                <tr className="bg-slate-100 font-bold">
                                  <td className="border border-slate-300 px-4 py-2">Art Dept. Totals</td>
                                  <td className="border border-slate-300 px-4 py-2 text-center">-</td>
                                  <td className="border border-slate-300 px-4 py-2"></td>
                                  <td className="border border-slate-300 px-4 py-2 text-center">
                                    ${Object.values(currentSign.artDept).reduce((sum, item) => sum + (item.hours * item.rate), 0).toFixed(2)}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Fabrication Department */}
                        <div>
                          <h4 className="text-lg font-semibold text-slate-900 mb-4 bg-green-100 p-3 rounded-t-lg">Fabrication Department</h4>
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-slate-300">
                              <thead>
                                <tr className="bg-slate-100">
                                  <th className="border border-slate-300 px-4 py-2 text-left font-medium">Task</th>
                                  <th className="border border-slate-300 px-4 py-2 text-center font-medium">Hours</th>
                                  <th className="border border-slate-300 px-4 py-2 text-center font-medium">Rate</th>
                                  <th className="border border-slate-300 px-4 py-2 text-center font-medium">Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {Object.entries(currentSign.fabrication).map(([key, value]) => (
                                  <tr key={key} className="hover:bg-slate-50">
                                    <td className="border border-slate-300 px-4 py-2 font-medium capitalize bg-yellow-100">
                                      {key === 'channelLetters' ? 'Channel Letters' :
                                       key === 'trimcap' ? 'Trimcap' :
                                       key === 'aluminum' ? 'Aluminum Fabrication' :
                                       key === 'wiring' ? 'Wiring' :
                                       key === 'prep' ? 'Prep.' :
                                       key === 'paint' ? 'Paint' :
                                       key === 'assembly' ? 'Assembly' :
                                       key === 'packing' ? 'Packing' :
                                       key === 'receive' ? 'Receive & Inspect' :
                                       key === 'steel' ? 'Steel Fabrication' :
                                       key === 'misc1' ? 'Misc.' :
                                       key === 'misc2' ? 'Misc.' :
                                       key.replace(/([A-Z])/g, ' $1')}
                                    </td>
                                    <td className="border border-slate-300 px-2 py-2">
                                      <input
                                        type="number"
                                        step="0.1"
                                        value={value.hours}
                                        onChange={(e) => setCurrentSign({
                                          ...currentSign,
                                          fabrication: {
                                            ...currentSign.fabrication,
                                            [key]: { ...value, hours: parseFloat(e.target.value) || 0 }
                                          }
                                        })}
                                        className="w-full px-2 py-1 border-0 bg-transparent text-center focus:outline-none focus:bg-white focus:border focus:border-blue-500 rounded"
                                      />
                                    </td>
                                    <td className="border border-slate-300 px-2 py-2">
                                      <input
                                        type="number"
                                        step="0.01"
                                        value={value.rate}
                                        onChange={(e) => setCurrentSign({
                                          ...currentSign,
                                          fabrication: {
                                            ...currentSign.fabrication,
                                            [key]: { ...value, rate: parseFloat(e.target.value) || 0 }
                                          }
                                        })}
                                        className="w-full px-2 py-1 border-0 bg-transparent text-center focus:outline-none focus:bg-white focus:border focus:border-blue-500 rounded"
                                      />
                                    </td>
                                    <td className="border border-slate-300 px-4 py-2 text-center font-medium">
                                      ${(value.hours * value.rate).toFixed(2)}
                                    </td>
                                  </tr>
                                ))}
                                <tr className="bg-slate-100 font-bold">
                                  <td className="border border-slate-300 px-4 py-2">Fab. Dept. Totals</td>
                                  <td className="border border-slate-300 px-4 py-2 text-center">-</td>
                                  <td className="border border-slate-300 px-4 py-2"></td>
                                  <td className="border border-slate-300 px-4 py-2 text-center">
                                    ${Object.values(currentSign.fabrication).reduce((sum, item) => sum + (item.hours * item.rate), 0).toFixed(2)}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Installation Department */}
                        <div>
                          <h4 className="text-lg font-semibold text-slate-900 mb-4 bg-orange-100 p-3 rounded-t-lg">Installation Department</h4>
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-slate-300">
                              <thead>
                                <tr className="bg-slate-100">
                                  <th className="border border-slate-300 px-4 py-2 text-left font-medium">Task</th>
                                  <th className="border border-slate-300 px-4 py-2 text-center font-medium">Hours</th>
                                  <th className="border border-slate-300 px-4 py-2 text-center font-medium">Rate</th>
                                  <th className="border border-slate-300 px-4 py-2 text-center font-medium">Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {Object.entries(currentSign.installation).map(([key, value]) => (
                                  <tr key={key} className="hover:bg-slate-50">
                                    <td className="border border-slate-300 px-4 py-2 font-medium capitalize bg-yellow-100">
                                      {key === 'serviceTruck' ? '1 Man - Service Truck' :
                                       key === 'bucketVan' ? '2 Men - Service Bucket / Van' :
                                       key === 'elliot60' ? "2 Men - 55' / 65' Elliot" :
                                       key === 'elliot75' ? "2 Men - 75' / 85' Elliot" :
                                       key === 'install3' ? '3 Men - Install / Removal' :
                                       key === 'install4' ? '4 Men - Install / Removal' :
                                       key.replace(/([A-Z])/g, ' $1')}
                                    </td>
                                    <td className="border border-slate-300 px-2 py-2">
                                      <input
                                        type="number"
                                        step="0.1"
                                        value={value.hours}
                                        onChange={(e) => setCurrentSign({
                                          ...currentSign,
                                          installation: {
                                            ...currentSign.installation,
                                            [key]: { ...value, hours: parseFloat(e.target.value) || 0 }
                                          }
                                        })}
                                        className="w-full px-2 py-1 border-0 bg-transparent text-center focus:outline-none focus:bg-white focus:border focus:border-blue-500 rounded"
                                      />
                                    </td>
                                    <td className="border border-slate-300 px-2 py-2">
                                      <input
                                        type="number"
                                        step="0.01"
                                        value={value.rate}
                                        onChange={(e) => setCurrentSign({
                                          ...currentSign,
                                          installation: {
                                            ...currentSign.installation,
                                            [key]: { ...value, rate: parseFloat(e.target.value) || 0 }
                                          }
                                        })}
                                        className="w-full px-2 py-1 border-0 bg-transparent text-center focus:outline-none focus:bg-white focus:border focus:border-blue-500 rounded"
                                      />
                                    </td>
                                    <td className="border border-slate-300 px-4 py-2 text-center font-medium">
                                      ${(value.hours * value.rate).toFixed(2)}
                                    </td>
                                  </tr>
                                ))}
                                <tr className="bg-slate-100 font-bold">
                                  <td className="border border-slate-300 px-4 py-2">Installation Department Totals</td>
                                  <td className="border border-slate-300 px-4 py-2 text-center">-</td>
                                  <td className="border border-slate-300 px-4 py-2"></td>
                                  <td className="border border-slate-300 px-4 py-2 text-center">
                                    ${Object.values(currentSign.installation).reduce((sum, item) => sum + (item.hours * item.rate), 0).toFixed(2)}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* SubContractors and Permits */}
                        <div>
                          <h4 className="text-lg font-semibold text-slate-900 mb-4 bg-indigo-100 p-3 rounded-t-lg">SubContractors and Permits</h4>
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-slate-300">
                              <thead>
                                <tr className="bg-slate-100">
                                  <th className="border border-slate-300 px-4 py-2 text-left font-medium">Description</th>
                                  <th className="border border-slate-300 px-4 py-2 text-center font-medium">Cost</th>
                                  <th className="border border-slate-300 px-4 py-2 text-center font-medium">Total</th>
                                  <th className="border border-slate-300 px-4 py-2 text-center font-medium">Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {currentSign.subcontractors.map((subcontractor, index) => (
                                  <tr key={index} className="hover:bg-slate-50">
                                    <td className="border border-slate-300 px-2 py-2 bg-yellow-100">
                                      <input
                                        type="text"
                                        value={subcontractor.name || ''}
                                        onChange={(e) => {
                                          const newSubcontractors = [...currentSign.subcontractors]
                                          newSubcontractors[index] = { ...subcontractor, name: e.target.value }
                                          setCurrentSign({ ...currentSign, subcontractors: newSubcontractors })
                                        }}
                                        className="w-full px-2 py-1 border-0 bg-transparent focus:outline-none focus:bg-white focus:border focus:border-blue-500 rounded"
                                        placeholder="Enter description"
                                      />
                                    </td>
                                    <td className="border border-slate-300 px-2 py-2">
                                      <input
                                        type="number"
                                        step="0.01"
                                        value={subcontractor.cost || 0}
                                        onChange={(e) => {
                                          const newSubcontractors = [...currentSign.subcontractors]
                                          newSubcontractors[index] = { ...subcontractor, cost: parseFloat(e.target.value) || 0 }
                                          setCurrentSign({ ...currentSign, subcontractors: newSubcontractors })
                                        }}
                                        className="w-full px-2 py-1 border-0 bg-transparent text-center focus:outline-none focus:bg-white focus:border focus:border-blue-500 rounded"
                                      />
                                    </td>
                                    <td className="border border-slate-300 px-4 py-2 text-center font-medium">
                                      ${subcontractor.cost.toFixed(2)}
                                    </td>
                                    <td className="border border-slate-300 px-2 py-2 text-center">
                                      <button
                                        onClick={() => {
                                          const newSubcontractors = currentSign.subcontractors.filter((_, i) => i !== index)
                                          if (newSubcontractors.length === 0) {
                                            newSubcontractors.push({ name: '', cost: 0 })
                                          }
                                          setCurrentSign({ ...currentSign, subcontractors: newSubcontractors })
                                        }}
                                        className="text-red-600 hover:text-red-800 text-sm"
                                      >
                                        Remove
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            <div className="mt-2">
                              <button
                                onClick={() => {
                                  const newSubcontractors = [...currentSign.subcontractors, { name: '', cost: 0 }]
                                  setCurrentSign({ ...currentSign, subcontractors: newSubcontractors })
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                              >
                                Add Row
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Materials */}
                        <div>
                          <h4 className="text-lg font-semibold text-slate-900 mb-4 bg-purple-100 p-3 rounded-t-lg">Materials</h4>
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-slate-300">
                              <thead>
                                <tr className="bg-slate-100">
                                  <th className="border border-slate-300 px-4 py-2 text-left font-medium">Material Name</th>
                                  <th className="border border-slate-300 px-4 py-2 text-center font-medium">Material Type</th>
                                  <th className="border border-slate-300 px-4 py-2 text-center font-medium">Qty.</th>
                                  <th className="border border-slate-300 px-4 py-2 text-center font-medium">Cost</th>
                                  <th className="border border-slate-300 px-4 py-2 text-center font-medium">Total</th>
                                  <th className="border border-slate-300 px-4 py-2 text-center font-medium">Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {currentSign.materials.map((material, index) => (
                                  <tr key={index} className="hover:bg-slate-50">
                                    <td className="border border-slate-300 px-2 py-2 bg-yellow-100">
                                      <input
                                        type="text"
                                        value={material.name || ''}
                                        onChange={(e) => {
                                          const newMaterials = [...currentSign.materials]
                                          newMaterials[index] = { ...material, name: e.target.value }
                                          setCurrentSign({ ...currentSign, materials: newMaterials })
                                        }}
                                        className="w-full px-2 py-1 border-0 bg-transparent focus:outline-none focus:bg-white focus:border focus:border-blue-500 rounded"
                                        placeholder="Material name"
                                      />
                                    </td>
                                    <td className="border border-slate-300 px-2 py-2 bg-yellow-100">
                                      <input
                                        type="text"
                                        value={material.type || ''}
                                        onChange={(e) => {
                                          const newMaterials = [...currentSign.materials]
                                          newMaterials[index] = { ...material, type: e.target.value }
                                          setCurrentSign({ ...currentSign, materials: newMaterials })
                                        }}
                                        className="w-full px-2 py-1 border-0 bg-transparent focus:outline-none focus:bg-white focus:border focus:border-blue-500 rounded"
                                        placeholder="Material type"
                                      />
                                    </td>
                                    <td className="border border-slate-300 px-2 py-2">
                                      <input
                                        type="number"
                                        value={material.qty || 0}
                                        onChange={(e) => {
                                          const newMaterials = [...currentSign.materials]
                                          newMaterials[index] = { ...material, qty: parseInt(e.target.value) || 0 }
                                          setCurrentSign({ ...currentSign, materials: newMaterials })
                                        }}
                                        className="w-full px-2 py-1 border-0 bg-transparent text-center focus:outline-none focus:bg-white focus:border focus:border-blue-500 rounded"
                                      />
                                    </td>
                                    <td className="border border-slate-300 px-2 py-2">
                                      <input
                                        type="number"
                                        step="0.01"
                                        value={material.cost || 0}
                                        onChange={(e) => {
                                          const newMaterials = [...currentSign.materials]
                                          newMaterials[index] = { ...material, cost: parseFloat(e.target.value) || 0 }
                                          setCurrentSign({ ...currentSign, materials: newMaterials })
                                        }}
                                        className="w-full px-2 py-1 border-0 bg-transparent text-center focus:outline-none focus:bg-white focus:border focus:border-blue-500 rounded"
                                      />
                                    </td>
                                    <td className="border border-slate-300 px-4 py-2 text-center font-medium">
                                      ${((material.qty || 0) * (material.cost || 0)).toFixed(2)}
                                    </td>
                                    <td className="border border-slate-300 px-2 py-2 text-center">
                                      <button
                                        onClick={() => {
                                          const newMaterials = currentSign.materials.filter((_, i) => i !== index)
                                          setCurrentSign({ ...currentSign, materials: newMaterials })
                                        }}
                                        className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                                      >
                                        Remove
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                                <tr>
                                  <td colSpan="6" className="border border-slate-300 px-4 py-2 text-center">
                                    <button
                                      onClick={() => {
                                        const newMaterials = [...currentSign.materials, { name: '', type: '', qty: 0, cost: 0 }]
                                        setCurrentSign({ ...currentSign, materials: newMaterials })
                                      }}
                                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                      <Plus className="w-4 h-4 inline mr-1" />
                                      Add Row
                                    </button>
                                  </td>
                                </tr>
                                <tr className="bg-slate-100">
                                  <td className="border border-slate-300 px-4 py-2 font-bold" colSpan="4">Material Cost</td>
                                  <td className="border border-slate-300 px-4 py-2 text-center font-bold">
                                    ${currentSign.materials.reduce((sum, material) => sum + ((material.qty || 0) * (material.cost || 0)), 0).toFixed(2)}
                                  </td>
                                  <td className="border border-slate-300 px-4 py-2 text-center font-bold">Buyout</td>
                                </tr>
                                <tr className="bg-slate-100">
                                  <td className="border border-slate-300 px-4 py-2 font-bold" colSpan="4">Material Cost Marked Up</td>
                                  <td className="border border-slate-300 px-4 py-2 text-center font-bold">
                                    ${(currentSign.materials.reduce((sum, material) => sum + ((material.qty || 0) * (material.cost || 0)), 0) * 1.2).toFixed(2)}
                                  </td>
                                  <td className="border border-slate-300 px-4 py-2"></td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Crating & Other Fees */}
                        <div>
                          <h4 className="text-lg font-semibold text-slate-900 mb-4 bg-purple-200 p-3 rounded-t-lg">Crating & Other Fees per Sign</h4>
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-slate-300">
                              <tbody>
                                {Object.entries(currentSign.crating).map(([key, value]) => (
                                  <tr key={key} className="hover:bg-slate-50">
                                    <td className="border border-slate-300 px-4 py-2 font-medium bg-purple-100">
                                      {key === 'cratingLabor' ? 'Crating Labor' :
                                       key === 'packingMaterials' ? 'Packing Materials' :
                                       key === 'perDiem' ? 'Per Diem' :
                                       key === 'hotel' ? 'Hotel' :
                                       key.replace(/([A-Z])/g, ' $1')}
                                    </td>
                                    <td className="border border-slate-300 px-4 py-2"></td>
                                    <td className="border border-slate-300 px-2 py-2 text-center">
                                      <input
                                        type="number"
                                        value={value.qty}
                                        onChange={(e) => setCurrentSign({
                                          ...currentSign,
                                          crating: {
                                            ...currentSign.crating,
                                            [key]: { ...value, qty: parseInt(e.target.value) || 0 }
                                          }
                                        })}
                                        className="w-full px-2 py-1 border-0 bg-transparent text-center focus:outline-none focus:bg-white focus:border focus:border-blue-500 rounded"
                                      />
                                    </td>
                                    <td className="border border-slate-300 px-2 py-2 text-center">
                                      ${value.cost.toFixed(2)}
                                    </td>
                                    <td className="border border-slate-300 px-4 py-2 text-center font-medium">
                                      ${(value.qty * value.cost).toFixed(2)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Sign Estimate Totals */}
                        <div>
                          <h4 className="text-lg font-semibold text-slate-900 mb-4 bg-gray-200 p-3 rounded-t-lg">Sign Estimate Totals</h4>
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-slate-300">
                              <tbody>
                                <tr><td className="border border-slate-300 px-4 py-2 font-bold">Total Other Fees per Sign</td><td className="border border-slate-300 px-4 py-2 text-right font-bold">$-</td></tr>
                                <tr><td className="border border-slate-300 px-4 py-2">Art Department Billable</td><td className="border border-slate-300 px-4 py-2 text-right">$-</td></tr>
                                <tr><td className="border border-slate-300 px-4 py-2">Fabrication Department Billable</td><td className="border border-slate-300 px-4 py-2 text-right">$-</td></tr>
                                <tr><td className="border border-slate-300 px-4 py-2">Total Estimated Fabrication</td><td className="border border-slate-300 px-4 py-2 text-right">$-</td></tr>
                                <tr className="bg-yellow-100"><td className="border border-slate-300 px-4 py-2 font-bold">Fabrication Proposal per item</td><td className="border border-slate-300 px-4 py-2 text-right font-bold">$-</td></tr>
                                <tr><td className="border border-slate-300 px-4 py-2">Total Estimated Installation</td><td className="border border-slate-300 px-4 py-2 text-right">$-</td></tr>
                                <tr className="bg-yellow-100"><td className="border border-slate-300 px-4 py-2 font-bold">Installation Proposal per item</td><td className="border border-slate-300 px-4 py-2 text-right font-bold">$-</td></tr>
                                <tr><td className="border border-slate-300 px-4 py-2 font-bold">Total Proposal per item</td><td className="border border-slate-300 px-4 py-2 text-right font-bold">$-</td></tr>
                                <tr className="bg-slate-100">
                                  <td className="border border-slate-300 px-4 py-2 font-bold">Total Billable Estimate for Quantity</td>
                                  <td className="border border-slate-300 px-2 py-2 text-center font-bold">
                                    <input
                                      type="number"
                                      value={currentSign.quantity}
                                      readOnly
                                      className="w-16 px-2 py-1 border-0 bg-transparent text-center font-bold"
                                    />
                                  </td>
                                  <td className="border border-slate-300 px-4 py-2 text-right font-bold">$-</td>
                                </tr>
                                <tr><td className="border border-slate-300 px-4 py-2"></td><td className="border border-slate-300 px-4 py-2 text-right font-bold">Estimated Cost</td><td className="border border-slate-300 px-4 py-2 text-right">$-</td></tr>
                                <tr><td className="border border-slate-300 px-4 py-2"></td><td className="border border-slate-300 px-4 py-2 text-right font-bold">Estimated Gross Profit</td><td className="border border-slate-300 px-4 py-2 text-right">$-</td></tr>
                                <tr><td className="border border-slate-300 px-4 py-2"></td><td className="border border-slate-300 px-4 py-2 text-right font-bold italic">Estimated Gross Margin</td><td className="border border-slate-300 px-4 py-2 text-right">0.0%</td></tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
                          <Button
                            variant="outline"
                            onClick={() => setJobCreationStep('job-estimate-summary')}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={async () => {
                              setLoading(true)
                              try {
                                if (editingSignIndex !== null) {
                                  // Edit existing sign - update in database
                                  const signToUpdate = currentJob.signs[editingSignIndex]
                                  await signsAPI.updateSign(signToUpdate.id, {
                                    sign_type: currentSign.signType,
                                    quantity: currentSign.quantity,
                                    description: currentSign.description
                                  })
                                  
                                  // Update local state
                                  const newSigns = [...currentJob.signs]
                                  newSigns[editingSignIndex] = {...currentSign}
                                  setCurrentJob({...currentJob, signs: newSigns})
                                } else {
                                  // Add new sign - save to database
                                  const signData = {
                                    jobId: currentJob.id,
                                    signType: currentSign.signType,
                                    quantity: currentSign.quantity,
                                    description: currentSign.description
                                  }
                                  
                                  const newSign = await signsAPI.createSign(signData)
                                  
                                  // Save department data to database
                                  await saveDepartmentData(newSign.id)
                                  
                                  // Update local state
                                  const newSigns = [...currentJob.signs, {...currentSign, id: newSign.id}]
                                  setCurrentJob({...currentJob, signs: newSigns})
                                }
                                
                                setJobCreationStep('job-estimate-summary')
                                setEditingSignIndex(null)
                              } catch (error) {
                                console.error('Error saving sign:', error)
                                setError('Failed to save sign. Please try again.')
                              } finally {
                                setLoading(false)
                              }
                            }}
                            className="bg-blue-600 hover:bg-blue-700"
                            disabled={loading}
                          >
                            {loading ? 'Saving...' : (editingSignIndex !== null ? 'Update Sign' : 'Add Sign')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Configuration & Settings */}
            {(activeMenuItem === 'configuration' || activeMenuItem === 'settings') && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  {activeMenuItem === 'configuration' ? 'Configuration' : 'Settings'}
                </h2>
                <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                  <div className="p-6">
                    <p className="text-slate-500">
                      {activeMenuItem === 'configuration' 
                        ? 'System configuration options will be available here.'
                        : 'Application settings will be available here.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App

