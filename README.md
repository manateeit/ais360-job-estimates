# Ais360 Job Estimate Management System

A comprehensive web application for managing job estimates in the sign industry, featuring detailed cost breakdowns, department-specific workflows, and automated calculations.

## 🚀 Live Demo

**Frontend Prototype:** [View Live Demo](https://5173-i3ta90nglgvnxlyvkbmbx-07a53a4d.manusvm.computer)

## 📋 Features

### ✅ Complete Job Estimation Workflow
- **Job Information Entry** - Contact details, project manager, estimator
- **Job Estimate Summary** - Overview page with sign management
- **Sign Entry Forms** - Detailed cost breakdown by department
- **Automatic Calculations** - Real-time totals and profit margins

### ✅ Department-Specific Cost Tracking
1. **Art Department** - Design, CAD, Router, Vinyl, Printing, etc.
2. **Fabrication Department** - Channel Letters, Trimcap, Aluminum, Wiring, etc.
3. **Installation Department** - Service trucks, Elliot lifts, crew configurations
4. **SubContractors & Permits** - Free-form entries for project-specific needs
5. **Materials** - Inventory tracking with markup calculations
6. **Crating & Other Fees** - Miscellaneous project costs

### ✅ Modern UI/UX
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Clean Interface** - Professional styling with intuitive navigation
- **Full-Screen Forms** - Spacious sign entry interface
- **Mobile-Optimized** - Card-based layouts for small screens

### ✅ Advanced Functionality
- **Dynamic Row Management** - Add/remove items as needed
- **Pre-filled Rates** - Standard rates based on industry data
- **Action Buttons** - Edit, Delete, Copy functionality for signs
- **Progress Tracking** - Visual workflow indicators

## 🛠 Technology Stack

### Frontend
- **React** - Modern component-based UI framework
- **Vite** - Fast build tool and development server
- **CSS3** - Custom styling with responsive design
- **JavaScript ES6+** - Modern JavaScript features

### Database
- **PostgreSQL** - Robust relational database
- **Supabase** - Backend-as-a-Service platform
- **Automated Triggers** - Real-time calculation updates
- **Generated Columns** - Computed values for efficiency

## 📁 Project Structure

```
ais360-job-estimates/
├── src/
│   ├── App.jsx              # Main application component
│   ├── App.css              # Application styling
│   └── main.jsx             # Application entry point
├── database/
│   └── jobestimate_postgresql_schema_fixed.sql  # Complete database schema
├── docs/
│   ├── jobestimate_database_documentation.md    # Database documentation
│   └── supabase_manual_instructions.md          # Setup instructions
├── public/                  # Static assets
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- PostgreSQL database (or Supabase account)

### Frontend Setup
```bash
# Clone the repository
git clone https://github.com/manateeit/ais360-job-estimates.git
cd ais360-job-estimates

# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

### Database Setup
1. **Create Supabase Project** or set up PostgreSQL
2. **Run Database Schema:**
   - Copy contents of `database/jobestimate_postgresql_schema_fixed.sql`
   - Execute in Supabase SQL Editor or PostgreSQL client
3. **Verify Tables:** Check that all 11 `jobestimate_*` tables are created

## 📊 Database Schema

### Core Tables
- **jobestimate_jobs** - Main job estimates with totals
- **jobestimate_signs** - Individual signs within jobs
- **jobestimate_art_department** - Art department line items
- **jobestimate_fabrication_department** - Fabrication tasks
- **jobestimate_installation_department** - Installation work
- **jobestimate_subcontractors** - SubContractors and permits
- **jobestimate_materials** - Materials with markup
- **jobestimate_crating_fees** - Crating and miscellaneous fees

### Features
- **Automatic Calculations** - Triggers update totals in real-time
- **Audit Trail** - Status change history tracking
- **Standard Rates** - Pre-configured industry rates
- **Data Validation** - Constraints ensure data integrity

## 💰 Standard Rates (Pre-configured)

### Art Department
- Design, CAD: $127.33/hour
- Router, Vinyl, Printing: $75.40/hour
- Cutting, Drill & Tap: $75.40/hour

### Fabrication Department
- Channel Letters: $100.55/hour
- Aluminum Fabrication: $97.83/hour
- Trimcap: $49.02/hour

### Installation Department
- 1 Man Service Truck: $173.00/hour
- 2 Men Bucket/Van: $233.55/hour
- 4 Men Install Team: $519.00/hour

## 📱 Mobile Experience

The application is fully responsive with:
- **Mobile-First Design** - Optimized for touch interfaces
- **Card-Based Layouts** - Clean organization on small screens
- **Full-Screen Forms** - Maximum space utilization
- **Touch-Friendly Controls** - Large buttons and inputs

## 🔧 Development

### Available Scripts
```bash
pnpm run dev          # Start development server
pnpm run build        # Build for production
pnpm run preview      # Preview production build
pnpm run lint         # Run ESLint
```

### Key Components
- **Job Creation Workflow** - Multi-step form process
- **Sign Entry Forms** - Department-specific cost entry
- **Dynamic Tables** - Add/remove rows functionality
- **Calculation Engine** - Real-time total updates

## 📖 Documentation

- **[Database Documentation](docs/jobestimate_database_documentation.md)** - Complete schema reference
- **[Supabase Setup Guide](docs/supabase_manual_instructions.md)** - Step-by-step database setup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Complete job estimation workflow
- ✅ All department cost tracking
- ✅ Mobile-responsive design
- ✅ Database schema with automatic calculations

### Phase 2 (Planned)
- [ ] User authentication and authorization
- [ ] PDF export functionality
- [ ] Email integration for estimates
- [ ] Advanced reporting and analytics

### Phase 3 (Future)
- [ ] Integration with accounting systems
- [ ] Mobile app development
- [ ] Advanced workflow automation
- [ ] Multi-company support

## 📞 Support

For questions or support, please open an issue in this repository or contact the development team.

---

**Built with ❤️ for the sign industry**

