# Project Requirements Document

## Project Overview
- **Project Name**: Dynamic Frontend AI Analyst
- **Project Description**: A web-based AI data analysis platform designed for small to medium businesses, providing statistical analysis and insights through integrations with common business platforms.
- **Target Users**: Small to medium business owners and their data analysts
- **Key Features**: 
  - Data integration with Shopify and BigQuery
  - Statistical analysis and visualization
  - Interactive data exploration
  - AI-powered insights generation

## Technical Stack

### Frontend
- **Framework**: React with Vite
- **Language**: TypeScript
- **UI/Styling**: Tailwind CSS, Radix UI
- **State Management**: Apollo Client
- **Data Visualization**: Chart.js, React Flow

### Backend
- **API Layer**: GraphQL
- **Database**: Supabase
- **Authentication**: Auth0
- **Data Processing**: BigQuery integration

### DevOps
- **Version Control**: Git
- **Code Quality**: Biome
- **Hosting**: Render
- **Type Safety**: Zod

## Core Requirements

### Functional Requirements
1. Data Integration
   - Connect and authenticate with Shopify
   - Connect and authenticate with BigQuery
   - Support data import from multiple sources
   - Handle data type mapping and transformation

2. Analysis Features
   - Basic statistical analysis of datasets
   - Data visualization with charts and graphs
   - Interactive data exploration interface
   - Export capabilities (PDF, XLSX)

3. User Interface
   - Intuitive dashboard for data overview
   - Interactive query builder
   - Customizable visualization options
   - Responsive design for various screen sizes

### Non-Functional Requirements
- **Performance**: Optimize for smooth interaction with medium-sized datasets
- **Security**: 
  - Secure authentication via Auth0
  - Data encryption in transit
  - Role-based access control
- **Accessibility**: WCAG 2.1 Level AA compliance
- **Scalability**: Support for future integration of additional data sources

## Development Guidelines
- **Code Style**: 
  - Follow functional programming patterns
  - Use TypeScript for type safety
  - Implement responsive design with Flexbox
  - Use Tailwind CSS for styling
- **Testing**: Unit tests for core functionality
- **Documentation**: 
  - JSDoc for functions
  - Markdown documentation for setup and usage
- **Git Flow**: Feature branches with PR reviews

## Project Timeline
- **Phase 1**: Core Integration Features (Shopify & BigQuery) - Q2 2025
- **Phase 2**: Analysis Features & UI Enhancement - Q3 2025
- **Phase 3**: Performance Optimization & Launch - Q4 2025

## Additional Notes
- Dependencies are managed through npm
- Current implementation focuses on web browser access
- Future considerations:
  - Additional data source integrations
  - Advanced AI analysis features
  - Custom reporting templates
  - Mobile-optimized interface

---
Last Updated: 2025-06-04
Version: 1.0
