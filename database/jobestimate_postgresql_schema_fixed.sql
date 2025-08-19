-- =====================================================
-- Job Estimate System - PostgreSQL Database Schema (SUPABASE COMPATIBLE)
-- =====================================================
-- Created for: Ais360 Job Estimate Management System
-- Author: Manus AI
-- Date: August 18, 2025
-- Description: Comprehensive data model for managing job estimates,
--              signs, departments, materials, and related calculations
-- Fixed: Generated column dependency issue for Supabase compatibility
-- =====================================================

-- Enable UUID extension for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Main job estimates table
CREATE TABLE jobestimate_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_number VARCHAR(50) UNIQUE NOT NULL,
    job_name VARCHAR(255) NOT NULL,
    job_address TEXT,
    contact_name VARCHAR(255),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    estimator_name VARCHAR(255),
    project_manager VARCHAR(255),
    estimate_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'completed')),
    total_estimated_cost DECIMAL(12,2) DEFAULT 0.00,
    total_billable_amount DECIMAL(12,2) DEFAULT 0.00,
    estimated_gross_profit DECIMAL(12,2) DEFAULT 0.00,
    estimated_gross_margin DECIMAL(5,2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- Signs within job estimates
CREATE TABLE jobestimate_signs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobestimate_jobs(id) ON DELETE CASCADE,
    sign_number INTEGER NOT NULL,
    sign_type VARCHAR(255) NOT NULL,
    quantity INTEGER DEFAULT 1,
    description TEXT,
    art_dept_total DECIMAL(10,2) DEFAULT 0.00,
    fabrication_total DECIMAL(10,2) DEFAULT 0.00,
    installation_total DECIMAL(10,2) DEFAULT 0.00,
    subcontractors_total DECIMAL(10,2) DEFAULT 0.00,
    materials_total DECIMAL(10,2) DEFAULT 0.00,
    crating_total DECIMAL(10,2) DEFAULT 0.00,
    sign_total DECIMAL(12,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(job_id, sign_number)
);

-- =====================================================
-- DEPARTMENT TABLES
-- =====================================================

-- Art Department line items
CREATE TABLE jobestimate_art_department (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sign_id UUID NOT NULL REFERENCES jobestimate_signs(id) ON DELETE CASCADE,
    task_name VARCHAR(100) NOT NULL,
    task_type VARCHAR(50) NOT NULL CHECK (task_type IN ('design', 'cad', 'router', 'vinyl', 'printing', 'cutting', 'drill', 'misc')),
    hours DECIMAL(8,2) DEFAULT 0.00,
    rate DECIMAL(8,2) NOT NULL,
    total DECIMAL(10,2) GENERATED ALWAYS AS (hours * rate) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fabrication Department line items
CREATE TABLE jobestimate_fabrication_department (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sign_id UUID NOT NULL REFERENCES jobestimate_signs(id) ON DELETE CASCADE,
    task_name VARCHAR(100) NOT NULL,
    task_type VARCHAR(50) NOT NULL CHECK (task_type IN ('channel_letters', 'trimcap', 'aluminum', 'wiring', 'prep', 'paint', 'assembly', 'packing', 'receive', 'steel', 'misc1', 'misc2')),
    hours DECIMAL(8,2) DEFAULT 0.00,
    rate DECIMAL(8,2) NOT NULL,
    total DECIMAL(10,2) GENERATED ALWAYS AS (hours * rate) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Installation Department line items
CREATE TABLE jobestimate_installation_department (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sign_id UUID NOT NULL REFERENCES jobestimate_signs(id) ON DELETE CASCADE,
    task_name VARCHAR(100) NOT NULL,
    task_type VARCHAR(50) NOT NULL CHECK (task_type IN ('service_truck', 'bucket_van', 'elliot_60', 'elliot_75', 'install_3', 'install_4')),
    hours DECIMAL(8,2) DEFAULT 0.00,
    rate DECIMAL(8,2) NOT NULL,
    total DECIMAL(10,2) GENERATED ALWAYS AS (hours * rate) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Installation Sub & Equipment (part of Installation Department)
CREATE TABLE jobestimate_installation_subs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sign_id UUID NOT NULL REFERENCES jobestimate_signs(id) ON DELETE CASCADE,
    item_name VARCHAR(100) NOT NULL,
    cost DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ADDITIONAL COST SECTIONS
-- =====================================================

-- SubContractors and Permits (separate from Installation Subs)
CREATE TABLE jobestimate_subcontractors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sign_id UUID NOT NULL REFERENCES jobestimate_signs(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    cost DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Materials (FIXED: No generated column dependencies)
CREATE TABLE jobestimate_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sign_id UUID NOT NULL REFERENCES jobestimate_signs(id) ON DELETE CASCADE,
    material_name VARCHAR(255) NOT NULL,
    material_type VARCHAR(100),
    quantity DECIMAL(10,2) DEFAULT 0.00,
    unit_cost DECIMAL(10,2) DEFAULT 0.00,
    total_cost DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_cost) STORED,
    markup_percentage DECIMAL(5,2) DEFAULT 0.00,
    marked_up_cost DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_cost * (1 + markup_percentage / 100)) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crating & Other Fees
CREATE TABLE jobestimate_crating_fees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sign_id UUID NOT NULL REFERENCES jobestimate_signs(id) ON DELETE CASCADE,
    fee_type VARCHAR(50) NOT NULL CHECK (fee_type IN ('crating_labor', 'packing_materials', 'per_diem', 'hotel')),
    fee_name VARCHAR(100) NOT NULL,
    quantity DECIMAL(8,2) DEFAULT 0.00,
    unit_cost DECIMAL(10,2) DEFAULT 0.00,
    total_cost DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_cost) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- REFERENCE/LOOKUP TABLES
-- =====================================================

-- Standard rates for different departments and tasks
CREATE TABLE jobestimate_standard_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department VARCHAR(50) NOT NULL CHECK (department IN ('art', 'fabrication', 'installation')),
    task_type VARCHAR(50) NOT NULL,
    task_name VARCHAR(100) NOT NULL,
    standard_rate DECIMAL(8,2) NOT NULL,
    effective_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(department, task_type, effective_date)
);

-- Job estimate status history
CREATE TABLE jobestimate_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobestimate_jobs(id) ON DELETE CASCADE,
    old_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    changed_by VARCHAR(255),
    change_reason TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Job estimates indexes
CREATE INDEX idx_jobestimate_jobs_job_number ON jobestimate_jobs(job_number);
CREATE INDEX idx_jobestimate_jobs_status ON jobestimate_jobs(status);
CREATE INDEX idx_jobestimate_jobs_estimate_date ON jobestimate_jobs(estimate_date);
CREATE INDEX idx_jobestimate_jobs_created_at ON jobestimate_jobs(created_at);

-- Signs indexes
CREATE INDEX idx_jobestimate_signs_job_id ON jobestimate_signs(job_id);
CREATE INDEX idx_jobestimate_signs_sign_number ON jobestimate_signs(job_id, sign_number);

-- Department indexes
CREATE INDEX idx_jobestimate_art_sign_id ON jobestimate_art_department(sign_id);
CREATE INDEX idx_jobestimate_fabrication_sign_id ON jobestimate_fabrication_department(sign_id);
CREATE INDEX idx_jobestimate_installation_sign_id ON jobestimate_installation_department(sign_id);
CREATE INDEX idx_jobestimate_installation_subs_sign_id ON jobestimate_installation_subs(sign_id);

-- Additional sections indexes
CREATE INDEX idx_jobestimate_subcontractors_sign_id ON jobestimate_subcontractors(sign_id);
CREATE INDEX idx_jobestimate_materials_sign_id ON jobestimate_materials(sign_id);
CREATE INDEX idx_jobestimate_crating_sign_id ON jobestimate_crating_fees(sign_id);

-- Reference tables indexes
CREATE INDEX idx_jobestimate_rates_department_task ON jobestimate_standard_rates(department, task_type);
CREATE INDEX idx_jobestimate_rates_active ON jobestimate_standard_rates(is_active);
CREATE INDEX idx_jobestimate_status_history_job_id ON jobestimate_status_history(job_id);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC CALCULATIONS
-- =====================================================

-- Function to update sign totals when department items change
CREATE OR REPLACE FUNCTION update_sign_totals()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the sign totals based on all department calculations
    UPDATE jobestimate_signs 
    SET 
        art_dept_total = (
            SELECT COALESCE(SUM(total), 0) 
            FROM jobestimate_art_department 
            WHERE sign_id = COALESCE(NEW.sign_id, OLD.sign_id)
        ),
        fabrication_total = (
            SELECT COALESCE(SUM(total), 0) 
            FROM jobestimate_fabrication_department 
            WHERE sign_id = COALESCE(NEW.sign_id, OLD.sign_id)
        ),
        installation_total = (
            SELECT COALESCE(SUM(i.total), 0) + COALESCE(SUM(s.cost), 0)
            FROM jobestimate_installation_department i
            LEFT JOIN jobestimate_installation_subs s ON s.sign_id = i.sign_id
            WHERE i.sign_id = COALESCE(NEW.sign_id, OLD.sign_id)
        ),
        subcontractors_total = (
            SELECT COALESCE(SUM(cost), 0) 
            FROM jobestimate_subcontractors 
            WHERE sign_id = COALESCE(NEW.sign_id, OLD.sign_id)
        ),
        materials_total = (
            SELECT COALESCE(SUM(marked_up_cost), 0) 
            FROM jobestimate_materials 
            WHERE sign_id = COALESCE(NEW.sign_id, OLD.sign_id)
        ),
        crating_total = (
            SELECT COALESCE(SUM(total_cost), 0) 
            FROM jobestimate_crating_fees 
            WHERE sign_id = COALESCE(NEW.sign_id, OLD.sign_id)
        ),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = COALESCE(NEW.sign_id, OLD.sign_id);
    
    -- Update sign_total as sum of all department totals
    UPDATE jobestimate_signs 
    SET sign_total = art_dept_total + fabrication_total + installation_total + 
                     subcontractors_total + materials_total + crating_total
    WHERE id = COALESCE(NEW.sign_id, OLD.sign_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to update job totals when sign totals change
CREATE OR REPLACE FUNCTION update_job_totals()
RETURNS TRIGGER AS $$
BEGIN
    -- Update job totals based on all signs
    UPDATE jobestimate_jobs 
    SET 
        total_estimated_cost = (
            SELECT COALESCE(SUM(sign_total), 0) 
            FROM jobestimate_signs 
            WHERE job_id = COALESCE(NEW.job_id, OLD.job_id)
        ),
        total_billable_amount = (
            SELECT COALESCE(SUM(sign_total * quantity), 0) 
            FROM jobestimate_signs 
            WHERE job_id = COALESCE(NEW.job_id, OLD.job_id)
        ),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = COALESCE(NEW.job_id, OLD.job_id);
    
    -- Calculate gross profit and margin
    UPDATE jobestimate_jobs 
    SET 
        estimated_gross_profit = total_billable_amount - total_estimated_cost,
        estimated_gross_margin = CASE 
            WHEN total_billable_amount > 0 
            THEN ((total_billable_amount - total_estimated_cost) / total_billable_amount * 100)
            ELSE 0 
        END
    WHERE id = COALESCE(NEW.job_id, OLD.job_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to log status changes
CREATE OR REPLACE FUNCTION log_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO jobestimate_status_history (job_id, old_status, new_status, changed_by)
        VALUES (NEW.id, OLD.status, NEW.status, NEW.updated_by);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER ASSIGNMENTS
-- =====================================================

-- Triggers for updating sign totals
CREATE TRIGGER trigger_update_sign_totals_art
    AFTER INSERT OR UPDATE OR DELETE ON jobestimate_art_department
    FOR EACH ROW EXECUTE FUNCTION update_sign_totals();

CREATE TRIGGER trigger_update_sign_totals_fabrication
    AFTER INSERT OR UPDATE OR DELETE ON jobestimate_fabrication_department
    FOR EACH ROW EXECUTE FUNCTION update_sign_totals();

CREATE TRIGGER trigger_update_sign_totals_installation
    AFTER INSERT OR UPDATE OR DELETE ON jobestimate_installation_department
    FOR EACH ROW EXECUTE FUNCTION update_sign_totals();

CREATE TRIGGER trigger_update_sign_totals_installation_subs
    AFTER INSERT OR UPDATE OR DELETE ON jobestimate_installation_subs
    FOR EACH ROW EXECUTE FUNCTION update_sign_totals();

CREATE TRIGGER trigger_update_sign_totals_subcontractors
    AFTER INSERT OR UPDATE OR DELETE ON jobestimate_subcontractors
    FOR EACH ROW EXECUTE FUNCTION update_sign_totals();

CREATE TRIGGER trigger_update_sign_totals_materials
    AFTER INSERT OR UPDATE OR DELETE ON jobestimate_materials
    FOR EACH ROW EXECUTE FUNCTION update_sign_totals();

CREATE TRIGGER trigger_update_sign_totals_crating
    AFTER INSERT OR UPDATE OR DELETE ON jobestimate_crating_fees
    FOR EACH ROW EXECUTE FUNCTION update_sign_totals();

-- Triggers for updating job totals
CREATE TRIGGER trigger_update_job_totals
    AFTER INSERT OR UPDATE OR DELETE ON jobestimate_signs
    FOR EACH ROW EXECUTE FUNCTION update_job_totals();

-- Trigger for logging status changes
CREATE TRIGGER trigger_log_status_change
    AFTER UPDATE ON jobestimate_jobs
    FOR EACH ROW EXECUTE FUNCTION log_status_change();

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Insert standard rates based on the Ais360 prototype
INSERT INTO jobestimate_standard_rates (department, task_type, task_name, standard_rate) VALUES
-- Art Department rates
('art', 'design', 'Design', 127.33),
('art', 'cad', 'CAD', 127.33),
('art', 'router', 'Router', 75.40),
('art', 'vinyl', 'Vinyl', 75.40),
('art', 'printing', 'Printing', 75.40),
('art', 'cutting', 'Cutting Lexan/Acrylic', 75.40),
('art', 'drill', 'Drill & Tap', 75.40),
('art', 'misc', 'Misc./Install Patterns', 75.40),

-- Fabrication Department rates
('fabrication', 'channel_letters', 'Channel Letters', 100.55),
('fabrication', 'trimcap', 'Trimcap', 49.02),
('fabrication', 'aluminum', 'Aluminum Fabrication', 97.83),
('fabrication', 'wiring', 'Wiring', 100.55),
('fabrication', 'prep', 'Prep.', 53.13),
('fabrication', 'paint', 'Paint', 97.96),
('fabrication', 'assembly', 'Assembly', 100.55),
('fabrication', 'packing', 'Packing', 94.36),
('fabrication', 'receive', 'Receive & Inspect', 94.36),
('fabrication', 'steel', 'Steel Fabrication', 97.83),
('fabrication', 'misc1', 'Misc.', 97.83),
('fabrication', 'misc2', 'Misc.', 97.83),

-- Installation Department rates
('installation', 'service_truck', '1 Man - Service Truck', 173.00),
('installation', 'bucket_van', '2 Men - Service Bucket / Van', 233.55),
('installation', 'elliot_60', '2 Men - 55''/65'' Elliot', 259.50),
('installation', 'elliot_75', '2 Men - 75''/85'' Elliot', 324.37),
('installation', 'install_3', '3 Men - Install / Removal', 389.25),
('installation', 'install_4', '4 Men - Install / Removal', 519.00);

-- =====================================================
-- USEFUL VIEWS FOR REPORTING
-- =====================================================

-- View for complete job estimate summary
CREATE VIEW jobestimate_job_summary AS
SELECT 
    j.id,
    j.job_number,
    j.job_name,
    j.job_address,
    j.contact_name,
    j.estimator_name,
    j.project_manager,
    j.estimate_date,
    j.status,
    COUNT(s.id) as total_signs,
    j.total_estimated_cost,
    j.total_billable_amount,
    j.estimated_gross_profit,
    j.estimated_gross_margin,
    j.created_at,
    j.updated_at
FROM jobestimate_jobs j
LEFT JOIN jobestimate_signs s ON j.id = s.job_id
GROUP BY j.id, j.job_number, j.job_name, j.job_address, j.contact_name, 
         j.estimator_name, j.project_manager, j.estimate_date, j.status,
         j.total_estimated_cost, j.total_billable_amount, j.estimated_gross_profit,
         j.estimated_gross_margin, j.created_at, j.updated_at;

-- View for detailed sign breakdown
CREATE VIEW jobestimate_sign_details AS
SELECT 
    s.id,
    s.job_id,
    j.job_number,
    j.job_name,
    s.sign_number,
    s.sign_type,
    s.quantity,
    s.description,
    s.art_dept_total,
    s.fabrication_total,
    s.installation_total,
    s.subcontractors_total,
    s.materials_total,
    s.crating_total,
    s.sign_total,
    (s.sign_total * s.quantity) as total_with_quantity
FROM jobestimate_signs s
JOIN jobestimate_jobs j ON s.job_id = j.id;

-- =====================================================
-- COMMENTS AND DOCUMENTATION
-- =====================================================

COMMENT ON TABLE jobestimate_jobs IS 'Main table storing job estimate information';
COMMENT ON TABLE jobestimate_signs IS 'Individual signs within each job estimate';
COMMENT ON TABLE jobestimate_art_department IS 'Art department tasks and costs for each sign';
COMMENT ON TABLE jobestimate_fabrication_department IS 'Fabrication department tasks and costs for each sign';
COMMENT ON TABLE jobestimate_installation_department IS 'Installation department tasks and costs for each sign';
COMMENT ON TABLE jobestimate_installation_subs IS 'Sub & Equipment items within Installation Department';
COMMENT ON TABLE jobestimate_subcontractors IS 'Separate SubContractors and Permits section';
COMMENT ON TABLE jobestimate_materials IS 'Materials required for each sign with markup calculations (FIXED: No generated column dependencies)';
COMMENT ON TABLE jobestimate_crating_fees IS 'Crating and other miscellaneous fees per sign';
COMMENT ON TABLE jobestimate_standard_rates IS 'Standard hourly rates for different departments and tasks';
COMMENT ON TABLE jobestimate_status_history IS 'Audit trail for job estimate status changes';

-- =====================================================
-- END OF SCHEMA - SUPABASE COMPATIBLE VERSION
-- =====================================================

