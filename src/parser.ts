import { TimelineObject, Enums } from 'superfly-timeline'

export class DateObj extends Date {
	getWeek (): number {
		let oneJan = new Date(this.getFullYear(),0,1)
		let millisecsInDay = 86400000
		return Math.ceil((((this.getTime() - oneJan.getTime()) / millisecsInDay) + oneJan.getDay() + 1) / 7)
	}

	setWeek (week: number): DateObj {
		this.setFullYear(this.getFullYear(), 1, 1)
		this.setDate(week * 7 - 6)
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
	LLayer = 'PLAYOUT'

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
			if (executionTime < firstExecution) {
				firstElement = [ el ]
				firstExecution = executionTime
			} else if (executionTime === firstExecution && isTopLevel) {
				firstElement.push(el)
			}
			if (el.children) {
				for (let child of el.children) {
					recurseElement(child, new DateObj(executionTime))
				}
			}
		}

		for (const child of this.schedule) {
			recurseElement(child, datetime, true)
		}

		if (!firstElement) {
			this.log('Did not find any executions')
			return { start: datetime.getTime(), end: datetime.getTime(), timeline: [] }
		}

		let start: number = 0
		let end: number = 0
		let timeline: Array<TimelineObject> = []

		for (const el of firstElement) {
			const res = this.buildTimeline(el, firstExecution)
			if (!start || !end) {
				start = res.start
				end = res.end
				timeline = res.timeline
			} else {
				end += (res.end - res.start)
				res.timeline[0].trigger = {
					type: Enums.TriggerType.TIME_RELATIVE,
					value: `#${timeline[timeline.length - 1].id}.end`
				}
				timeline = [ ...timeline, ...res.timeline ]
			}
		}

		return { start, end, timeline }
	}

	buildTimeline (element: ScheduleElement, firstExecution: number): BuildTimelineResult {
		const timeline: Array<TimelineObject> = []
		let end = firstExecution
		const addFile = (element: ScheduleElement) => {
			if (this.getFirstExecution(element, new DateObj(firstExecution)) > firstExecution) return
			const duration = this.getMediaDuration(element.path!) * 1000
			if (duration === 0) return // media file not found.
			end += duration
			timeline.push({
				id: Math.random().toString(35).substr(2, 7),
				trigger: timeline.length === 0 ? {
					type: Enums.TriggerType.TIME_ABSOLUTE,
					value: firstExecution
				} : {
					type: Enums.TriggerType.TIME_RELATIVE,
					value: `#${timeline[timeline.length - 1].id}.end`
				},
				duration, // I need the media library!
				LLayer: this.LLayer,
				content: {
					type: 'media',
					muted: element.audio === false ? true : false,
					attributes: {
						file: element.path
					},
					mixer: element.audio === false ? {
						volume: 0
					} : undefined
				},
				priority: element.priority || 100
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
		let firstDay
		let firstDateRange: Array<DateObj>
		let firstTime
		let outOfRange = false

		let start = now

		let getNextDateRange = () => {
			for (let dates of object.dates!) {
				const begin = new DateObj(dates[0])
				const end = new DateObj(dates[1])
				if (begin <= start && end >= start) {
					firstDateRange = [ new DateObj(start.toLocaleDateString()), new DateObj(end.toLocaleDateString()) ]
					start = firstDateRange[0]
					break
				} else if (begin >= start) {
					firstDateRange = [ begin, end ]
					start = firstDateRange[0]
					break
				}
			}
			// we've recursed through everything and no date was found:
			if (this.logLevel === LogLevel.Debug) console.log(`WARNING: No execution time was found for ${object.path || object._id || 'unkown'}!`)
			outOfRange = true
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
					getNextWeek()
				}
			}
		}
		let getNextDay = () => {
			for (let day of object.days!) {
				if (day === start.getDay()) {
					firstDay = start.setWeek(start.getWeek())
					firstDay.setMilliseconds(day * 86400000)
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
					if (object.weeks) {
						getNextWeek()
					}
					getNextDay()
				}
			}
		}

		if (object.dates) {
			object.dates.sort()
			getNextDateRange()
			// what to do when all is in the past?
			if (this.logLevel === LogLevel.Debug) console.log(`Parsed date ranges for ${object.path || object._id || 'unkown'}, start is at ${start.toLocaleString()}`)
		}

		if (object.weeks) {
			object.weeks.sort()
			getNextWeek()
			if (this.logLevel === LogLevel.Debug) console.log(`Parsed weeks for ${object.path || object._id || 'unkown'}, start is at ${start.toLocaleString()}`)
		}

		if (object.days) {
			object.days.sort()
			getNextDay()
			if (this.logLevel === LogLevel.Debug) console.log(`Parsed days for ${object.path || object._id || 'unkown'}, start is at ${start.toLocaleString()}`)
		}

		if (object.times) {
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
