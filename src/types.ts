export const USER_ROLES = ['CITIZEN', 'GOVERNMENT', 'UNIVERSITY', 'INDUSTRY'] as const;

export type UserRole = typeof USER_ROLES[number];
export type Role = UserRole;

export const ROLE_LABELS: Record<UserRole, string> = {
  CITIZEN: 'Citizen',
  GOVERNMENT: 'Government',
  UNIVERSITY: 'University',
  INDUSTRY: 'Industry',
};

export function normalizeUserRole(value: unknown): UserRole | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toUpperCase();
  return (USER_ROLES as readonly string[]).includes(normalized) ? normalized as UserRole : null;
}

export function getRoleLabel(role: UserRole): string {
  return ROLE_LABELS[role];
}

export enum ProblemStatus {
  SUBMITTED = 'SUBMITTED',
  AI_ANALYZED = 'AI_ANALYZED',
  PENDING_GOVERNMENT = 'PENDING_GOVERNMENT',
  CLARIFICATION_REQUESTED = 'CLARIFICATION_REQUESTED',
  REJECTED = 'REJECTED',
  GOVERNMENT_VALIDATED = 'GOVERNMENT_VALIDATED',
  UNIVERSITY_MATCHING = 'UNIVERSITY_MATCHING',
  INVITATION_SENT = 'INVITATION_SENT',
  UNIVERSITY_ACCEPTED = 'UNIVERSITY_ACCEPTED'
}

export enum ProjectStatus {
  UNIVERSITY_ACCEPTED = 'UNIVERSITY_ACCEPTED',
  PROJECT_CREATED = 'PROJECT_CREATED',
  INDUSTRY_JOINED = 'INDUSTRY_JOINED',
  IN_PROGRESS = 'IN_PROGRESS',
  READY_FOR_DEPLOYMENT = 'READY_FOR_DEPLOYMENT',
  DEPLOYED = 'DEPLOYED'
}

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface AIAnalysis {
  category: string;
  subCategory: string;
  priority: Priority;
  confidence: number;
  summary: string;
  affectedPopulation: string;
  duplicateCheck: string;
  suggestedExpertise: string[];
}

export interface GovernmentReview {
  reviewedBy?: string;
  reviewedAt?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REQUEST_INFO';
  comments?: string;
  rejectionReason?: string;
}

export interface ExpertiseRequirement {
  name: string;
  type: 'PRIMARY' | 'SUPPORTING' | 'TECHNICAL_AREA';
  importance: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  confidence: number;
}

export interface UniversityInvitation {
  id: string;
  problemId: string;
  universityId: string;
  universityName?: string;
  matchScore?: number;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  sentAt?: string;
  respondedAt?: string;
  message?: string;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  affectedArea?: string;
  estimatedPeopleAffected?: string;
  imageUrl?: string;
  
  status: ProblemStatus;
  submittedAt: string;
  submittedBy: string;
  
  aiAnalysis?: AIAnalysis;
  governmentReview?: GovernmentReview;
  expertiseRequirements?: ExpertiseRequirement[];
  invitations?: UniversityInvitation[];
}

export function canEnterUniversityMatching(problem: Problem): boolean {
  return problem.status === ProblemStatus.GOVERNMENT_VALIDATED;
}

export interface University {
  id: string;
  name: string;
  location: string;
  expertise: string[];
  researchAreas: string[];
  availableTeams: number;
  studentTeamCount: number;
  geographicRelevance: 'HIGH' | 'MEDIUM' | 'LOW';
  currentCapacity: 'HIGH' | 'MEDIUM' | 'LOW';
  isDemoData: boolean;
}

export interface UniversityMatch {
  universityId: string;
  overallScore: number;
  expertiseScore: number;
  researchScore: number;
  teamAvailabilityScore: number;
  geographicScore: number;
  reasons: string[];
}

export interface Student {
  id: string;
  name: string;
  discipline: string;
  role: string;
  demoData: boolean;
}

export interface StudentTeam {
  id: string;
  name: string;
  universityId: string;
  members: Student[];
  expertise: string[];
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  dueDate?: string;
  responsibleGroup: string;
  completionPercentage: number;
}

export interface IndustryPartner {
  id: string;
  name: string;
  expertise: string[];
  contribution: string;
  matchScore: number;
  demoData: boolean;
}

export interface IndustryCollaboration {
  projectId: string;
  partnerId: string;
  status: 'INVITED' | 'JOINED';
  joinedAt?: string;
  contribution: string;
}

export interface Project {
  id: string;
  problemId: string;
  universityId: string;
  teamId?: string;
  industryPartnerId?: string;
  title: string;
  objective: string;
  status: ProjectStatus;
  progress: number;
  milestones: Milestone[];
  collaborations?: IndustryCollaboration[];
  deployment?: Deployment;
  impactMetrics?: ImpactMetrics;
}

export function isProjectReadyForDeployment(project: Project): boolean {
  if (!project) return false;
  if (!project.teamId) return false;
  
  const requiredMilestones = [
    'Problem Validation',
    'Field Survey',
    'Solution Design',
    'Prototype Development',
    'Prototype Testing',
    'Government Pilot'
  ];
  
  for (const title of requiredMilestones) {
    const m = project.milestones.find(m => m.title === title);
    if (!m || m.status !== 'COMPLETED') return false;
  }
  
  return true;
}

export interface Deployment {
  id: string;
  projectId: string;
  deploymentStatus: 'PENDING' | 'LIVE';
  deploymentDate?: string;
  location: string;
  deploymentType: string;
  technology: string;
  governmentVerified: boolean;
}

export interface ImpactMetrics {
  projectId: string;
  peopleImpacted: number;
  incidentsBefore: number;
  incidentsAfter: number;
  responseTimeBefore: number;
  responseTimeAfter: number;
  costSavings: number;
  deploymentCoverage: string;
  satisfactionScore: number;
  measurementPeriod: string;
  isDemoData: boolean;
}

export interface ImpactStory {
  projectId: string;
  problem: Problem;
  solution: Project;
  university: University;
  studentTeam?: StudentTeam;
  industryPartner?: IndustryPartner;
  deployment?: Deployment;
  impact?: ImpactMetrics;
}
