const express = require('express');
const path = require('path');

const app = express();
const port = 8080;

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle client-side routing - serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`🚀 TSA ERP Production Server running at:`);
  console.log(`   Local:   http://localhost:${port}`);
  console.log(`   Network: http://192.168.1.68:${port}`);
  console.log('');
  console.log('📊 Production build with Firebase data integration');
  console.log('🔗 Open the URL above to test the complete application');
});