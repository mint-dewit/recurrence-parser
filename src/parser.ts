import { TimelineObject } from 'superfly-timeline'

export class DateObj extends Date {
	getWeek (): number {
		let oneJan = new Date(this.getFullYear(),0,1)
		let millisecsInDay = 86400000

		let t = this.getTime() // current time
		t -= this.getTimezoneOffset() * 60000 // adjust for timezone
		t -= oneJan.getTime() // remove all before the start of the year (t = ms elapsed this year)
		t /= millisecsInDay // divide by ms/day => t = days elapsed this year
		t += oneJan.getDay() + 1 // account for the fact that newyears don't always start on the first day of week
        t = Math.floor(t)
        t /= 7 // divide by 7 to get the week no
        t = Math.ceil(t)

		return t
	}

	setWeek (week: number): DateObj {
		this.setFullYear(this.getFullYear(), 0, 1)
		this.setDate(-this.getDay() + 1)
		this.setDate((this.getDate() - 1) + week * 7 - 6)
		return this
	}
}

export enum ScheduleType {
	Group = 'group',
	Folder = 'folder',
	File = 'file'
}

export enum LogLevel {
	Production = 1,
	Debug = 0
}

export interface ScheduleElement {
	type: ScheduleType
	_id?: string
	audio?: boolean
	path?: string
	priority?: number
	days?: Array<number>
	weeks?: Array<number>
	dates?: Array<Array<number>>
	times?: Array<string>
	children?: Array<ScheduleElement>
}

export interface BuildTimelineResult {
	start: number
	end: number
	timeline: Array<TimelineObject>
}

export class RecurrenceParser {
	schedule: Array<ScheduleElement>
	curDate: () => DateObj
	log: (arg1: any, arg2?: any, arg3?: any) => void
	getMediaDuration: (name: string) => number
	getFolderContents: (name: string) => Array<string>
	logLevel = 1
	layer = 'PLAYOUT'

	constructor (getMediaDuration: (name: string) => number, getFolderContents: (name: string) => Array<string>, curDate?: () => DateObj, externalLog?: (arg1: any, arg2?: any, arg3?: any) => void) {
		if (curDate) {
			this.curDate = curDate
		} else {
			this.curDate = this._curDate
		}

		if (externalLog) {
			this.log = externalLog
		} else {
			this.log = this._log
		}

		this.getMediaDuration = getMediaDuration
		this.getFolderContents = getFolderContents

		this.log('Initialized the recurrence parser')
	}

	getNextTimeline (datetime?: DateObj): BuildTimelineResult {
		if (!datetime) {
			datetime = this.curDate()
		}
		this.log('Getting first timeline after', datetime.toLocaleString())

		let firstExecution = Number.MAX_SAFE_INTEGER
		let firstElement: Array<ScheduleElement> = []
		let recurseElement = (el: ScheduleElement, start: DateObj, isTopLevel = false) => {
			let executionTime = this.getFirstExecution(el, start)
			if (this.logLevel === LogLevel.Debug) this.log(`Execution time for ${el.path || el._id || 'unknown'} is ${new Date(executionTime)}`)
			if (executionTime < firstExecution && el.times) {
				firstElement = [ el ]
				firstExecution = executionTime
			} else if (executionTime === firstExecution && isTopLevel && el.times) {
				firstElement.push(el)
			}
			if (el.children) {
				for (let child of el.children) {
					recurseElement(child, new DateObj(executionTime))
				}
			}
		}

		for (const child of this.schedule) {
			recurseElement(child, new DateObj(datetime), true)
		}

		if (firstElement.length === 0) {
			this.log('Did not find any executions')
			return { start: datetime.getTime(), end: datetime.getTime(), timeline: [] }
		}

		let start: number = 0
		let end: number = 0
		let timeline: Array<TimelineObject> = []

		for (const el of firstElement) {
			const res = this.buildTimeline(el, firstExecution)
			if (!start || !end || !timeline.length) {
				start = res.start
				end = res.end
				timeline = res.timeline
			} else if (res.timeline.length) {
				end += (res.end - res.start)
				res.timeline[0].enable = {
					start: `#${timeline[timeline.length - 1].id}.end`
				}
				timeline = [ ...timeline, ...res.timeline ]
			}
		}

		return { start, end, timeline }
	}

	buildTimeline (element: ScheduleElement, firstExecution: number): BuildTimelineResult {
		if (isNaN(new Date(firstExecution).valueOf())) return { start: Date.now(), end: Date.now(), timeline: [] }
		const timeline: Array<TimelineObject> = []
		let end = firstExecution
		const addFile = (element: ScheduleElement) => {
			if (this.getFirstExecution(element, new DateObj(firstExecution)) > firstExecution) return
			const duration = this.getMediaDuration(element.path!) * 1000
			if (duration === 0) return // media file not found.
			end += duration
			const classes = [ 'PLAYOUT' ]
			if (element.audio === false) classes.push('MUTED')
			timeline.push({
				id: Math.random().toString(35).substr(2, 7),
				enable: timeline.length === 0 ? {
					start: firstExecution,
					duration
				} : {
					start: `#${timeline[timeline.length - 1].id}.end`,
					duration
				},
				layer: this.layer,
				content: {
					deviceType: 1, // casparcg
					type: 'media',
					muted: element.audio === false ? true : false,
					file: element.path,
					mixer: element.audio === false ? {
						volume: 0
					} : undefined
				},
				priority: element.priority || 100,
				classes
			})
		}
		const addFolder = (element: ScheduleElement) => {
			if (this.getFirstExecution(element, new DateObj(firstExecution)) > firstExecution) return
			const contents = this.getFolderContents(element.path!)
			for (const clip of contents) {
				addFile({ ...element, path: clip })
			}
		}
		const addGroup = (element: ScheduleElement) => {
			if (this.getFirstExecution(element, new DateObj(firstExecution)) > firstExecution) return
			element.children = element.children || []
			for (let child of element.children) {
				if (child.type === 'file') {
					addFile(child)
				} else if (child.type === 'folder') {
					addFolder(child)
				} else if (child.type === 'group') {
					addGroup(child)
				}
			}
		}

		this.log('Building timeline for ', new Date(firstExecution).toLocaleString())

		if (element.type === ScheduleType.File) {
			addFile(element)
		} else if (element.type === ScheduleType.Folder) {
			addFolder(element)
		} else if (element.type === ScheduleType.Group) {
			addGroup(element)
		}

		this.log('Built timeline: ', JSON.stringify(timeline))

		return { start: firstExecution, end, timeline }
	}

	private _curDate () {
		return new DateObj()
	}

	private _log (arg1: any, arg2?: any, arg3?: any) {
		console.log(arg1, arg2 || null, arg3 || null)
	}

	private getFirstExecution (object: ScheduleElement, now: DateObj): number {
		if (isNaN(now.valueOf())) throw new Error('Parameter now is an invalid date')
		let firstDay
		let firstDateRange: Array<DateObj>
		let firstTime
		let outOfRange = false

		let start = now

		let getNextDateRange = () => {
			let hasFound = false
			for (let dates of object.dates!) {
				const begin = new DateObj(dates[0])
				const end = new DateObj(dates[1])
				if (begin <= start && end >= start) {
					firstDateRange = [ new DateObj(start.toLocaleDateString()), new DateObj(end.toLocaleDateString()) ]
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
				if (this.logLevel === LogLevel.Debug) console.log(`WARNING: No execution time was found for ${object.path || object._id || 'unkown'}!`)
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
				if (day === start.getDay()) {
					firstDay = start.setWeek(start.getWeek())
					firstDay.setMilliseconds(day * 86400000)
					break
				} else if (day > start.getDay()) {
					firstDay = start.setWeek(start.getWeek())
					firstDay.setMilliseconds(day * 86400000)
					start = firstDay
					break
				}
			}
			if (firstDateRange) {
				while (start > firstDateRange[1]) {
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
			getNextDateRange()
			if (outOfRange) return Number.MAX_SAFE_INTEGER
			// what to do when all is in the past?
			if (this.logLevel === LogLevel.Debug) console.log(`Parsed date ranges for ${object.path || object._id || 'unkown'}, start is at ${start.toLocaleString()}`)
		}

		if (object.weeks && object.weeks.length > 0) {
			object.weeks.sort()
			getNextWeek()
			if (this.logLevel === LogLevel.Debug) console.log(`Parsed weeks for ${object.path || object._id || 'unkown'}, start is at ${start.toLocaleString()}`)
		}

		if (object.days && object.days.length > 0 && object.days.length !== 7) {
			object.days.sort()
			getNextDay()
			if (!new Set(object.days).has(start.getDay())) {
				start.setWeek(start.getWeek() + 1)
				return this.getFirstExecution(object, start)
			}
			if (this.logLevel === LogLevel.Debug) console.log(`Parsed days for ${object.path || object._id || 'unkown'}, start is at ${start.toLocaleString()}`)
		}

		if (object.times && object.times.length > 0) {
			object.times.sort()
			for (let time of object.times) {
				let date = this.timeToDate(time, start)
				if (this.logLevel === LogLevel.Debug) console.log(`Parsed time is at ${date.toLocaleString()}, start is at ${start.toLocaleString()}`)
				if (date >= start) {
					start = date
					firstTime = time
					break
				}
			}
			if (typeof firstTime === 'undefined') { // pass midnight
				start.setHours(0, 0, 0, 0)
				start.setMilliseconds(86400000)
				return this.getFirstExecution(object, start)
			}
			if (this.logLevel === LogLevel.Debug) console.log(`Parsed times for ${object.path || object._id || 'unkown'}, start is at ${start.toLocaleString()}`)
		}

		if (outOfRange) return Number.MAX_SAFE_INTEGER
		return start.getTime()
	}

	private timeToDate (time: string, date: Date): DateObj {
		let timeParts = time.split(':')
		let dateObj = new DateObj(date)
		dateObj.setHours(Number(timeParts[0]))
		dateObj.setMinutes(Number(timeParts[1]))
		dateObj.setSeconds(Number(timeParts[2]))
		dateObj.setMilliseconds(0)
		return dateObj
	}
}
