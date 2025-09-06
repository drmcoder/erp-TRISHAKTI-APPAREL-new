import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getDatabase, connectDatabaseEmulator } from "firebase/database";
import { getMessaging, isSupported } from "firebase/messaging";
import { getStorage } from "firebase/storage";

// NEW Firebase configuration for ERP-FOR-TSA (as per REBUILD_BLUEPRINT.md)
const firebaseConfig = {
  apiKey: "AIzaSyB8Z4GdoLZsBW6bfmAh_BSTftpTRUXPZMw",
  authDomain: "erp-for-tsa.firebaseapp.com",
  projectId: "erp-for-tsa",
  storageBucket: "erp-for-tsa.firebasestorage.app",
  messagingSenderId: "271232983905",
  appId: "1:271232983905:web:7d06c8f5ec269824759b20",
  measurementId: "G-6CYWPS4N0G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services (following REBUILD_BLUEPRINT architecture)
export const db = getFirestore(app);
export const auth = getAuth(app);
export const rtdb = getDatabase(app);
export const storage = getStorage(app);

// Analytics for production monitoring
import { getAnalytics } from 'firebase/analytics';
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Initialize messaging only if supported (PWA feature)
let messaging: any = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      messaging = getMessaging(app);
    }
  });
}
export { messaging };

// Firestore Collection Names
export const COLLECTIONS = {
  OPERATORS: "operators",
  SUPERVISORS: "supervisors", 
  MANAGEMENT: "management",
  BUNDLES: "bundles",
  WORK_ASSIGNMENTS: "workAssignments",
  WORK_ITEMS: "workItems",
  WORK_COMPLETIONS: "workCompletions",
  WIP_ENTRIES: "wipEntries",
  WIP_ROLLS: "wipRolls",
  ASSIGNMENT_HISTORY: "assignmentHistory",
  QUALITY_ISSUES: "qualityIssues",
  PRODUCTION_STATS: "productionStats",
  EFFICIENCY_LOGS: "efficiencyLogs",
  OPERATOR_EARNINGS: "operatorEarnings",
  NOTIFICATIONS: "notifications",
  DAILY_REPORTS: "dailyReports",
  LINE_STATUS: "lineStatus",
  SIZE_CONFIGS: "sizeConfigs",
  MACHINE_CONFIGS: "machineConfigs",
  ARTICLE_TEMPLATES: "articleTemplates",
  DELETED_TEMPLATES: "deletedTemplates",
  SYSTEM_SETTINGS: "systemSettings",
  WAGE_RECORDS: "wageRecords",
  // New collections for user management
  USERS: "users",
  USER_ACTIVITIES: "user_activities",
  SYSTEM_ACTIVITIES: "system_activities",
  DAMAGE_REPORTS: "damage_reports",
  DAMAGE_NOTIFICATIONS: "damage_notifications",
  OPERATOR_WALLETS: "operatorWallets"
};

// Realtime Database Paths
export const RT_PATHS = {
  OPERATOR_STATUS: 'operator_status',
  WORK_PROGRESS: 'work_progress',
  STATION_STATUS: 'station_status', 
  LIVE_METRICS: 'live_metrics',
  NOTIFICATIONS: 'notifications',
  SYSTEM_HEALTH: 'system_health',
  ACTIVE_SESSIONS: 'active_sessions',
  AVAILABLE_WORK: 'available_work',
  LINE_BALANCING: 'line_balancing'
};

// Realtime Configuration
export const REALTIME_CONFIG = {
  connectionTimeout: 10000,
  maxRetries: 3,
  retryDelay: 2000,
  heartbeatInterval: 30000
};

// Development mode emulators
if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_EMULATORS === 'true') {
  // Connect to Firestore emulator
  connectFirestoreEmulator(db, 'localhost', 8080);
  
  // Connect to Auth emulator
  connectAuthEmulator(auth, 'http://localhost:9099');
  
  // Connect to Database emulator
  connectDatabaseEmulator(rtdb, 'localhost', 9000);
  
  console.log('Connected to Firebase emulators');
}

export default app;