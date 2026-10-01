import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { SharedProject, Project, ProjectFile } from '../types';
import { getProject, getProjectFiles } from './projectService';

/**
 * Creates or gets an existing share record for a project
 */
export async function createShareLink(
  projectId: string,
  ownerId: string,
  permission: 'view' | 'fork' = 'view'
): Promise<SharedProject> {
  const shareId = `sh_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date().toISOString();

  const shareRecord: SharedProject = {
    shareId,
    projectId,
    ownerId,
    permission,
    createdAt: now,
  };

  try {
    await setDoc(doc(db, 'sharedProjects', shareId), shareRecord);
    return shareRecord;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `sharedProjects/${shareId}`);
  }
}

/**
 * Fetch a shared project by shareId
 */
export async function getSharedProjectDetails(
  shareId: string
): Promise<{ share: SharedProject; project: Project; files: ProjectFile[] } | null> {
  try {
    const snap = await getDoc(doc(db, 'sharedProjects', shareId));
    if (!snap.exists()) return null;

    const share = snap.data() as SharedProject;
    const project = await getProject(share.projectId);
    if (!project) return null;

    const files = await getProjectFiles(share.projectId);
    return { share, project, files };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `sharedProjects/${shareId}`);
  }
}

/**
 * List active shares for a project
 */
export async function getProjectShares(projectId: string): Promise<SharedProject[]> {
  try {
    const q = query(collection(db, 'sharedProjects'), where('projectId', '==', projectId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as SharedProject);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'sharedProjects');
  }
}

/**
 * Delete / Revoke a share link
 */
export async function revokeShareLink(shareId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'sharedProjects', shareId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `sharedProjects/${shareId}`);
  }
}
