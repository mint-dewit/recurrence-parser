import { DateObj } from '../util'

describe('DateObj', () => {
	test('getWeek', () => {
		let d = new DateObj('2019-12-31 00:00:00')
		expect(d.getWeek()).toEqual(1)

		d = new DateObj('2020-01-01 00:00:00')
		expect(d.getWeek()).toEqual(1)

		d = new DateObj('2020-08-31 00:00:00')
		expect(d.getWeek()).toEqual(36)

		d = new DateObj('2020-10-13 00:00:00')
		expect(d.getWeek()).toEqual(42)
		
		d = new DateObj('2020-11-30 00:00:00')
		expect(d.getWeek()).toEqual(49)

		d = new DateObj('2020-12-08 00:00:00')
		expect(d.getWeek()).toEqual(50)

		d = new DateObj('2020-12-15 00:00:00')
		expect(d.getWeek()).toEqual(51)

		d = new DateObj('2020-12-24 00:00:00')
		expect(d.getWeek()).toEqual(52)

		d = new DateObj('2020-12-31 00:00:00')
		expect(d.getWeek()).toEqual(53)

		d = new DateObj('2021-01-01 00:00:00')
		expect(d.getWeek()).toEqual(53)

		d = new DateObj('2021-01-03 00:00:00')
		expect(d.getWeek()).toEqual(1)
	})

	test('setWeek', () => {
		let d = new DateObj()
		d.setWeek(1)
		console.log(d)
		expect(d.getWeek()).toEqual(1)

		d.setWeek(25)
		expect(d.getWeek()).toEqual(25)

		d.setWeek(53)
		expect(d.getWeek()).toEqual(53)
	})

	test('next year', () => {
		let d = new DateObj('2020-08-31')
		d.setFullYear(d.getFullYear() + 1, 0, 1)
		d.setHours(0, 0, 0, 0)
		console.log(d, d.getWeek())
		expect(d.getWeek()).toEqual(53)

		d.setWeek(35)
		console.log(d, d.getWeek())
		expect(d.getWeek()).toEqual(35)
	})
})