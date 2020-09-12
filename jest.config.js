module.exports = {
	globals: {
		'ts-jest': {
			tsConfigFile: 'tsconfig.jest.json'
		}
	},
	moduleFileExtensions: [
		'ts',
		'js'
	],
	transform: {
		'^.+\\.(ts|tsx)$': './node_modules/ts-jest/preprocessor.js'
	},
	testMatch: [
		'**/__tests__/**/*.spec.(ts|js)'
	],
	testEnvironment: 'node',
	coverageDirectory: "./coverage/",
	collectCoverage: true
}
