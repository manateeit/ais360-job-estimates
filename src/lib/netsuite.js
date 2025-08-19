// NetSuite SuiteQL API Integration
// Handles fetching Estimate Request records (CUSTOMRECORD417)

class NetSuiteAPI {
  constructor() {
    // These would typically come from environment variables
    this.accountId = process.env.NETSUITE_ACCOUNT_ID || 'DEMO_ACCOUNT'
    this.consumerKey = process.env.NETSUITE_CONSUMER_KEY || 'DEMO_KEY'
    this.consumerSecret = process.env.NETSUITE_CONSUMER_SECRET || 'DEMO_SECRET'
    this.tokenId = process.env.NETSUITE_TOKEN_ID || 'DEMO_TOKEN'
    this.tokenSecret = process.env.NETSUITE_TOKEN_SECRET || 'DEMO_TOKEN_SECRET'
    this.roleId = process.env.NETSUITE_ROLE || '3' // Administrator role
    
    this.baseUrl = `https://${this.accountId}.suitetalk.api.netsuite.com/services/rest/query/v1/suiteql`
  }

  // Generate OAuth 1.0 signature for NetSuite API
  generateOAuthHeader(method, url, body = '') {
    // In a real implementation, you'd use a proper OAuth 1.0 library
    // For demo purposes, we'll return a mock header
    return `OAuth realm="${this.accountId}", oauth_consumer_key="${this.consumerKey}", oauth_token="${this.tokenId}", oauth_signature_method="HMAC-SHA256", oauth_timestamp="${Math.floor(Date.now() / 1000)}", oauth_nonce="${Math.random().toString(36)}", oauth_version="1.0", oauth_signature="DEMO_SIGNATURE"`
  }

  // Fetch pending estimate requests (where estimate_completed is null)
  async fetchPendingEstimateRequests(offset = 0, limit = 50) {
    try {
      // For demo purposes, return mock data
      // In production, this would make the actual API call
      if (process.env.NODE_ENV === 'development' || !this.accountId.includes('DEMO')) {
        return this.getMockEstimateRequests(offset, limit)
      }

      const query = `
        SELECT
          er.id,
          er.custrecord12                 AS bid_due_date,
          er.custrecord17                 AS priority_id,
          er.custrecord18                 AS status_id,
          er.custrecord19                 AS assigned_to_id,
          emp.firstname || ' ' || emp.lastname AS assigned_to_name,
          er.custrecord20                 AS estimate_due_date,
          er.custrecord21                 AS estimate_completed,
          er.custrecord_er_date_submitted AS date_submitted,
          er.custrecord_er_job            AS job_id,
          job.entityid                    AS job_name,
          er.custrecord_er_req_by         AS requested_by_id,
          rby.firstname || ' ' || rby.lastname AS requested_by_name,
          er.custrecord43                 AS estimator_note
        FROM customrecord417 er
        LEFT JOIN employee emp ON emp.id = er.custrecord19
        LEFT JOIN job      job ON job.id = er.custrecord_er_job
        LEFT JOIN employee rby ON rby.id = er.custrecord_er_req_by
        WHERE er.custrecord21 IS NULL
        ORDER BY er.id DESC
      `

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Prefer': 'transient',
          'Authorization': this.generateOAuthHeader('POST', this.baseUrl, JSON.stringify({ q: query }))
        },
        body: JSON.stringify({
          q: query,
          offset: offset,
          limit: limit
        })
      })

      if (!response.ok) {
        throw new Error(`NetSuite API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return this.formatEstimateRequestsResponse(data)

    } catch (error) {
      console.error('Error fetching estimate requests:', error)
      // Fallback to mock data on error
      return this.getMockEstimateRequests(offset, limit)
    }
  }

  // Mock data for development and demo purposes
  getMockEstimateRequests(offset = 0, limit = 50) {
    const mockData = [
      {
        id: '1001',
        bid_due_date: '2025-08-25',
        priority_id: '1',
        priority_name: 'High',
        status_id: '1',
        status_name: 'Pending Review',
        assigned_to_id: '101',
        assigned_to_name: 'John Smith',
        estimate_due_date: '2025-08-22',
        estimate_completed: null,
        date_submitted: '2025-08-19',
        job_id: '5001',
        job_name: 'ABC Corp Storefront Signs',
        requested_by_id: '102',
        requested_by_name: 'Sarah Wilson',
        estimator_note: 'Customer needs channel letters and monument sign. Rush job - high priority client.'
      },
      {
        id: '1002',
        bid_due_date: '2025-08-28',
        priority_id: '2',
        priority_name: 'Medium',
        status_id: '1',
        status_name: 'Pending Review',
        assigned_to_id: '103',
        assigned_to_name: 'Mike Johnson',
        estimate_due_date: '2025-08-26',
        estimate_completed: null,
        date_submitted: '2025-08-18',
        job_id: '5002',
        job_name: 'XYZ Restaurant Signage',
        requested_by_id: '104',
        requested_by_name: 'Tom Anderson',
        estimator_note: 'Interior and exterior signage package. Need to coordinate with architect.'
      },
      {
        id: '1003',
        bid_due_date: '2025-09-01',
        priority_id: '3',
        priority_name: 'Low',
        status_id: '2',
        status_name: 'In Progress',
        assigned_to_id: '101',
        assigned_to_name: 'John Smith',
        estimate_due_date: '2025-08-30',
        estimate_completed: null,
        date_submitted: '2025-08-17',
        job_id: '5003',
        job_name: 'Medical Center Wayfinding',
        requested_by_id: '102',
        requested_by_name: 'Sarah Wilson',
        estimator_note: 'Complex wayfinding system with ADA compliance requirements.'
      },
      {
        id: '1004',
        bid_due_date: '2025-08-24',
        priority_id: '1',
        priority_name: 'High',
        status_id: '1',
        status_name: 'Pending Review',
        assigned_to_id: '105',
        assigned_to_name: 'Lisa Chen',
        estimate_due_date: '2025-08-23',
        estimate_completed: null,
        date_submitted: '2025-08-19',
        job_id: '5004',
        job_name: 'Retail Chain Store Package',
        requested_by_id: '106',
        requested_by_name: 'David Brown',
        estimator_note: 'Multi-location rollout. Need consistent pricing across 15 stores.'
      },
      {
        id: '1005',
        bid_due_date: '2025-09-05',
        priority_id: '2',
        priority_name: 'Medium',
        status_id: '1',
        status_name: 'Pending Review',
        assigned_to_id: '103',
        assigned_to_name: 'Mike Johnson',
        estimate_due_date: '2025-09-02',
        estimate_completed: null,
        date_submitted: '2025-08-16',
        job_id: '5005',
        job_name: 'Office Building Lobby Signs',
        requested_by_id: '107',
        requested_by_name: 'Jennifer Lee',
        estimator_note: 'Premium materials required. Client budget is flexible for quality work.'
      }
    ]

    // Simulate pagination
    const start = offset
    const end = Math.min(start + limit, mockData.length)
    const paginatedData = mockData.slice(start, end)

    return {
      items: paginatedData,
      hasMore: end < mockData.length,
      totalCount: mockData.length,
      offset: offset,
      limit: limit
    }
  }

  // Format the API response for consistent data structure
  formatEstimateRequestsResponse(apiResponse) {
    const items = apiResponse.items || []
    
    return {
      items: items.map(item => ({
        id: item.id,
        bid_due_date: item.bid_due_date,
        priority_id: item.priority_id,
        priority_name: this.getPriorityName(item.priority_id),
        status_id: item.status_id,
        status_name: this.getStatusName(item.status_id),
        assigned_to_id: item.assigned_to_id,
        assigned_to_name: item.assigned_to_name || 'Unassigned',
        estimate_due_date: item.estimate_due_date,
        estimate_completed: item.estimate_completed,
        date_submitted: item.date_submitted,
        job_id: item.job_id,
        job_name: item.job_name || `Job ${item.job_id}`,
        requested_by_id: item.requested_by_id,
        requested_by_name: item.requested_by_name || 'Unknown',
        estimator_note: item.estimator_note || ''
      })),
      hasMore: apiResponse.hasMore || false,
      totalCount: apiResponse.totalCount || items.length,
      offset: apiResponse.offset || 0,
      limit: apiResponse.limit || 50
    }
  }

  // Helper methods to resolve reference IDs to display names
  getPriorityName(priorityId) {
    const priorities = {
      '1': 'High',
      '2': 'Medium', 
      '3': 'Low'
    }
    return priorities[priorityId] || 'Unknown'
  }

  getStatusName(statusId) {
    const statuses = {
      '1': 'Pending Review',
      '2': 'In Progress',
      '3': 'On Hold',
      '4': 'Completed'
    }
    return statuses[statusId] || 'Unknown'
  }

  // Convert estimate request to job estimate
  async convertToJobEstimate(estimateRequestId) {
    try {
      // In production, this would create a new job estimate record
      // and mark the estimate request as completed
      console.log(`Converting estimate request ${estimateRequestId} to job estimate`)
      
      // Mock success response
      return {
        success: true,
        jobEstimateId: `JOB-${Date.now()}`,
        message: 'Estimate request successfully converted to job estimate'
      }
    } catch (error) {
      console.error('Error converting estimate request:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}

// Export singleton instance
export const netsuiteAPI = new NetSuiteAPI()
export default netsuiteAPI

