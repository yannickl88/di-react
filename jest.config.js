module.exports = {
    preset: "ts-jest",
    testEnvironment: 'jest-environment-jsdom',
    setupFilesAfterEnv: ['<rootDir>/setup-jest.ts']
}
