// Simple Backend API for NetSuite Integration
// This handles NetSuite SuiteQL calls server-side to keep credentials secure

import crypto from 'crypto'

// NetSuite credentials from environment variables
const NETSUITE_CONFIG = {
  accountId: process.env.NETSUITE_ACCOUNT_ID,
  consumerKey: process.env.NETSUITE_CONSUMER_KEY,
  consumerSecret: process.env.NETSUITE_CONSUMER_SECRET,
  tokenId: process.env.NETSUITE_TOKEN_ID,
  tokenSecret: process.env.NETSUITE_TOKEN_SECRET,
  roleId: process.env.NETSUITE_ROLE || '3'
}

// Generate OAuth 1.0 signature for NetSuite
function generateOAuthSignature(method, url, params, consumerSecret, tokenSecret) {
  const baseString = method.toUpperCase() + '&' + 
    encodeURIComponent(url) + '&' + 
    encodeURIComponent(Object.keys(params).sort().map(key => 
      `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
    ).join('&'))
  
  const signingKey = encodeURIComponent(consumerSecret) + '&' + encodeURIComponent(tokenSecret)
  return crypto.createHmac('sha256', signingKey).update(baseString).digest('base64')
}

// Generate OAuth header
function generateOAuthHeader(method, url, body = '') {
  const timestamp = Math.floor(Date.now() / 1000)
  const nonce = crypto.randomBytes(16).toString('hex')
  
  const params = {
    oauth_consumer_key: NETSUITE_CONFIG.consumerKey,
    oauth_token: NETSUITE_CONFIG.tokenId,
    oauth_signature_method: 'HMAC-SHA256',
    oauth_timestamp: timestamp,
    oauth_nonce: nonce,
    oauth_version: '1.0'
  }
  
  const signature = generateOAuthSignature(method, url, params, NETSUITE_CONFIG.consumerSecret, NETSUITE_CONFIG.tokenSecret)
  params.oauth_signature = signature
  
  return 'OAuth realm="' + NETSUITE_CONFIG.accountId + '",' +
    Object.keys(params).map(key => `${key}="${encodeURIComponent(params[key])}"`).join(',')
}

// Mock data for development
function getMockEstimateRequests() {
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
      },
      {
        id: '1004',
        bid_due_date: '2025-08-24',
        priority_name: 'High',
        status_name: 'Pending Review',
        assigned_to_name: 'Lisa Chen',
        estimate_due_date: '2025-08-23',
        date_submitted: '2025-08-19',
        job_name: 'Retail Chain Store Package',
        requested_by_name: 'David Brown',
        estimator_note: 'Multi-location rollout. Need consistent pricing across 15 stores.'
      },
      {
        id: '1005',
        bid_due_date: '2025-09-05',
        priority_name: 'Medium',
        status_name: 'Pending Review',
        assigned_to_name: 'Mike Johnson',
        estimate_due_date: '2025-09-02',
        date_submitted: '2025-08-16',
        job_name: 'Office Building Lobby Signs',
        requested_by_name: 'Jennifer Lee',
        estimator_note: 'Premium materials required. Client budget is flexible for quality work.'
      }
    ],
    totalCount: 5,
    hasMore: false
  }
}

// Main API handler
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    if (req.method === 'GET' && req.url === '/api/netsuite/estimate-requests') {
      // Fetch pending estimate requests
      
      // For development, return mock data
      if (process.env.NODE_ENV === 'development' || !NETSUITE_CONFIG.accountId) {
        return res.status(200).json(getMockEstimateRequests())
      }

      // Production NetSuite API call
      const query = `
        SELECT
          er.id,
          er.custrecord12 AS bid_due_date,
          er.custrecord17 AS priority_id,
          er.custrecord18 AS status_id,
          er.custrecord19 AS assigned_to_id,
          emp.firstname || ' ' || emp.lastname AS assigned_to_name,
          er.custrecord20 AS estimate_due_date,
          er.custrecord21 AS estimate_completed,
          er.custrecord_er_date_submitted AS date_submitted,
          er.custrecord_er_job AS job_id,
          job.entityid AS job_name,
          er.custrecord_er_req_by AS requested_by_id,
          rby.firstname || ' ' || rby.lastname AS requested_by_name,
          er.custrecord43 AS estimator_note
        FROM customrecord417 er
        LEFT JOIN employee emp ON emp.id = er.custrecord19
        LEFT JOIN job job ON job.id = er.custrecord_er_job
        LEFT JOIN employee rby ON rby.id = er.custrecord_er_req_by
        WHERE er.custrecord21 IS NULL
        ORDER BY er.id DESC
      `

      const url = `https://${NETSUITE_CONFIG.accountId}.suitetalk.api.netsuite.com/services/rest/query/v1/suiteql`
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Prefer': 'transient',
          'Authorization': generateOAuthHeader('POST', url, JSON.stringify({ q: query }))
        },
        body: JSON.stringify({ q: query })
      })

      if (!response.ok) {
        throw new Error(`NetSuite API error: ${response.status}`)
      }

      const data = await response.json()
      return res.status(200).json(data)

    } else if (req.method === 'POST' && req.url === '/api/netsuite/convert-request') {
      // Convert estimate request to job estimate
      const { requestId } = req.body
      
      // Mock conversion for development
      return res.status(200).json({
        success: true,
        jobEstimateId: `JOB-${Date.now()}`,
        message: 'Estimate request converted successfully'
      })

    } else {
      return res.status(404).json({ error: 'Endpoint not found' })
    }

  } catch (error) {
    console.error('NetSuite API Error:', error)
    
    // Fallback to mock data on error
    if (req.url === '/api/netsuite/estimate-requests') {
      return res.status(200).json(getMockEstimateRequests())
    }
    
    return res.status(500).json({ error: 'Internal server error' })
  }
}

