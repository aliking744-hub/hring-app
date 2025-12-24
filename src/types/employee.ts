export interface Employee {
  id: string;
  personnelCode: string;
  name?: string;
  lastName?: string;
  fullName?: string;
  gender: 'مرد' | 'زن';
  birthDate: string;
  birthMonth: string;
  education: string;
  educationField: string;
  maritalStatus: string;
  childrenCount: number;
  department: string;
  position: string;
  employmentType: string;
  employmentDate: string;
  location: string;
  region: number;
  salary: number;
  contractSalary: number;
  overtimeHours: number;
  evaluationScore: number;
  managerEvaluation: number;
  selfEvaluation: number;
  deputyEvaluation: number;
  peerEvaluation: number;
  performanceScore: number;
  knowledgeScore: number;
  behaviorScore: number;
  responsibilityScore: number;
  ageGroup: string;
  tenure: number;
}

export interface FilterState {
  gender: string[];
  education: string[];
  department: string[];
  location: string[];
  position: string[];
}

export type TabType = 'overview' | 'birthdays' | 'salary' | 'map' | 'profile' | 'overtime';
