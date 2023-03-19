import { getFirstExecution } from '../resolver'
import { DateObj } from '../util'
import { ScheduleElement, ScheduleType } from '../interface'

test('getFirstExecution - time today', () => {
	const now = new DateObj('2020-08-18 15:00:00')
	const element: ScheduleElement = {
		type: ScheduleType.File,
		times: ['18:00:00'],
		path: '',
	}

	const firstExec = getFirstExecution(element, now)

	expect(firstExec).toBe(new Date('2020-08-18 18:00:00').getTime())
})
test('getFirstExecution - time tomorrow', () => {
	const now = new DateObj('2020-08-18 15:00:00')
	const element: ScheduleElement = {
		type: ScheduleType.File,
		times: ['09:00:00'],
		path: '',
	}

	const firstExec = getFirstExecution(element, now)

	expect(firstExec).toBe(new Date('2020-08-19 09:00:00').getTime())
})

describe('getFirstExeuction - weekdays', () => {
	test('sunday', () => {
		const now = new DateObj('2020-08-18 15:00:00')
		const element: ScheduleElement = {
			type: ScheduleType.File,
			times: ['18:00:00'],
			days: [0],
			path: '',
		}

		const firstExec = getFirstExecution(element, now)

		expect(firstExec).toBe(new Date('2020-08-23 18:00:00').getTime())
	})
	test('monday', () => {
		const now = new DateObj('2020-08-18 15:00:00')
		const element: ScheduleElement = {
			type: ScheduleType.File,
			times: ['18:00:00'],
			days: [1],
			path: '',
		}

		const firstExec = getFirstExecution(element, now)

		expect(firstExec).toBe(new Date('2020-08-24 18:00:00').getTime())
	})
	test('tuesday', () => {
		const now = new DateObj('2020-08-18 15:00:00')
		const element: ScheduleElement = {
			type: ScheduleType.File,
			times: ['18:00:00'],
			days: [2],
			path: '',
		}

		const firstExec = getFirstExecution(element, now)

		expect(firstExec).toBe(new Date('2020-08-18 18:00:00').getTime())
	})
	test('wednesday', () => {
		const now = new DateObj('2020-08-18 15:00:00')
		const element: ScheduleElement = {
			type: ScheduleType.File,
			times: ['18:00:00'],
			days: [3],
			path: '',
		}

		const firstExec = getFirstExecution(element, now)

		expect(firstExec).toBe(new Date('2020-08-19 18:00:00').getTime())
	})
	test('thursday', () => {
		const now = new DateObj('2020-08-18 15:00:00')
		const element: ScheduleElement = {
			type: ScheduleType.File,
			times: ['18:00:00'],
			days: [4],
			path: '',
		}

		const firstExec = getFirstExecution(element, now)

		expect(firstExec).toBe(new Date('2020-08-20 18:00:00').getTime())
	})
	test('friday', () => {
		const now = new DateObj('2020-08-18 15:00:00')
		const element: ScheduleElement = {
			type: ScheduleType.File,
			times: ['18:00:00'],
			days: [5],
			path: '',
		}

		const firstExec = getFirstExecution(element, now)

		expect(firstExec).toBe(new Date('2020-08-21 18:00:00').getTime())
	})
	test('saturday', () => {
		const now = new DateObj('2020-08-18 15:00:00')
		const element: ScheduleElement = {
			type: ScheduleType.File,
			times: ['18:00:00'],
			days: [6],
			path: '',
		}

		const firstExec = getFirstExecution(element, now)

		expect(firstExec).toBe(new Date('2020-08-22 18:00:00').getTime())
	})

	test('sunday + monday', () => {
		let now = new DateObj('2020-08-18 15:00:00') // wednesday
		const element: ScheduleElement = {
			type: ScheduleType.File,
			times: ['18:00:00'],
			days: [0, 1],
			path: '',
		}

		let firstExec = getFirstExecution(element, now)
		expect(firstExec).toBe(new Date('2020-08-23 18:00:00').getTime()) // sunday

		now = new DateObj('2020-08-24 15:00:00')
		firstExec = getFirstExecution(element, now)
		expect(firstExec).toBe(new Date('2020-08-24 18:00:00').getTime()) // monday
	})
	test('sunday + wednesday', () => {
		let now = new DateObj('2020-08-18 15:00:00')
		const element: ScheduleElement = {
			type: ScheduleType.File,
			times: ['18:00:00'],
			days: [0, 3],
			path: '',
		}

		let firstExec = getFirstExecution(element, now)
		expect(firstExec).toBe(new Date('2020-08-19 18:00:00').getTime())

		now = new DateObj('2020-08-20 15:00:00')
		firstExec = getFirstExecution(element, now)
		expect(firstExec).toBe(new Date('2020-08-23 18:00:00').getTime())
	})
	test('tuesday + saturday', () => {
		let now = new DateObj('2020-08-18 15:00:00')
		const element: ScheduleElement = {
			type: ScheduleType.File,
			times: ['18:00:00'],
			days: [2, 6],
			path: '',
		}

		let firstExec = getFirstExecution(element, now)
		expect(firstExec).toBe(new Date('2020-08-18 18:00:00').getTime())

		now = new DateObj('2020-08-21 15:00:00')
		firstExec = getFirstExecution(element, now)
		expect(firstExec).toBe(new Date('2020-08-22 18:00:00').getTime())
	})
})
test('getFirstExecution - days = today', () => {
	const now = new DateObj('2020-08-18 15:00:00')
	const element: ScheduleElement = {
		type: ScheduleType.File,
		times: ['18:00:00'],
		days: [2], // today
		path: '',
	}

	const firstExec = getFirstExecution(element, now)

	expect(firstExec).toBe(new Date('2020-08-18 18:00:00').getTime())
})
test('getFirstExecution - day next week', () => {
	const now = new DateObj('2020-08-18 15:00:00')
	const element: ScheduleElement = {
		type: ScheduleType.File,
		times: ['18:00:00'],
		days: [1],
		path: '',
	}

	const firstExec = getFirstExecution(element, now)

	expect(firstExec).toBe(new Date('2020-08-24 18:00:00').getTime())
})

test('getFirstExecution - week', () => {
	const now = new DateObj('2020-08-18 15:00:00')
	const element: ScheduleElement = {
		type: ScheduleType.File,
		times: ['18:00:00'],
		weeks: [34],
		path: '',
	}

	const firstExec = getFirstExecution(element, now)

	expect(firstExec).toBe(new Date('2020-08-18 18:00:00').getTime())
})
test('getFirstExecution - next week', () => {
	const now = new DateObj('2020-08-18 15:00:00')
	const element: ScheduleElement = {
		type: ScheduleType.File,
		times: ['18:00:00'],
		weeks: [35],
		path: '',
	}

	const firstExec = getFirstExecution(element, now)

	expect(firstExec).toBe(new Date('2020-08-24 18:00:00').getTime())
})
test('getFirstExecution - last week', () => {
	const now = new DateObj('2020-08-18 15:00:00')
	const element: ScheduleElement = {
		type: ScheduleType.File,
		times: ['18:00:00'],
		weeks: [33],
		path: '',
	}

	const firstExec = getFirstExecution(element, now)

	expect(firstExec).toBe(new Date('2021-08-16 18:00:00').getTime())
})

test('getFirstExecution - dates', () => {
	const now = new DateObj('2020-08-18 15:00:00')
	const element: ScheduleElement = {
		type: ScheduleType.File,
		times: ['18:00:00'],
		dates: [['2020-08-17', '2020-08-21']],
		path: '',
	}

	const firstExec = getFirstExecution(element, now)

	expect(firstExec).toBe(new Date('2020-08-18 18:00:00').getTime())
})
test('getFirstExecution - next daterange', () => {
	const now = new DateObj('2020-08-18 15:00:00')
	const element: ScheduleElement = {
		type: ScheduleType.File,
		times: ['18:00:00'],
		dates: [['2020-08-21', '2020-08-25']],
		path: '',
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
		dates: [['2020-08-25', '2020-08-25']],
		path: '',
	}

	const firstExec = getFirstExecution(element, now)

	expect(firstExec).toBe(new Date('2020-08-25 18:00:00').getTime())
})
test('getFirstExecution - weeks + daterange (2)', () => {
	const now = new DateObj('2020-08-18 15:00:00')
	const element: ScheduleElement = {
		type: ScheduleType.File,
		times: ['18:00:00'],
		weeks: [35],
		dates: [
			['2020-08-19', '2020-08-19'],
			['2020-08-25', '2020-08-25'],
		],
		path: '',
	}

	const firstExec = getFirstExecution(element, now)

	expect(firstExec).toBe(new Date('2020-08-25 18:00:00').getTime())
})
test('getFirstExecution - days + daterange', () => {
	const now = new DateObj('2020-08-18 15:00:00')
	const element: ScheduleElement = {
		type: ScheduleType.File,
		times: ['18:00:00'],
		dates: [['2020-08-23', '2020-08-31']],
		days: [2],
		path: '',
	}

	const firstExec = getFirstExecution(element, now)

	expect(firstExec).toBe(new Date('2020-08-25 18:00:00').getTime())
})
test('getFirstExecution - days + daterange (2)', () => {
	const now = new DateObj('2020-08-18 15:00:00')
	const element: ScheduleElement = {
		type: ScheduleType.File,
		times: ['18:00:00'],
		dates: [['2020-09-20', '2020-10-04']],
		days: [2],
		path: '',
	}

	const firstExec = getFirstExecution(element, now)

	expect(firstExec).toBe(new Date('2020-09-22 18:00:00').getTime())
})
test('getFirstExecution - days + weeks', () => {
	const now = new DateObj('2020-08-18 15:00:00')
	const element: ScheduleElement = {
		type: ScheduleType.File,
		times: ['18:00:00'],
		weeks: [35], // next week
		days: [2],
		path: '',
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
			['2020-08-28', '2020-08-28'], // friday
		],
		path: '',
	}

	const firstExec = getFirstExecution(element, now)

	expect(firstExec).toBe(new Date('2020-08-28 18:00:00').getTime())
})

test('getFirstExecution - next day, within 24hrs', () => {
	const now = new DateObj('2020-08-20 15:01:00') // thursday 15:01
	const element: ScheduleElement = {
		type: ScheduleType.File,
		times: ['13:00:00'],
		days: [5], // friday
		path: '',
	}

	const firstExec = getFirstExecution(element, now)

	expect(firstExec).toBe(new Date('2020-08-21 13:00:00').getTime())
})
