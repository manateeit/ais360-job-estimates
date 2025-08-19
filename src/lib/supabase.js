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
        status: 'draft'
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

