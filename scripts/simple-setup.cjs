#!/usr/bin/env node

// Simplified Firebase Setup Script for TSA ERP
const admin = require('firebase-admin');

// Initialize Firebase Admin with project ID only (for demonstration)
admin.initializeApp({
  projectId: 'erp-for-tsa'
});

const db = admin.firestore();

async function setupSimpleData() {
  console.log('🚀 Setting up TSA ERP sample data...');

  try {
    // Sample Operators
    const operators = [
      {
        id: 'op-maya-001',
        name: 'Maya Sharma',
        employeeId: 'EMP001',
        skillLevel: 'Expert',
        primaryMachine: 'Overlock',
        currentStatus: 'working',
        averageEfficiency: 0.92,
        qualityScore: 0.88,
        supervisorId: 'sup-john-001',
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      },
      {
        id: 'op-ram-002',
        name: 'Ram Singh',
        employeeId: 'EMP002',
        skillLevel: 'Intermediate',
        primaryMachine: 'Single Needle',
        currentStatus: 'break',
        averageEfficiency: 0.85,
        qualityScore: 0.82,
        supervisorId: 'sup-john-001',
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      }
    ];

    // Sample Supervisor
    const supervisors = [
      {
        id: 'sup-john-001',
        name: 'John Kumar',
        employeeId: 'SUP001',
        supervisorLevel: 'Senior',
        responsibleLines: ['line-001', 'line-002'],
        teamSize: 12,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      }
    ];

    // Sample Work Items
    const workItems = [
      {
        id: 'work-001',
        bundleNumber: 'B001-T001',
        operation: 'Side Seam',
        machineType: 'Overlock',
        estimatedDuration: 45,
        status: 'available',
        priority: 'high',
        createdAt: admin.firestore.Timestamp.now()
      },
      {
        id: 'work-002',
        bundleNumber: 'B002-T002',
        operation: 'Button Hole',
        machineType: 'Single Needle',
        estimatedDuration: 30,
        status: 'available',
        priority: 'medium',
        createdAt: admin.firestore.Timestamp.now()
      }
    ];

    // Sample Wallets
    const wallets = [
      {
        operatorId: 'op-maya-001',
        availableAmount: 2500,
        heldAmount: 150,
        totalEarned: 12500,
        lastUpdated: admin.firestore.Timestamp.now()
      },
      {
        operatorId: 'op-ram-002',
        availableAmount: 1800,
        heldAmount: 0,
        totalEarned: 8900,
        lastUpdated: admin.firestore.Timestamp.now()
      }
    ];

    // Assignment Requests
    const assignmentRequests = [
      {
        id: 'req-001',
        operatorId: 'op-maya-001',
        operatorName: 'Maya Sharma',
        workItemId: 'work-001',
        supervisorId: 'sup-john-001',
        status: 'pending',
        reason: 'I have experience with this operation',
        requestedAt: admin.firestore.Timestamp.now(),
        createdAt: admin.firestore.Timestamp.now()
      }
    ];

    console.log('📊 Creating operators...');
    for (const operator of operators) {
      await db.collection('operators').doc(operator.id).set(operator);
    }

    console.log('👥 Creating supervisors...');
    for (const supervisor of supervisors) {
      await db.collection('supervisors').doc(supervisor.id).set(supervisor);
    }

    console.log('🔨 Creating work items...');
    for (const workItem of workItems) {
      await db.collection('workItems').doc(workItem.id).set(workItem);
    }

    console.log('💰 Creating wallets...');
    for (const wallet of wallets) {
      await db.collection('wallets').doc(wallet.operatorId).set(wallet);
    }

    console.log('📝 Creating assignment requests...');
    for (const request of assignmentRequests) {
      await db.collection('assignmentRequests').doc(request.id).set(request);
    }

    // Operator status collection
    console.log('⚡ Creating real-time status...');
    await db.collection('operatorStatus').doc('op-maya-001').set({
      operatorId: 'op-maya-001',
      status: 'working',
      currentWorkItems: 1,
      lastUpdated: admin.firestore.Timestamp.now()
    });

    await db.collection('operatorStatus').doc('op-ram-002').set({
      operatorId: 'op-ram-002',
      status: 'break',
      currentWorkItems: 0,
      lastUpdated: admin.firestore.Timestamp.now()
    });

    console.log('✅ Sample data setup complete!');
    console.log('\n🎉 Ready to use:');
    console.log('   Operator: operator / password');
    console.log('   Supervisor: sup / sup');
    console.log('   Manager: manager / password');
    console.log('\n🌐 Access at: http://localhost:3000');

  } catch (error) {
    console.error('❌ Error setting up data:', error);
    throw error;
  }
}

// Run setup
setupSimpleData()
  .then(() => {
    console.log('🏁 Setup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  });