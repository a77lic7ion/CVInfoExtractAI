
export interface WorkExperience {
  company: string;
  position: string;
  duration: string;
  reasonForLeaving: string;
}

export interface Qualification {
  institution: string;
  course: string;
  year: string;
}

export interface ExtractedCVData {
  fullName: string;
  age: number;
  driversLicense: boolean;
  ownTransport: boolean;
  noticePeriod: string;
  salaryRequirement: string;
  workHistory: WorkExperience[];
  qualifications: Qualification[];
}
