const express = require('express');
const authRoutes = require('./routes/auth.routes');
const app = express();

app.use(express.json());

// Debug logging for routes
console.log('Auth Routes:', authRoutes);

try {
    const caseRoutes = require('./routes/case.routes');
    console.log('Case Routes:', caseRoutes);
    app.use('/case', caseRoutes);
} catch (error) {
    console.warn('Case Routes not found:', error.message);
}

app.use('/auth', authRoutes);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
