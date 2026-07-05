module.exports = {
    testEnvironment: 'node',
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'controllers/**/*.js',
        'middleware/**/*.js',
        'utils/**/*.js',
        '!**/__tests__/**'
    ],
    testMatch: ['**/__tests__/**/*.test.js'],
    testTimeout: 10000
};
