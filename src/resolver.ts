import { DateObj } from './util'
import { ScheduleElementTimings } from './interface'

export function getFirstExecution(object: ScheduleElementTimings, now: DateObj): number {
	if (isNaN(now.valueOf())) throw new Error('Parameter now is an invalid date')
	let firstDateRange: Array<DateObj>
	let firstTime

	let start = now

	const getNextDateRange = () => {
		if (!object.dates) return
		let hasFound = false
		for (const dates of object.dates) {
			const begin = new DateObj(dates[0])
			const end = new DateObj(dates[1])
			if (begin <= start && end >= start) {
				firstDateRange = [new DateObj(start), end]
				hasFound = true
				break
			} else if (begin >= start) {
				firstDateRange = [begin, end]
				start = firstDateRange[0]
				hasFound = true
				break
			}
		}
		if (!hasFound) {
			// we've recursed through everything and no date was found:
			// console.log(`WARNING: No execution time was found for ${object.path || object._id || 'unkown'}!`)
			throw new Error('Out of range')
		}
	}
	const getNextWeek = () => {
		if (!object.weeks) return
		const firstWeek = object.weeks.find((w) => w >= start.getWeek())
		if (firstWeek && firstWeek > start.getWeek()) {
			start = new DateObj(start).setWeek(firstWeek)
		} else if (!firstWeek) {
			const year = start.getFullYear()
			start = new DateObj()
			start.setFullYear(year + 1, 0, 1)
			start.setWeek(object.weeks[0])
		}
		if (firstDateRange) {
			while (start > firstDateRange[1]) {
				getNextDateRange()
				getNextWeek()
			}
		}
	}
	const getNextDay = () => {
		if (!object.days) return
		for (let iday = 0; iday < 7; iday++) {
			const day = (iday + start.getDay()) % 7
			if (!object.days.includes(day)) continue

			if (day === start.getDay()) {
				// first day
				break
			} else if (day > start.getDay()) {
				// first day
				const firstDay = new DateObj(start.getTime()).setWeek(start.getWeek()) // set to beginning of the week
				firstDay.setMilliseconds((day - 1) * 86400000) // set to start of day
				start = firstDay
				break
			} else if (day === 0 && 7 > start.getDay()) {
				// weeks treat monday as the first day
				const firstDay = new DateObj(start.getTime()).setWeek(start.getWeek()) // set to beginning of the week
				firstDay.setMilliseconds(6 * 86400000) // set to start of sunday
				start = firstDay
				break
			}
		}
		if (firstDateRange) {
			while (start > firstDateRange[1]) {
				// current start is past daterange
				getNextDateRange()
				if (object.weeks) {
					getNextWeek()
				}
				getNextDay()
			}
		}
	}

	if (object.dates && object.dates.length > 0) {
		object.dates.sort()
		object.dates = object.dates.filter((dates) => dates[0] <= dates[1])
		getNextDateRange()
		// what to do when all is in the past?
		// console.log(`Parsed date ranges for ${object.path || object._id || 'unkown'}, start is at ${start.toLocaleString()}`)
	}

	if (object.weeks && object.weeks.length > 0) {
		object.weeks.sort()
		object.weeks = object.weeks.filter((w) => w >= 0 && w <= 53)
		getNextWeek()
		// console.log(`Parsed weeks for ${object.path || object._id || 'unkown'}, start is at ${start.toLocaleString()}`)
	}

	if (object.days && object.days.length > 0 && object.days.length !== 7) {
		// assert sorted array with sunday last
		object.days.sort()
		// console.log(object.days)
		object.days = object.days.filter((d) => d >= 0 && d <= 6)
		getNextDay()
		if (!new Set(object.days).has(start.getDay())) {
			start.setWeek(start.getWeek() + 1)
			return getFirstExecution(object, start)
		}
		// console.log(`Parsed days for ${object.path || object._id || 'unkown'}, start is at ${start.toLocaleString()}`)
	}

	if (object.times && object.times.length > 0) {
		object.times.sort()
		for (const time of object.times) {
			const date = timeToDate(time, start)
			// console.log(`Parsed time is at ${date.toLocaleString()}, start is at ${start.toLocaleString()}`)
			if (date >= start) {
				start = date
				firstTime = time
				break
			}
		}
		if (typeof firstTime === 'undefined') {
			// pass midnight
			start.setHours(0, 0, 0, 0)
			start.setMilliseconds(86400000)
			return getFirstExecution(object, start)
		}
		// console.log(`Parsed times for ${object.path || object._id || 'unkown'}, start is at ${start.toLocaleString()}`)
	}

	return start.getTime()
}

export function timeToDate(time: string, date: Date): DateObj {
	const timeParts = time.split(':')
	const dateObj = new DateObj(date)
	dateObj.setHours(Number(timeParts[0]))
	dateObj.setMinutes(Number(timeParts[1]))
	dateObj.setSeconds(Number(timeParts[2]))
	dateObj.setMilliseconds(0)
	return dateObj
}
