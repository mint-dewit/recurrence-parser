import { TimelineObject } from 'superfly-timeline'
import { DateObj } from './util'
import { ScheduleElement, LiveMode, BuildTimelineResult, ResolvedElement, ScheduleType, FolderSort } from './interface'
import { getFirstExecution } from './resolver'

export class RecurrenceParser {
	schedule: Array<ScheduleElement>
	curDate: () => DateObj
	log: (arg1: any, arg2?: any, arg3?: any) => void
	getMediaDuration: (name: string) => number
	getMediaTime: (name: string) => number
	getFolderContents: (name: string) => Array<string>
	logLevel = 1
	layer = 'PLAYOUT'
	atemLayer = 'ATEM'
	atemAudioLayer = 'ATEM_AUDIO_'
	liveMode = LiveMode.CasparCG

	constructor (getMediaDuration: (name: string) => number, getMediaTime: (name: string) => number, getFolderContents: (name: string) => Array<string>, curDate?: () => DateObj, externalLog?: (arg1: any, arg2?: any, arg3?: any) => void) {
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
		this.getMediaTime = getMediaTime

		// this.log('Initialized the recurrence parser')
	}

	getNextTimeline (datetime?: DateObj): BuildTimelineResult {
		if (!datetime) {
			datetime = this.curDate()
		}
		// this.log('Getting first timeline after', datetime.toLocaleString())

		const executions: { [time: number]: Array<ScheduleElement> } = {}

		const recurseElement = (el: ScheduleElement, start: DateObj) => {
			try {
				let executionTime = getFirstExecution(el, start)

				if (el.type !== ScheduleType.Group) {
					if (!executions[executionTime]) executions[executionTime] = []

					executions[executionTime].push(el)
					// console.log((el.path ?? el._id) + ' executes at ' + new Date(executionTime))
				}

				if (el.children) {
					for (let child of el.children) {
						recurseElement(child, new DateObj(executionTime))
					}
				}
			} catch (e) {
				// TODO - let the user know some part of the schedule is gone bad?
			}
		}

		for (const child of this.schedule) {
			recurseElement(child, new DateObj(datetime))
		}

		const executionTimes = Object.keys(executions)
		if (executionTimes.length === 0) {
			// this.log('Did not find any executions')
			return { start: datetime.getTime(), end: datetime.getTime(), timeline: [], readableTimeline: [] }
		}

		const firstExecution = Number(executionTimes.sort()[0])
		const firstElement = executions[firstExecution]

		let start: number = 0
		let end: number = 0
		let timeline: Array<TimelineObject> = []
		let readableTimeline: Array<ResolvedElement> = []

		for (const el of firstElement) {
			const res = this.buildTimeline(el, firstExecution)
			if (!start || !end || !timeline.length) {
				start = res.start
				end = res.end
				timeline = res.timeline
				readableTimeline = res.readableTimeline
			} else if (res.timeline.length) {
				const oldLength = end - start
				const tDiff = (res.end - res.start)
				end += tDiff
				res.timeline[0].enable = {
					start: `#${timeline[timeline.length - 1].id}.end`
				}
				timeline = [ ...timeline, ...res.timeline ]
				res.readableTimeline.map(o => {
					o.start += oldLength
					return o
				})
				readableTimeline = [
					...readableTimeline,
					...res.readableTimeline
				]
			}
		}

		// console.log('start: ' + new Date(start))
		return { start, end, timeline, readableTimeline }
	}

	buildTimeline (element: ScheduleElement, firstExecution: number): BuildTimelineResult {
		if (isNaN(new Date(firstExecution).valueOf())) return { start: Date.now(), end: Date.now(), timeline: [], readableTimeline: [] }
		const timeline: Array<TimelineObject> = []
		const readableTimeline: Array<ResolvedElement> = []
		let end = firstExecution
		const addFile = (element: ScheduleElement) => {
			const duration = this.getMediaDuration(element.path!) * 1000
			if (!duration) return // media file not found.
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
			readableTimeline.push({
				label: element.path || 'Unknown',
				start: end - duration,
				duration
			})

		}
		const addLive = (element: ScheduleElement) => {
			const duration = (element.duration || 0) * 1000
			if (duration === 0) return // no length means do not play
			end += duration
			const classes = [ 'PLAYOUT', 'LIVE' ]
			if (element.audio === false) classes.push('MUTED')
			const id = Math.random().toString(35).substr(2, 7)

			if (this.liveMode === LiveMode.ATEM) {
				timeline.push({
					id: id,
					enable: timeline.length === 0 ? {
						start: firstExecution,
						duration
					} : {
						start: `#${timeline[timeline.length - 1].id}.end`,
						duration
					},
					layer: this.atemLayer,
					content: {
						deviceType: 2,
						type: 'me',

						me: {
							programInput: element.input || 0
						}
					},
					priority: element.priority || 100,
					classes
				})
				if (element.audio !== false) {
					timeline.push({
						id: Math.random().toString(35).substr(2, 7),
						enable: {
							while: '#' + id // parent id
						},
						layer: this.atemAudioLayer + element.input,
						content: {
							deviceType: 2,
							type: 'audioChan',
							audioChannel: {
								mixOption: 1
							}
						},
						priority: element.priority || 100,
						classes: [ ...classes, 'LIVE_AUDIO' ]
					})
				}
				readableTimeline.push({
					label: 'Atem input ' + (element.input || 0),
					start: end - duration,
					duration
				})
			} else {
				timeline.push({
					id,
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
						type: 'input',

						muted: element.audio === false ? true : false,
						device: element.input,
						mixer: element.audio === false ? {
							volume: 0
						} : undefined
					},
					priority: element.priority || 100,
					classes
				})
				readableTimeline.push({
					label: 'Decklink input ' + (element.input || 0),
					start: end - duration,
					duration
				})
			}
		}
		const addFolder = (element: ScheduleElement) => {
			const contents = this.getFolderContents(element.path!)
			if (element.sort) {
				contents.sort((a, b) => {
					switch (element.sort) {
						case FolderSort.NameAsc:
							return a > b ? 1 : a === b ? 0 : -1
						case FolderSort.NameDesc:
							return a > b ? -1 : a === b ? 0 : 1
						case FolderSort.DateAsc:
							return this.getMediaTime(a) - this.getMediaTime(b)
						case FolderSort.DateDesc:
							return this.getMediaTime(b) - this.getMediaTime(a)
						default:
							return 0
					}
				})
			}
			for (const clip of contents) {
				addFile({ ...element, path: clip, type: ScheduleType.File })
			}
		}

		// this.log('Building timeline for ', new Date(firstExecution).toLocaleString())

		if (element.type === ScheduleType.File) {
			addFile(element)
		} else if (element.type === ScheduleType.Input) {
			addLive(element)
		} else if (element.type === ScheduleType.Folder) {
			addFolder(element)
		}

		// this.log('Built timeline: ', JSON.stringify(timeline))

		return { start: firstExecution, end, timeline, readableTimeline }
	}

	private _curDate () {
		return new DateObj()
	}

	private _log (arg1: any, arg2?: any, arg3?: any) {
		console.log(arg1, arg2 || null, arg3 || null)
	}
}
