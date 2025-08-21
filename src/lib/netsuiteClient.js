// Simple client-side module to call the backend NetSuite API

class NetSuiteClient {
  constructor() {
    // Use the local Flask backend for development testing
    this.baseUrl = 'https://5000-ixwnutv5bg7ibnsrzaori-5f49a4c4.manusvm.computer/api/netsuite'
  }

  async fetchPendingEstimateRequests() {
    try {
      console.log('Fetching estimate requests from server API...')
      const response = await fetch(`${this.baseUrl}/estimate-requests`)
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Received data from server:', data)
      return data
    } catch (error) {
      console.error('Error fetching estimate requests:', error)
      
      // Return mock data as fallback
      return {
        items: [
          {
            id: '1001',
            bid_due_date: '2025-08-25',
            priority_name: 'High',
            status_name: 'Pending Review',
            assigned_to_name: 'John Smith',
            estimate_due_date: '2025-08-22',
            date_submitted: '2025-08-19',
            job_name: 'ABC Corp Storefront Signs',
            requested_by_name: 'Sarah Wilson',
            estimator_note: 'Customer needs channel letters and monument sign. Rush job - high priority client.'
          },
          {
            id: '1002',
            bid_due_date: '2025-08-28',
            priority_name: 'Medium',
            status_name: 'Pending Review',
            assigned_to_name: 'Mike Johnson',
            estimate_due_date: '2025-08-26',
            date_submitted: '2025-08-18',
            job_name: 'XYZ Restaurant Signage',
            requested_by_name: 'Tom Anderson',
            estimator_note: 'Interior and exterior signage package. Need to coordinate with architect.'
          },
          {
            id: '1003',
            bid_due_date: '2025-09-01',
            priority_name: 'Low',
            status_name: 'In Progress',
            assigned_to_name: 'John Smith',
            estimate_due_date: '2025-08-30',
            date_submitted: '2025-08-17',
            job_name: 'Medical Center Wayfinding',
            requested_by_name: 'Sarah Wilson',
            estimator_note: 'Complex wayfinding system with ADA compliance requirements.'
          }
        ],
        totalCount: 3,
        hasMore: false
      }
    }
  }

  async convertRequestToJobEstimate(requestId) {
    try {
      const response = await fetch(`${this.baseUrl}/convert-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ requestId })
      })
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error converting request:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Helper methods for UI
  formatDate(dateString) {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return dateString
    }
  }

  getPriorityColor(priority) {
    switch (priority?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-slate-600 bg-slate-50'
    }
  }

  getStatusColor(status) {
    switch (status?.toLowerCase()) {
      case 'pending review': return 'text-blue-600 bg-blue-50'
      case 'in progress': return 'text-purple-600 bg-purple-50'
      case 'on hold': return 'text-orange-600 bg-orange-50'
      case 'completed': return 'text-green-600 bg-green-50'
      default: return 'text-slate-600 bg-slate-50'
    }
  }
}

// Export singleton instance
export const netsuiteClient = new NetSuiteClient()
export default netsuiteClient

