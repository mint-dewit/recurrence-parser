import { getFirstExecution } from '../resolver'
import { DateObj } from '../util'
import { ScheduleElement, ScheduleType } from '../interface'

test('getFirstExecution - time today', () => {
	const now = new DateObj('2020-08-18 15:00:00')
	const element: ScheduleElement = {
		type: ScheduleType.File,
		times: ['18:00:00']
	}

	const firstExec = getFirstExecution(element, now)

	expect(firstExec).toBe(new Date('2020-08-18 18:00:00').getTime())
})
test('getFirstExecution - time tomorrow', () => {
	const now = new DateObj('2020-08-18 15:00:00')
	const element: ScheduleElement = {
		type: ScheduleType.File,
		times: ['09:00:00']
	}

	const firstExec = getFirstExecution(element, now)

	expect(firstExec).toBe(new Date('2020-08-19 09:00:00').getTime())
})

test('getFirstExecution - day', () => {
	const now = new DateObj('2020-08-18 15:00:00')
	const element: ScheduleElement = {
		type: ScheduleType.File,
		times: ['18:00:00'],
		days: [3]
	}

	const firstExec = getFirstExecution(element, now)

	expect(firstExec).toBe(new Date('2020-08-19 18:00:00').getTime())
})
test('getFirstExecution - days = today', () => {
	const now = new DateObj('2020-08-18 15:00:00')
	const element: ScheduleElement = {
		type: ScheduleType.File,
		times: ['18:00:00'],
		days: [2] // today
	}

	const firstExec = getFirstExecution(element, now)

	expect(firstExec).toBe(new Date('2020-08-18 18:00:00').getTime())
})
test('getFirstExecution - day next week', () => {
	const now = new DateObj('2020-08-18 15:00:00')
	const element: ScheduleElement = {
		type: ScheduleType.File,
		times: ['18:00:00'],
		days: [1]
	}

	const firstExec = getFirstExecution(element, now)

	expect(firstExec).toBe(new Date('2020-08-24 18:00:00').getTime())
})

test('getFirstExecution - week', () => {
	const now = new DateObj('2020-08-18 15:00:00')
	const element: ScheduleElement = {
		type: ScheduleType.File,
		times: ['18:00:00'],
		weeks: [34]
	}

	const firstExec = getFirstExecution(element, now)

	expect(firstExec).toBe(new Date('2020-08-18 18:00:00').getTime())
})
test('getFirstExecution - next week', () => {
	const now = new DateObj('2020-08-18 15:00:00')
	const element: ScheduleElement = {
		type: ScheduleType.File,
		times: ['18:00:00'],
		weeks: [35]
	}

	const firstExec = getFirstExecution(element, now)

	expect(firstExec).toBe(new Date('2020-08-23 18:00:00').getTime())
})

test('getFirstExecution - dates', () => {
	const now = new DateObj('2020-08-18 15:00:00')
	const element: ScheduleElement = {
		type: ScheduleType.File,
		times: ['18:00:00'],
		dates: [
			['2020-08-17', '2020-08-21']
		]
	}

	const firstExec = getFirstExecution(element, now)

	expect(firstExec).toBe(new Date('2020-08-18 18:00:00').getTime())
})
test('getFirstExecution - next daterange', () => {
	const now = new DateObj('2020-08-18 15:00:00')
	const element: ScheduleElement = {
		type: ScheduleType.File,
		times: ['18:00:00'],
		dates: [
			['2020-08-21', '2020-08-25']
		]
	}

	const firstExec = getFirstExecution(element, now)

	expect(firstExec).toBe(new Date('2020-08-21 18:00:00').getTime())
})

test('getFirstExecution - weeks + daterange', () => {
	const now = new DateObj('2020-08-18 15:00:00')
	const element: ScheduleElement = {
		type: ScheduleType.File,
		times: ['18:00:00'],
		weeks: [34, 35],
		dates: [
			['2020-08-25', '2020-08-25']
		]
	}

	const firstExec = getFirstExecution(element, now)

	expect(firstExec).toBe(new Date('2020-08-25 18:00:00').getTime())
})
test('getFirstExecution - weeks + daterange', () => {
	const now = new DateObj('2020-08-18 15:00:00')
	const element: ScheduleElement = {
		type: ScheduleType.File,
		times: ['18:00:00'],
		weeks: [35],
		dates: [
			['2020-08-19', '2020-08-19'],
			['2020-08-25', '2020-08-25']
		]
	}

	const firstExec = getFirstExecution(element, now)

	expect(firstExec).toBe(new Date('2020-08-25 18:00:00').getTime())
})
test('getFirstExecution - days + weeks', () => {
	const now = new DateObj('2020-08-18 15:00:00')
	const element: ScheduleElement = {
		type: ScheduleType.File,
		times: ['18:00:00'],
		weeks: [35], // next week
		days: [2]
	}

	const firstExec = getFirstExecution(element, now)

	expect(firstExec).toBe(new Date('2020-08-25 18:00:00').getTime())
})
test('getFirstExecution - days + weeks + dates', () => {
	const now = new DateObj('2020-08-18 15:00:00')
	const element: ScheduleElement = {
		type: ScheduleType.File,
		times: ['18:00:00'],
		weeks: [35], // next week
		days: [2, 5], // tuesday + friday
		dates: [
			['2020-08-26', '2020-08-26'], // thursday
			['2020-08-28', '2020-08-28'] // friday
		]
	}

	const firstExec = getFirstExecution(element, now)

	expect(firstExec).toBe(new Date('2020-08-28 18:00:00').getTime())
})