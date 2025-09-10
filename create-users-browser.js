// Browser Console Script to Create Users
// Copy and paste this entire script into your browser console at http://localhost:4173/

(async function createUsers() {
  console.log('👤 Creating durga and ram operator users...');
  
  try {
    // Import Firebase modules
    const { doc, setDoc, Timestamp } = await import('firebase/firestore');
    const { db, COLLECTIONS } = await import('./src/config/firebase');
    
    // Create durga operator user
    const durgaUser = {
      username: 'durga',
      name: 'Durga',
      employeeId: `TSA-EMP-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
      email: '',
      phone: '',
      role: 'operator',
      department: 'sewing',
      machineType: 'single_needle',
      skills: ['basic_sewing', 'shoulder_join'],
      permissions: ['work_assignment', 'quality_report'],
      active: true,
      passwordHash: btoa('password'), // Base64 encoded "password"
      createdAt: Timestamp.now(),
      lastLogin: null,
      operatorLevel: 'intermediate',
      hourlyRate: 150,
      efficiencyRating: 85
    };
    
    // Create ram operator user  
    const ramUser = {
      username: 'ram',
      name: 'Ram',
      employeeId: `TSA-EMP-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
      email: '',
      phone: '',
      role: 'operator',
      department: 'sewing',
      machineType: 'overlock',
      skills: ['basic_sewing', 'overlock_sewing'],
      permissions: ['work_assignment', 'quality_report'],
      active: true,
      passwordHash: btoa('password'), // Base64 encoded "password"
      createdAt: Timestamp.now(),
      lastLogin: null,
      operatorLevel: 'beginner',
      hourlyRate: 120,
      efficiencyRating: 75
    };
    
    // Add durga user
    await setDoc(doc(db, COLLECTIONS.OPERATORS, 'durga'), durgaUser);
    console.log('✅ Created user: durga');
    console.log('   Username: durga');
    console.log('   Password: password');
    console.log('   Role: operator');
    
    // Add ram user
    await setDoc(doc(db, COLLECTIONS.OPERATORS, 'ram'), ramUser);
    console.log('✅ Created user: ram');
    console.log('   Username: ram');
    console.log('   Password: password');
    console.log('   Role: operator');
    
    console.log('🎉 Both users created successfully!');
    console.log('📝 You can now login with:');
    console.log('   Username: durga, Password: password');
    console.log('   Username: ram, Password: password');
    
  } catch (error) {
    console.error('❌ Failed to create users:', error);
  }
})();