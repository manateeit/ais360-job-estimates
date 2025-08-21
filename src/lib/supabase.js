import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://opoolitxfgkrumeaizdz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wb29saXR4ZmdrcnVtZWFpemR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0OTA0MTEsImV4cCI6MjA3MDA2NjQxMX0.Pb5lvC34wPCfGiBxDbHZFUmujT_FCk572a_0v673cAM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database operations for jobs
export const jobsAPI = {
  // Create a new job
  async createJob(jobData) {
    const { data, error } = await supabase
      .from('jobestimate_jobs')
      .insert([{
        job_number: jobData.jobNumber,
        job_name: jobData.jobName,
        job_address: jobData.jobAddress,
        contact_name: jobData.contactName,
        contact_email: jobData.contactEmail,
        contact_phone: jobData.contactPhone,
        estimate_completed_by: jobData.estimateCompletedBy,
        project_manager: jobData.projectManager,
        estimate_date: jobData.estimateDate || new Date().toISOString().split('T')[0],
        status: 'draft',
        estimate_request_id: jobData.estimate_request_id || null
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get all jobs
  async getAllJobs() {
    const { data, error } = await supabase
      .from('jobestimate_jobs')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get job by ID
  async getJobById(jobId) {
    const { data, error } = await supabase
      .from('jobestimate_jobs')
      .select('*')
      .eq('id', jobId)
      .single()
    
    if (error) throw error
    return data
  },

  // Update job
  async updateJob(jobId, updates) {
    const { data, error } = await supabase
      .from('jobestimate_jobs')
      .update(updates)
      .eq('id', jobId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete job
  async deleteJob(jobId) {
    const { error } = await supabase
      .from('jobestimate_jobs')
      .delete()
      .eq('id', jobId)
    
    if (error) throw error
  }
}

// Database operations for signs
export const signsAPI = {
  // Create a new sign
  async createSign(signData) {
    const { data, error } = await supabase
      .from('jobestimate_signs')
      .insert([{
        job_id: signData.jobId,
        sign_number: signData.signNumber,
        sign_type: signData.signType,
        quantity: signData.quantity || 1,
        description: signData.description
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get signs for a job
  async getSignsByJobId(jobId) {
    const { data, error } = await supabase
      .from('jobestimate_signs')
      .select('*')
      .eq('job_id', jobId)
      .order('sign_number', { ascending: true })
    
    if (error) throw error
    return data
  },

  // Update sign
  async updateSign(signId, updates) {
    const { data, error } = await supabase
      .from('jobestimate_signs')
      .update(updates)
      .eq('id', signId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete sign
  async deleteSign(signId) {
    const { error } = await supabase
      .from('jobestimate_signs')
      .delete()
      .eq('id', signId)
    
    if (error) throw error
  }
}

// Database operations for art department
export const artDepartmentAPI = {
  // Create art department entries for a sign
  async createArtDepartmentEntries(signId, entries) {
    const entriesWithSignId = entries.map(entry => ({
      sign_id: signId,
      task_name: entry.taskName,
      hours: entry.hours || 0,
      rate: entry.rate || 0
    }))

    const { data, error } = await supabase
      .from('jobestimate_art_department')
      .insert(entriesWithSignId)
      .select()
    
    if (error) throw error
    return data
  },

  // Get art department entries for a sign
  async getArtDepartmentBySignId(signId) {
    const { data, error } = await supabase
      .from('jobestimate_art_department')
      .select('*')
      .eq('sign_id', signId)
    
    if (error) throw error
    return data
  },

  // Update art department entry
  async updateArtDepartmentEntry(entryId, updates) {
    const { data, error } = await supabase
      .from('jobestimate_art_department')
      .update(updates)
      .eq('id', entryId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Database operations for fabrication department
export const fabricationDepartmentAPI = {
  // Create fabrication department entries for a sign
  async createFabricationDepartmentEntries(signId, entries) {
    const entriesWithSignId = entries.map(entry => ({
      sign_id: signId,
      task_name: entry.taskName,
      hours: entry.hours || 0,
      rate: entry.rate || 0
    }))

    const { data, error } = await supabase
      .from('jobestimate_fabrication_department')
      .insert(entriesWithSignId)
      .select()
    
    if (error) throw error
    return data
  },

  // Get fabrication department entries for a sign
  async getFabricationDepartmentBySignId(signId) {
    const { data, error } = await supabase
      .from('jobestimate_fabrication_department')
      .select('*')
      .eq('sign_id', signId)
    
    if (error) throw error
    return data
  }
}

// Database operations for installation department
export const installationDepartmentAPI = {
  // Create installation department entries for a sign
  async createInstallationDepartmentEntries(signId, entries) {
    const entriesWithSignId = entries.map(entry => ({
      sign_id: signId,
      task_name: entry.taskName,
      hours: entry.hours || 0,
      rate: entry.rate || 0
    }))

    const { data, error } = await supabase
      .from('jobestimate_installation_department')
      .insert(entriesWithSignId)
      .select()
    
    if (error) throw error
    return data
  },

  // Get installation department entries for a sign
  async getInstallationDepartmentBySignId(signId) {
    const { data, error } = await supabase
      .from('jobestimate_installation_department')
      .select('*')
      .eq('sign_id', signId)
    
    if (error) throw error
    return data
  }
}

// Database operations for subcontractors
export const subcontractorsAPI = {
  // Create subcontractor entries for a sign
  async createSubcontractorEntries(signId, entries) {
    const entriesWithSignId = entries.map(entry => ({
      sign_id: signId,
      description: entry.description,
      cost: entry.cost || 0
    }))

    const { data, error } = await supabase
      .from('jobestimate_subcontractors')
      .insert(entriesWithSignId)
      .select()
    
    if (error) throw error
    return data
  },

  // Get subcontractor entries for a sign
  async getSubcontractorsBySignId(signId) {
    const { data, error } = await supabase
      .from('jobestimate_subcontractors')
      .select('*')
      .eq('sign_id', signId)
    
    if (error) throw error
    return data
  }
}

// Database operations for materials
export const materialsAPI = {
  // Create material entries for a sign
  async createMaterialEntries(signId, entries) {
    const entriesWithSignId = entries.map(entry => ({
      sign_id: signId,
      material_name: entry.materialName,
      material_type: entry.materialType,
      quantity: entry.quantity || 0,
      unit_cost: entry.unitCost || 0,
      markup_percentage: entry.markupPercentage || 0
    }))

    const { data, error } = await supabase
      .from('jobestimate_materials')
      .insert(entriesWithSignId)
      .select()
    
    if (error) throw error
    return data
  },

  // Get material entries for a sign
  async getMaterialsBySignId(signId) {
    const { data, error } = await supabase
      .from('jobestimate_materials')
      .select('*')
      .eq('sign_id', signId)
    
    if (error) throw error
    return data
  }
}

// Database operations for crating fees
export const cratingFeesAPI = {
  // Create crating fee entries for a sign
  async createCratingFeeEntries(signId, entries) {
    const entriesWithSignId = entries.map(entry => ({
      sign_id: signId,
      fee_type: entry.feeType,
      quantity: entry.quantity || 0,
      rate: entry.rate || 0
    }))

    const { data, error } = await supabase
      .from('jobestimate_crating_fees')
      .insert(entriesWithSignId)
      .select()
    
    if (error) throw error
    return data
  },

  // Get crating fee entries for a sign
  async getCratingFeesBySignId(signId) {
    const { data, error } = await supabase
      .from('jobestimate_crating_fees')
      .select('*')
      .eq('sign_id', signId)
    
    if (error) throw error
    return data
  }
}

// Get standard rates
export const standardRatesAPI = {
  async getStandardRates() {
    const { data, error } = await supabase
      .from('jobestimate_standard_rates')
      .select('*')
      .order('department', { ascending: true })
    
    if (error) throw error
    return data
  }
}



// Database operations for estimate requests
export const estimateRequestsAPI = {
  // Get all estimate requests from Supabase
  async getAllEstimateRequests() {
    const { data, error } = await supabase
      .from('estimate_requests')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Sync estimate requests from NetSuite and save to Supabase
  async syncFromNetSuite() {
    try {
      // First, fetch data from NetSuite via our backend API
      const response = await fetch('https://5000-ixwnutv5bg7ibnsrzaori-5f49a4c4.manusvm.computer/api/netsuite/estimate-requests')
      if (!response.ok) {
        throw new Error(`NetSuite API error: ${response.status}`)
      }
      
      const netsuiteData = await response.json()
      
      // If NetSuite sync fails, throw error (don't use mock data)
      if (!netsuiteData.success) {
        throw new Error(netsuiteData.error || 'NetSuite sync failed')
      }
      
      // If no data received, throw error
      if (!netsuiteData.data || netsuiteData.data.length === 0) {
        throw new Error('No data received from NetSuite API')
      }

      // Transform and upsert the data to Supabase with correct field mappings
      const transformedData = netsuiteData.data.map(record => ({
        netsuite_id: record.id?.toString(),
        netsuite_job_id: record.job_id,  // Map job_id to netsuite_job_id
        job_name: record.job_name,
        assigned_to: record.assigned_to,
        assigned_to_id: record.assigned_to_id,
        requested_by: record.requested_by,
        requested_by_id: record.requested_by_id,
        bid_due_date: record.bid_due_date,
        priority_id: record.priority_id,
        status_id: record.status_id,
        estimate_due_date: record.estimate_due_date,
        estimate_completed: record.estimate_completed,
        date_submitted: record.date_submitted,
        estimator_note: record.estimator_note,
        job_description: record.job_description,
        performance_bond: record.performance_bond,
        performance_bond_amount: record.performance_bond_amount,
        liquidated_damages: record.liquidated_damages,
        liquidated_damages_amount: record.liquidated_damages_amount,
        union_labor: record.union_labor,
        prevailing_wage: record.prevailing_wage,
        mbe_wbe: record.mbe_wbe,
        rfi_due_date: record.rfi_due_date,
        box_folder_link: record.box_folder_link,
        completed_estimate_link: record.completed_estimate_link,
        completed_estimate_amount: record.completed_estimate_amount,
        job_status: record.job_status,
        updated_at: new Date().toISOString()
      }))

      // Use upsert to insert new records or update existing ones based on netsuite_id
      const { data, error } = await supabase
        .from('estimate_requests')
        .upsert(transformedData, { 
          onConflict: 'netsuite_id',
          ignoreDuplicates: false 
        })
        .select()

      if (error) throw error

      return {
        success: true,
        synced_count: data.length,
        data: data
      }

    } catch (error) {
      console.error('Sync error:', error)
      throw error  // Re-throw to let the UI handle the error display
    }
  },

  // Delete an estimate request
  async deleteEstimateRequest(id) {
    const { error } = await supabase
      .from('estimate_requests')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  },

  // Mark estimate request as converted
  async markAsConverted(id, jobEstimateId) {
    const { data, error } = await supabase
      .from('estimate_requests')
      .update({ 
        converted_to_job_id: jobEstimateId,
        converted_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

