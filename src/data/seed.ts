import { Problem, ProblemStatus, University, IndustryPartner, Project, StudentTeam } from '../types';

export const seededUniversities: University[] = [
  {
    id: 'UNI-001',
    name: 'Birla Institute of Technology, Mesra',
    location: 'Ranchi, Jharkhand',
    expertise: ['Civil Engineering', 'Environmental Engineering', 'IoT', 'Computer Science'],
    researchAreas: ['Smart Infrastructure', 'Water Management', 'Urban Planning'],
    availableTeams: 4,
    studentTeamCount: 12,
    geographicRelevance: 'HIGH',
    currentCapacity: 'HIGH',
    isDemoData: true
  },
  {
    id: 'UNI-002',
    name: 'National Institute of Technology, Jamshedpur',
    location: 'Jamshedpur, Jharkhand',
    expertise: ['Civil Engineering', 'Electrical Engineering', 'Mechanical Engineering'],
    researchAreas: ['Structural Engineering', 'Hydraulics', 'Sustainable Development'],
    availableTeams: 3,
    studentTeamCount: 8,
    geographicRelevance: 'MEDIUM',
    currentCapacity: 'MEDIUM',
    isDemoData: true
  },
  {
    id: 'UNI-003',
    name: 'Indian Institute of Information Technology, Ranchi',
    location: 'Ranchi, Jharkhand',
    expertise: ['Computer Science', 'Electronics', 'IoT', 'Data Science'],
    researchAreas: ['Smart Sensors', 'AI for Good', 'Embedded Systems'],
    availableTeams: 2,
    studentTeamCount: 5,
    geographicRelevance: 'HIGH',
    currentCapacity: 'LOW',
    isDemoData: true
  },
  {
    id: 'UNI-004',
    name: 'BIT Sindri',
    location: 'Dhanbad, Jharkhand',
    expertise: ['Civil Engineering', 'Mechanical Engineering', 'Metallurgical Engineering'],
    researchAreas: ['Urban Infrastructure', 'Material Science', 'Fluid Dynamics'],
    availableTeams: 5,
    studentTeamCount: 15,
    geographicRelevance: 'MEDIUM',
    currentCapacity: 'HIGH',
    isDemoData: true
  },
  {
    id: 'UNI-005',
    name: 'Central University of Jharkhand',
    location: 'Ranchi, Jharkhand',
    expertise: ['Environmental Sciences', 'Energy Engineering', 'Water Resources'],
    researchAreas: ['Climate Change', 'Water Quality', 'Renewable Energy'],
    availableTeams: 1,
    studentTeamCount: 3,
    geographicRelevance: 'HIGH',
    currentCapacity: 'LOW',
    isDemoData: true
  }
];

export const seededIndustryPartners: IndustryPartner[] = [
  {
    id: 'IND-001',
    name: 'AquaSense Technologies',
    expertise: ['IoT Sensors', 'Water Monitoring', 'Smart Infrastructure'],
    contribution: 'Sensor hardware and technical mentorship',
    matchScore: 88,
    demoData: true
  },
  {
    id: 'IND-002',
    name: 'SmartInfra Labs',
    expertise: ['Smart City Systems', 'Infrastructure Monitoring'],
    contribution: 'Deployment guidance and systems integration',
    matchScore: 84,
    demoData: true
  },
  {
    id: 'IND-003',
    name: 'CivicTech Solutions',
    expertise: ['Software Development', 'Data Analytics', 'Dashboards'],
    contribution: 'Software architecture and data visualization',
    matchScore: 75,
    demoData: true
  }
];

export const seededProjects: Project[] = [];
export const seededTeams: StudentTeam[] = [];

export const seededProblems: Problem[] = [
  {
    id: 'PRB-001',
    title: 'Severe waterlogging near college road',
    description: 'Severe waterlogging during monsoon affecting students and residents.',
    category: 'Water & Sanitation',
    location: 'Ranchi, Jharkhand',
    status: ProblemStatus.SUBMITTED,
    submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    submittedBy: 'Citizen 1',
    aiAnalysis: {
      category: 'Water & Sanitation',
      subCategory: 'Urban Waterlogging',
      priority: 'HIGH',
      confidence: 94,
      summary: 'Recurring waterlogging is affecting pedestrian and vehicular movement near an educational area.',
      affectedPopulation: '500-1000 estimated',
      duplicateCheck: 'No similar active report found',
      suggestedExpertise: ['Civil Engineering', 'Environmental Engineering', 'Urban Planning', 'IoT / Smart Infrastructure']
    },
    governmentReview: {
      status: 'PENDING'
    },
    expertiseRequirements: [
      { name: 'Civil Engineering', type: 'PRIMARY', importance: 'CRITICAL', confidence: 96 },
      { name: 'Environmental Engineering', type: 'PRIMARY', importance: 'HIGH', confidence: 92 },
      { name: 'Urban Planning', type: 'SUPPORTING', importance: 'MEDIUM', confidence: 85 },
      { name: 'Water Resources', type: 'SUPPORTING', importance: 'HIGH', confidence: 89 },
      { name: 'IoT / Smart Infrastructure', type: 'SUPPORTING', importance: 'MEDIUM', confidence: 75 },
      { name: 'Drainage Systems', type: 'TECHNICAL_AREA', importance: 'CRITICAL', confidence: 98 },
      { name: 'Flood Monitoring', type: 'TECHNICAL_AREA', importance: 'HIGH', confidence: 90 },
      { name: 'Smart Sensors', type: 'TECHNICAL_AREA', importance: 'MEDIUM', confidence: 80 }
    ],
    invitations: []
  },

  {
    id: 'PRB-002',
    title: 'Street lighting failure in Ward 12',
    description: 'Complete failure of street lights along the main corridor making it unsafe at night.',
    category: 'Public Safety',
    location: 'Ranchi, Jharkhand',
    status: ProblemStatus.SUBMITTED,
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    submittedBy: 'Citizen 2',
    aiAnalysis: {
      category: 'Public Safety',
      subCategory: 'Street Lighting',
      priority: 'MEDIUM',
      confidence: 91,
      summary: 'Main corridor street lighting is non-functional, posing safety and security risks.',
      affectedPopulation: '1000-2000 estimated',
      duplicateCheck: 'No similar active report found',
      suggestedExpertise: ['Electrical Engineering', 'Smart City Planning']
    },
    governmentReview: {
      status: 'PENDING'
    }
  }
];
