# Job Estimate System - PostgreSQL Database Documentation

## Overview

This document provides comprehensive documentation for the PostgreSQL database schema designed for the Ais360 Job Estimate Management System. The schema is specifically designed to support the complete job estimation workflow, from initial job creation through detailed sign specifications and final cost calculations.

## Database Design Philosophy

The database schema follows a hierarchical structure that mirrors the business process flow:

1. **Jobs** serve as the top-level container for all estimation activities
2. **Signs** represent individual sign projects within a job
3. **Department sections** break down the work into specialized areas (Art, Fabrication, Installation)
4. **Additional cost sections** handle subcontractors, materials, and miscellaneous fees
5. **Automatic calculations** ensure data consistency and real-time totals

## Table Structure and Relationships

### Core Tables

#### jobestimate_jobs
The primary table storing job-level information and aggregated totals.

**Key Features:**
- UUID primary keys for scalability and security
- Comprehensive contact and project management information
- Automatic calculation of totals, profits, and margins
- Status tracking with audit trail support
- Timestamps for creation and modification tracking

**Important Fields:**
- `job_number`: Unique identifier for external reference
- `status`: Workflow state management (draft, pending, approved, rejected, completed)
- `total_estimated_cost`: Sum of all sign costs
- `total_billable_amount`: Client-facing total including quantities
- `estimated_gross_profit`: Calculated profit margin
- `estimated_gross_margin`: Percentage-based margin calculation

#### jobestimate_signs
Individual sign specifications within each job estimate.

**Key Features:**
- Foreign key relationship to jobs with cascade delete
- Unique sign numbering within each job
- Department-wise total calculations
- Quantity support for multiple identical signs

**Calculation Fields:**
- `art_dept_total`: Sum of all art department line items
- `fabrication_total`: Sum of all fabrication department line items
- `installation_total`: Sum of installation department plus subs
- `subcontractors_total`: Sum of separate subcontractor entries
- `materials_total`: Sum of marked-up material costs
- `crating_total`: Sum of crating and miscellaneous fees
- `sign_total`: Grand total of all department costs

### Department Tables

The schema includes separate tables for each major department, allowing for detailed tracking of hours, rates, and tasks:

#### jobestimate_art_department
Handles all art-related tasks including design, CAD work, routing, vinyl application, printing, cutting, drilling, and miscellaneous installation patterns.

#### jobestimate_fabrication_department
Manages fabrication processes including channel letters, trimcap work, aluminum fabrication, wiring, preparation, painting, assembly, packing, receiving/inspection, steel fabrication, and miscellaneous tasks.

#### jobestimate_installation_department
Tracks installation activities with different crew configurations and equipment requirements, from single-person service trucks to four-person installation teams with specialized lifting equipment.

#### jobestimate_installation_subs
Separate tracking for sub-equipment and services that are part of the installation process, such as backhoes, soil removal, concrete work, delivery services, environmental charges, and fuel surcharges.

### Additional Cost Sections

#### jobestimate_subcontractors
A dedicated table for subcontractors and permits that are separate from installation subs. This provides the free-form functionality requested, allowing unlimited entries for project-specific requirements.

**Features:**
- Free-form description field for any type of subcontractor or permit
- Cost tracking with automatic total calculation
- Complete separation from installation department subs

#### jobestimate_materials
Comprehensive material tracking with markup calculations.

**Advanced Features:**
- Quantity and unit cost tracking
- Automatic total cost calculation (quantity × unit cost)
- Markup percentage application
- Marked-up cost calculation for billing purposes
- Material type categorization for reporting

#### jobestimate_crating_fees
Handles miscellaneous fees including crating labor, packing materials, per diem expenses, and hotel costs.

**Flexibility:**
- Quantity-based calculations
- Multiple fee types within a single table
- Support for both fixed and variable costs

### Reference and Lookup Tables

#### jobestimate_standard_rates
Maintains standard hourly rates for all departments and task types, enabling consistent pricing across estimates while allowing for rate updates over time.

**Features:**
- Department and task type organization
- Effective date tracking for rate changes
- Active/inactive status for rate management
- Historical rate preservation

#### jobestimate_status_history
Provides complete audit trail for job estimate status changes.

**Audit Capabilities:**
- Old and new status tracking
- User identification for changes
- Timestamp recording
- Change reason documentation

## Automatic Calculations and Data Integrity

### Trigger-Based Calculations

The schema implements sophisticated trigger functions to maintain data consistency:

#### update_sign_totals()
Automatically recalculates sign-level totals whenever any department item changes. This ensures that:
- Department totals are always current
- Sign totals reflect all component costs
- Changes propagate immediately through the system

#### update_job_totals()
Recalculates job-level totals when sign totals change, maintaining:
- Total estimated costs across all signs
- Billable amounts including quantities
- Gross profit calculations
- Margin percentage calculations

#### log_status_change()
Automatically creates audit trail entries when job status changes, providing:
- Complete change history
- User accountability
- Change tracking for compliance

### Generated Columns

The schema uses PostgreSQL's generated columns feature for real-time calculations:
- Department line item totals (hours × rate)
- Material total costs (quantity × unit cost)
- Marked-up material costs with percentage application
- Crating fee totals (quantity × unit cost)

## Performance Optimization

### Indexing Strategy

The schema includes comprehensive indexing for optimal query performance:

**Primary Indexes:**
- Job number lookups for external system integration
- Status-based filtering for workflow management
- Date-based queries for reporting
- Foreign key relationships for join optimization

**Composite Indexes:**
- Job and sign number combinations for unique identification
- Department and task type combinations for rate lookups
- Active status filtering for current rates

### Query Optimization Views

Pre-built views provide optimized access to commonly requested data:

#### jobestimate_job_summary
Aggregates job-level information with sign counts and totals, optimized for dashboard and listing displays.

#### jobestimate_sign_details
Combines sign information with job context, providing complete sign details with job identification for detailed reporting.

## Data Types and Constraints

### Precision Considerations

The schema uses appropriate data types for financial calculations:
- `DECIMAL(12,2)` for large monetary amounts (job totals)
- `DECIMAL(10,2)` for standard monetary amounts (sign costs)
- `DECIMAL(8,2)` for hours and rates
- `DECIMAL(5,2)` for percentages

### Data Validation

Comprehensive check constraints ensure data integrity:
- Status values limited to valid workflow states
- Department types restricted to defined categories
- Task types validated against allowed values
- Boolean flags for active/inactive states

### Referential Integrity

Foreign key relationships with appropriate cascade rules:
- CASCADE DELETE for dependent records (signs, department items)
- RESTRICT for reference data to prevent accidental deletion
- Proper relationship modeling to prevent orphaned records

## Integration Considerations

### UUID Primary Keys

The schema uses UUID primary keys throughout for:
- Enhanced security (non-sequential, non-guessable)
- Distributed system compatibility
- Replication and synchronization support
- External system integration flexibility

### Timestamp Tracking

Comprehensive timestamp tracking enables:
- Audit trail maintenance
- Change tracking for compliance
- Performance monitoring
- Data synchronization support

### User Tracking

User identification fields support:
- Change accountability
- Access control integration
- Audit trail completeness
- Multi-user environment support

## Extensibility and Maintenance

### Schema Evolution

The design supports future enhancements through:
- Flexible text fields for descriptions and notes
- JSON columns for future metadata requirements
- Extensible constraint definitions
- Modular table structure for new features

### Backup and Recovery

The schema design facilitates backup and recovery through:
- Clear table relationships for consistent backups
- Referential integrity for data validation
- Trigger-based calculations that rebuild automatically
- View definitions that recreate derived data

### Performance Monitoring

Built-in features for performance monitoring:
- Timestamp fields for query optimization
- Index coverage for common access patterns
- View definitions for complex query optimization
- Trigger efficiency for real-time calculations

## Sample Data and Testing

The schema includes sample data insertion for:
- Standard rates based on the Ais360 prototype
- Department and task type definitions
- Rate structures matching the UI implementation
- Testing data for validation and development

This comprehensive database schema provides a robust foundation for the Ais360 Job Estimate Management System, supporting all current functionality while providing flexibility for future enhancements and scalability requirements.

