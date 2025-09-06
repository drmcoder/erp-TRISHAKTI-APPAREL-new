// src/infrastructure/firebase/config.ts
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getDatabase, Database } from 'firebase/database';
import { getAnalytics, Analytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyB8Z4GdoLZsBW6bfmAh_BSTftpTRUXPZMw',
  authDomain: 'erp-for-tsa.firebaseapp.com',
  projectId: 'erp-for-tsa',
  storageBucket: 'erp-for-tsa.firebasestorage.app',
  messagingSenderId: '271232983905',
  appId: '1:271232983905:web:7d06c8f5ec269824759b20',
  measurementId: 'G-6CYWPS4N0G',
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize services
export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);
export const rtdb: Database = getDatabase(app);
export const analytics: Analytics = getAnalytics(app);

// Firebase collections constants
export const COLLECTIONS = {
  OPERATORS: 'operators',
  SUPERVISORS: 'supervisors',
  MANAGEMENT: 'management',
  BUNDLES: 'bundles',
  WORK_ASSIGNMENTS: 'workAssignments',
  WORK_ITEMS: 'workItems',
  WORK_COMPLETIONS: 'workCompletions',
  WIP_ENTRIES: 'wipEntries',
  WIP_ROLLS: 'wipRolls',
  ASSIGNMENT_HISTORY: 'assignmentHistory',
  QUALITY_ISSUES: 'qualityIssues',
  NOTIFICATIONS: 'notifications',
  DAILY_REPORTS: 'dailyReports',
  PRODUCTION_STATS: 'productionStats',
  EFFICIENCY_LOGS: 'efficiencyLogs',
  SIZE_CONFIGS: 'sizeConfigs',
  MACHINE_CONFIGS: 'machineConfigs',
  ARTICLE_TEMPLATES: 'articleTemplates',
  DELETED_TEMPLATES: 'deletedTemplates',
  SYSTEM_SETTINGS: 'systemSettings',
  WAGE_RECORDS: 'wageRecords',
  LINE_STATUS: 'lineStatus',
  DAMAGE_REPORTS: 'damage_reports',
  DAMAGE_NOTIFICATIONS: 'damage_notifications',
  OPERATOR_WALLETS: 'operatorWallets',
} as const;

// Realtime Database paths
export const RT_PATHS = {
  OPERATOR_STATUS: 'operator_status', // Live operator status
  WORK_PROGRESS: 'work_progress', // Current work progress
  STATION_STATUS: 'station_status', // Station monitoring
  LIVE_METRICS: 'live_metrics', // Live counters/metrics
  NOTIFICATIONS: 'notifications', // Real-time notifications
  SYSTEM_HEALTH: 'system_health', // System health monitoring
  ACTIVE_SESSIONS: 'active_sessions', // Active user sessions
} as const;

export default app;
