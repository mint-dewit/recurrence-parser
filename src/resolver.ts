import { DateObj } from './util'
import { ScheduleElement } from './interface'

export function getFirstExecution (object: ScheduleElement, now: DateObj): number {
	if (isNaN(now.valueOf())) throw new Error('Parameter now is an invalid date')
	// console.log('getFirstExecution', now)
	let firstDateRange: Array<DateObj>
	let firstTime

	let start = now

	let getNextDateRange = () => {
		let hasFound = false
		for (let dates of object.dates!) {
			const begin = new DateObj(dates[0])
			const end = new DateObj(dates[1])
			if (begin <= start && end >= start) {
				firstDateRange = [ new DateObj(start), end ]
				hasFound = true
				break
			} else if (begin >= start) {
				firstDateRange = [ begin, end ]
				start = firstDateRange[0]
				hasFound = true
				break
			}
		}
		if (!hasFound) { // we've recursed through everything and no date was found:
			console.log(`WARNING: No execution time was found for ${object.path || object._id || 'unkown'}!`)
			throw new Error('Out of range')
		}
	}
	let getNextWeek = () => {
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
	let getNextDay = () => {
		if (!object.days) return
		console.log('parse days', object.days, start.getDay())
		for (let iday = 0; iday < 7; iday++) {
			// iterate over every day in the coming 7 days (incl today)
			const day = (iday + start.getDay()) % 7
			if (!object.days.includes(day)) continue

			if (iday === 0) {
				// today is allowed
				break
			} else {
				// the next allowed day is "iday" days in the future
				const firstDay = new DateObj(start.getTime() + iday * 86400000)
				firstDay.setHours(0, 0, 0, 0)
				start = firstDay
				break
			}
		}
		if (firstDateRange) {
			while (start > firstDateRange[1]) { // current start is past daterange
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
		object.dates = object.dates.filter(dates => dates[0] <= dates[1])
		getNextDateRange()
		// what to do when all is in the past?
		// console.log(`Parsed date ranges for ${object.path || object._id || 'unkown'}, start is at ${start.toLocaleString()}`)
	}

	if (object.weeks && object.weeks.length > 0) {
		object.weeks.sort()
		object.weeks = object.weeks.filter(w => w >= 0 && w <= 53)
		getNextWeek()
		// console.log(`Parsed weeks for ${object.path || object._id || 'unkown'}, start is at ${start.toLocaleString()}`)
	}

	if (object.days && object.days.length > 0 && object.days.length !== 7) {
		// assert sorted array with sunday last
		object.days.sort((a, b) => {
			if (a === 0) {
				return 1
			} else if (b === 0) {
				return -1
			}
			return a - b
		})
		object.days = object.days.filter(d => d >= 0 && d <= 6)
		getNextDay()
		if (!new Set(object.days).has(start.getDay())) {
			start.setWeek(start.getWeek() + 1)
			return getFirstExecution(object, start)
		}
		// console.log(`Parsed days for ${object.path || object._id || 'unkown'}, start is at ${start.toLocaleString()}`)
	}

	if (object.times && object.times.length > 0) {
		object.times.sort()
		for (let time of object.times) {
			let date = timeToDate(time, start)
			// console.log(`Parsed time is at ${date.toLocaleString()}, start is at ${start.toLocaleString()}`)
			if (date >= start) {
				start = date
				firstTime = time
				break
			}
		}
		if (typeof firstTime === 'undefined') { // pass midnight
			start.setHours(0, 0, 0, 0)
			start.setMilliseconds(86400000)
			return getFirstExecution(object, start)
		}
		// console.log(`Parsed times for ${object.path || object._id || 'unkown'}, start is at ${start.toLocaleString()}`)
	}

	return start.getTime()
}

export function timeToDate (time: string, date: Date): DateObj {
	let timeParts = time.split(':')
	let dateObj = new DateObj(date)
	dateObj.setHours(Number(timeParts[0]))
	dateObj.setMinutes(Number(timeParts[1]))
	dateObj.setSeconds(Number(timeParts[2]))
	dateObj.setMilliseconds(0)
	return dateObj
}
