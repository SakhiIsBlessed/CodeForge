export type ProjectLanguage =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'java'
  | 'cpp'
  | 'html'
  | 'rust'
  | 'go';

export type ProjectVisibility = 'private' | 'unlisted' | 'public';

export interface EditorPreferences {
  theme: 'vs-dark' | 'github-dark' | 'monokai' | 'dracula' | 'light';
  fontSize: number;
  fontFamily: string;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  autoSave: boolean;
  autoSaveDelay: number; // in milliseconds (default 1500ms)
}

export interface UserProfile {
  uid: string;
  fullName: string;
  username: string;
  email: string;
  photoURL?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  emailVerified: boolean;
  theme?: 'dark' | 'light';
  editorPreferences?: EditorPreferences;
  defaultLanguage?: ProjectLanguage;
  githubUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  isPublic?: boolean;
}

export interface Project {
  projectId: string;
  ownerId: string;
  ownerName: string;
  ownerUsername: string;
  name: string;
  description: string;
  language: ProjectLanguage;
  visibility: ProjectVisibility;
  createdAt: string;
  updatedAt: string;
  lastOpenedAt?: string;
  isFavorite?: boolean;
  filesCount?: number;
}

export interface ProjectFile {
  fileId: string;
  projectId: string;
  name: string;
  path: string;
  content: string;
  language: string;
  createdAt: string;
  updatedAt: string;
  size: number;
}

export type ExecutionStatus =
  | 'Running'
  | 'Success'
  | 'Compilation Error'
  | 'Runtime Error'
  | 'Timeout'
  | 'Failed';

export interface ExecutionRecord {
  executionId: string;
  userId: string;
  projectId: string;
  projectName?: string;
  language: string;
  status: ExecutionStatus;
  executionTime: number; // ms
  memoryUsage?: string;
  exitCode: number;
  output: string;
  createdAt: string;
}

export interface SharedProject {
  shareId: string;
  projectId: string;
  ownerId: string;
  permission: 'view' | 'fork';
  createdAt: string;
  expiresAt?: string;
}

export type ReportStatus = 'Open' | 'Reviewing' | 'Resolved' | 'Dismissed';
export type ReportTargetType = 'project' | 'shared' | 'profile';

export interface Report {
  reportId: string;
  reporterId: string;
  targetId: string;
  targetType: ReportTargetType;
  reason: string;
  status: ReportStatus;
  createdAt: string;
}

export interface PlatformStats {
  totalUsers: number;
  totalProjects: number;
  totalExecutions: number;
  totalReports: number;
  systemStatus: 'Optimal' | 'Degraded' | 'Maintenance';
}
