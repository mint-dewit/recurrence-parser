import { DateObj } from './util'
import { ScheduleElement } from './interface'

export function getFirstExecution (object: ScheduleElement, now: DateObj): number {
	if (isNaN(now.valueOf())) throw new Error('Parameter now is an invalid date')
	let firstDay
	let firstDateRange: Array<DateObj>
	let firstTime
	let outOfRange = false

	let start = now

	let getNextDateRange = () => {
		console.log('getNextDaterange', start)
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
			outOfRange = true // @todo: this breaks
		}
	}
	let getNextWeek = () => {
		for (let week of object.weeks!) {
			if (week > start.getWeek()) {
				start = new DateObj().setWeek(week)
			}
		}
		if (firstDateRange) {
			while (start > firstDateRange[1]) {
				getNextDateRange()
				if (outOfRange) return
				getNextWeek()
			}
		}
	}
	let getNextDay = () => {
		for (let day of object.days!) {
			if (day === start.getDay()) { // first day
				firstDay = start.setWeek(start.getWeek()) // set to beginning of the week
				firstDay.setMilliseconds(day * 86400000) // set to start of day
				break
			} else if (day > start.getDay()) { // first day
				firstDay = start.setWeek(start.getWeek()) // set to beginning of the week
				firstDay.setMilliseconds(day * 86400000) // set to start of day
				start = firstDay
				break
			}
		}
		if (firstDateRange) {
			while (start > firstDateRange[1]) { // current start is past daterange
				getNextDateRange()
				if (outOfRange) return
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
		if (outOfRange) return Number.MAX_SAFE_INTEGER
		// what to do when all is in the past?
		console.log(`Parsed date ranges for ${object.path || object._id || 'unkown'}, start is at ${start.toLocaleString()}`)
	}

	if (object.weeks && object.weeks.length > 0) {
		object.weeks.sort()
		object.weeks = object.weeks.filter(w => w >= 0 && w <= 53)
		getNextWeek()
		console.log(`Parsed weeks for ${object.path || object._id || 'unkown'}, start is at ${start.toLocaleString()}`)
	}

	if (object.days && object.days.length > 0 && object.days.length !== 7) {
		object.days.sort()
		object.days = object.days.filter(d => d >= 0 && d <= 6)
		getNextDay()
		if (!new Set(object.days).has(start.getDay())) {
			start.setWeek(start.getWeek() + 1)
			return getFirstExecution(object, start)
		}
		console.log(`Parsed days for ${object.path || object._id || 'unkown'}, start is at ${start.toLocaleString()}`)
	}

	if (object.times && object.times.length > 0) {
		object.times.sort()
		for (let time of object.times) {
			let date = timeToDate(time, start)
			console.log(`Parsed time is at ${date.toLocaleString()}, start is at ${start.toLocaleString()}`)
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
		console.log(`Parsed times for ${object.path || object._id || 'unkown'}, start is at ${start.toLocaleString()}`)
	}

	if (outOfRange) return Number.MAX_SAFE_INTEGER
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
