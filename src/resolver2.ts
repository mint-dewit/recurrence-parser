import { DateTime, Duration, Interval, WeekdayNumbers } from 'luxon'
import { ScheduleElementTimings } from './interface.js'

const DEBUG_TEST = false
const DAY_START = {
	hour: 0,
	minute: 0,
	second: 0,
	millisecond: 0,
}

export function getFirstExecution(
	object: ScheduleElementTimings,
	now: DateTime,
): { execution: number } | { error: string } {
	const ranges = object.dates
		? parseDateRanges(object.dates)
		: [Interval.after(now, Duration.fromObject({ years: 10 }))]

	if (DEBUG_TEST) {
		console.log('getFirstExecution', now, ranges)
	}

	let execution = now
	for (const range of ranges) {
		if (!range.isValid) {
			continue
		}

		if (range.end.valueOf() < execution.valueOf()) {
			continue
		}

		if (range.start.valueOf() > execution.valueOf()) {
			execution = range.start
		}

		execution = getValidExecutionFromWeeks(
			execution,
			object.weeks,
			object.days?.map((d) => (d === 0 ? 7 : d)), // map (0-6 with sunday as day 0) to (1-7 with monday = 1)
			object.times,
		)

		if (range.end.valueOf() > execution.valueOf()) {
			return { execution: execution.valueOf() }
		}
	}

	return { error: 'Failed to find execution' }
}

/**
 * From an array of [start, end] string tuples this function parses luxon intervals, taking into account any overlaps
 *
 * @param {[string, string][]} ranges Input
 * @returns {Interval<true>[]} Valid date ranges
 */
function parseDateRanges(ranges: [string, string][]): Interval<true>[] {
	const intervals = ranges
		.map(([start, stop]) =>
			Interval.fromDateTimes(
				DateTime.fromJSDate(new Date(start)),
				DateTime.fromJSDate(new Date(stop)).plus({ days: 1 }),
			),
		)
		.filter((r): r is Interval<true> => r.isValid)
		.sort((a, b) => a.start.valueOf() - b.start.valueOf())

	if (intervals.length === 0) {
		return []
	}

	const merged: Interval<true>[] = [intervals[0]]

	for (let i = 1; i < intervals.length; i++) {
		const current = merged[merged.length - 1]
		const next = intervals[i]

		if (next.start.valueOf() < current.end.valueOf()) {
			if (next.end.valueOf() > current.end.valueOf()) {
				merged[merged.length - 1] = Interval.fromDateTimes(current.start, next.end) as Interval<true>
			}
			// else: next is fully contained within current, omit it
		} else {
			merged.push(next)
		}
	}

	return merged.filter((r): r is Interval<true> => r.isValid)
}

function getValidExecutionFromWeeks(
	now: DateTime,
	weeks: number[] | undefined,
	days: number[] | undefined,
	times: string[] | undefined,
): DateTime {
	if (DEBUG_TEST) {
		console.log('getValidExecutionFromWeeks', now)
	}

	if (!weeks) {
		return getValidExecutionFromDays(now, days, times)
	}

	const validWeeks = weeks.filter((w) => w >= 0 && w <= 53).sort()
	const currentWeek = now.weekNumber
	const currentYear = now.weekYear

	const orderedWeeks = [
		...validWeeks
			.filter((w) => w >= currentWeek)
			.map((w) => now.set({ weekYear: currentYear, weekNumber: w, weekday: 1, ...DAY_START })),
		...validWeeks
			.filter((w) => w < currentWeek)
			.map((w) => now.set({ weekYear: currentYear + 1, weekNumber: w, weekday: 1, ...DAY_START })),
	]

	let execution = now
	for (const weekStart of orderedWeeks) {
		if (execution.valueOf() < weekStart.valueOf()) {
			execution = weekStart
		}

		execution = getValidExecutionFromDays(execution, days, times)

		const weekEnd = weekStart.plus(Duration.fromObject({ weeks: 1 }))
		if (execution.valueOf() < weekEnd.valueOf()) {
			return execution
		}
	}

	throw new Error('getValidExecutionFromWeeks - Failed to find valid execution')
}

function getValidExecutionFromDays(now: DateTime, days: number[] | undefined, times: string[] | undefined): DateTime {
	if (DEBUG_TEST) {
		console.log('getValidExecutionFromDays', now)
	}

	if (!days) {
		return getValidExecutionFromTimes(now, times)
	}

	const validDays = days.filter((w): w is WeekdayNumbers => w >= 1 && w <= 7).sort()
	const currentWeekday = now.weekday
	const currentWeek = now.weekNumber
	if (DEBUG_TEST) {
		console.log('getValidExecutionFromDays', now, 'week', currentWeek, 'day', currentWeekday)
	}

	const orderedDays = [
		...validDays.filter((d) => d >= currentWeekday).map((d) => now.set({ weekday: d, ...DAY_START })),
		...validDays
			.filter((d) => d < currentWeekday)
			.map((d) => now.set({ weekNumber: currentWeek + 1, weekday: d, ...DAY_START })),
	]
	if (DEBUG_TEST) {
		console.log('getValidExecutionFromDays', now, validDays, 'orderedDays', orderedDays)
	}

	let execution = now
	for (const dayStart of orderedDays) {
		if (execution.valueOf() < dayStart.valueOf()) {
			execution = dayStart
		}

		execution = getValidExecutionFromTimes(execution, times)

		const dayEnd = dayStart.plus(Duration.fromObject({ weeks: 1 }))
		if (execution.valueOf() < dayEnd.valueOf()) {
			return execution
		}
	}

	throw new Error('getValidExecutionFromDays - Failed to find valid execution')
}

function getValidExecutionFromTimes(now: DateTime, times: string[] | undefined): DateTime {
	if (DEBUG_TEST) {
		console.log('getValidExecutionFromTimes', now)
	}

	if (!times) {
		return now
	}

	const validTimes = times.map((t) => timeToDate(t, now)).filter((t) => t.isValid)

	{
		const next = validTimes.find((t) => t.valueOf() >= now.valueOf())
		if (next) {
			return next
		}
	}

	{
		const next = validTimes.map((t) => t.plus({ days: 1 })).find((t) => t.valueOf() >= now.valueOf())
		if (next) {
			return next
		}
	}

	throw new Error('getValidExecutionFromTimes - Failed to find valid execution')
}

export function timeToDate(time: string, now: DateTime): DateTime {
	const timeParts = time.split(':')

	return now.set({ hour: Number(timeParts[0]), minute: Number(timeParts[1]), second: Number(timeParts[2]) })
}
