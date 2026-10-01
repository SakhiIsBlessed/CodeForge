import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { Report, ReportStatus, ReportTargetType } from '../types';

export async function submitReport(
  reporterId: string,
  targetId: string,
  targetType: ReportTargetType,
  reason: string
): Promise<Report> {
  const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const report: Report = {
    reportId,
    reporterId,
    targetId,
    targetType,
    reason: reason.trim(),
    status: 'Open',
    createdAt: now,
  };

  try {
    await setDoc(doc(db, 'reports', reportId), report);
    return report;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `reports/${reportId}`);
  }
}

export async function fetchAllReports(): Promise<Report[]> {
  try {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'), limit(50));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Report);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'reports');
  }
}

export async function updateReportStatus(reportId: string, status: ReportStatus): Promise<void> {
  try {
    await updateDoc(doc(db, 'reports', reportId), { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `reports/${reportId}`);
  }
}

export async function deleteReport(reportId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'reports', reportId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `reports/${reportId}`);
  }
}
