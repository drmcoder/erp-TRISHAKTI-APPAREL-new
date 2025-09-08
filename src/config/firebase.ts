import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getDatabase, connectDatabaseEmulator } from "firebase/database";
import { getMessaging, isSupported } from "firebase/messaging";
import { getStorage } from "firebase/storage";

// Import environment configuration
import { ENV_CONFIG, validateEnvironmentConfig } from './environment';

// Validate environment configuration on startup
const configValidation = validateEnvironmentConfig();
if (!configValidation.valid) {
  console.error('❌ Environment Configuration Errors:', configValidation.errors);
  if (ENV_CONFIG.isProduction) {
    throw new Error(`Invalid production configuration: ${configValidation.errors.join(', ')}`);
  }
}

// Firebase configuration using centralized environment service
const firebaseConfig = {
  apiKey: ENV_CONFIG.firebase.apiKey,
  authDomain: ENV_CONFIG.firebase.authDomain,
  databaseURL: ENV_CONFIG.firebase.databaseURL,
  projectId: ENV_CONFIG.firebase.projectId,
  storageBucket: ENV_CONFIG.firebase.storageBucket,
  messagingSenderId: ENV_CONFIG.firebase.messagingSenderId,
  appId: ENV_CONFIG.firebase.appId,
  measurementId: ENV_CONFIG.firebase.measurementId
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

// Firebase Emulators for Development
if (ENV_CONFIG.features.useFirebaseEmulators && ENV_CONFIG.isDevelopment) {
  try {
    // Connect to Firestore emulator
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('🔧 Connected to Firestore emulator on port 8080');
    
    // Connect to Auth emulator
    connectAuthEmulator(auth, 'http://localhost:9099');
    console.log('🔧 Connected to Auth emulator on port 9099');
    
    // Connect to Database emulator
    connectDatabaseEmulator(rtdb, 'localhost', 9000);
    console.log('🔧 Connected to Database emulator on port 9000');
    
    console.log('✅ Firebase emulators connected successfully');
  } catch (error) {
    console.warn('⚠️ Failed to connect to Firebase emulators:', error);
    console.log('📝 Make sure Firebase emulators are running: firebase emulators:start');
  }
} else if (ENV_CONFIG.isDevelopment) {
  console.log('🌐 Using live Firebase services in development mode');
} else {
  console.log('🚀 Using live Firebase services in production mode');
}

export default app;