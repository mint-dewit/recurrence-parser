import { RecurrenceParser } from '../parser'
import { DateObj } from '../util'
import { ScheduleElement, ScheduleType } from '../interface'

const media = [
	{
		name: 'clip1',
		mediaTime: new Date('2020-06-01 20:00:00'),
		format: {
			duration: 11
		}
	},
	{
		name: 'clip2',
		mediaTime: new Date('2020-06-01 21:00:00'),
		format: {
			duration: 13
		}
	},
	{
		name: 'clip3',
		mediaTime: new Date('2020-06-01 22:00:00'),
		format: {
			duration: 15
		}
	},
	{
		name: 'folderA/clip1',
		mediaTime: new Date('2020-06-01 20:00:00'),
		format: {
			duration: 11
		}
	},
	{
		name: 'folderA/clip2',
		mediaTime: new Date('2020-06-01 21:00:00'),
		format: {
			duration: 13
		}
	},
	{
		name: 'folderA/clip3',
		mediaTime: new Date('2020-06-01 22:00:00'),
		format: {
			duration: 15
		}
	},
	{
		name: 'folderB/clip1',
		mediaTime: new Date('2020-06-01 20:00:00'),
		format: {
			duration: 11
		}
	},
	{
		name: 'folderB/clip2',
		mediaTime: new Date('2020-06-01 21:00:00'),
		format: {
			duration: 13
		}
	},
	{
		name: 'folderB/clip3',
		mediaTime: new Date('2020-06-01 22:00:00'),
		format: {
			duration: 15
		}
	}
]

function getDuration(clip: string) {
	const c = media.find(c => c.name === clip)
	if (c) return c.format.duration
	return 0
}
function getMediatime(clip: string) {
	const c = media.find(c => c.name === clip)
	if (c) return c.mediaTime.getTime()
	return 0
}
function getFolderContents(folder: string) {
	const c = media.filter(c => c.name.indexOf(folder) === 0).map(c => c.name)
	return c
}
function getParser() {
	return new RecurrenceParser(getDuration, getMediatime, getFolderContents, () => new DateObj())
}

test('2 folders with days set play within 24hrs', () => {
	const schedule: Array<ScheduleElement> = [
		{
			type: ScheduleType.Folder,
			path: 'folderB',
			times: [
				'13:00:00'
			],
			days: [5]
		},
		{
			type: ScheduleType.Folder,
			path: 'folderA',
			times: [
				'15:00:00'
			],
			days: [4,5]
		},
	]
	const parser = getParser()
	parser.schedule = schedule

	const result = parser.getNextTimeline(new DateObj('2020-8-20 14:00:00'))

	console.log(result)
	expect(result.readableTimeline).toEqual([
		{ label: 'folderA/clip1', start: new Date('2020-8-20 15:00:00').getTime(), duration: 11 * 1000},
		{ label: 'folderA/clip2', start: new Date('2020-8-20 15:00:11').getTime(), duration: 13 * 1000},
		{ label: 'folderA/clip3', start: new Date('2020-8-20 15:00:24').getTime(), duration: 15 * 1000}
	])

	const result2 = parser.getNextTimeline(new DateObj('2020-8-20 15:01:00'))
	console.log(result2)
	expect(result2.readableTimeline).toEqual([
		{ label: 'folderB/clip1', start: new Date('2020-8-21 13:00:00').getTime(), duration: 11 * 1000},
		{ label: 'folderB/clip2', start: new Date('2020-8-21 13:00:11').getTime(), duration: 13 * 1000},
		{ label: 'folderB/clip3', start: new Date('2020-8-21 13:00:24').getTime(), duration: 15 * 1000}
	])
})
test('same start time inside group', () => {
	const schedule: Array<ScheduleElement> = [
		{
			type: ScheduleType.Group,
			times: [
				'15:00:00',
			],
			children: [{
				type: ScheduleType.File,
				path: 'clip1',
				times: [
					'15:00:00'
				]
			},{
				type: ScheduleType.File,
				path: 'clip2',
				times: [
					'15:00:00'
				]
			}]
		}
	]
	const parser = getParser()
	parser.schedule = schedule

	const result = parser.getNextTimeline(new DateObj('2020-8-20 14:00:00'))

	console.log(result)
	expect(result.readableTimeline).toEqual([
		{ label: 'clip1', start: new Date('2020-8-20 15:00:00').getTime(), duration: 11 * 1000},
		{ label: 'clip2', start: new Date('2020-8-20 15:00:11').getTime(), duration: 13 * 1000},
	])
})

test('same start time inside root', () => {
	const schedule: Array<ScheduleElement> = [
		{
			type: ScheduleType.File,
			path: 'clip1',
			times: [
				'15:00:00'
			]
		},
		{
			type: ScheduleType.File,
			path: 'clip2',
			times: [
				'15:00:00'
			]
		}
	]
	const parser = getParser()
	parser.schedule = schedule

	const result = parser.getNextTimeline(new DateObj('2020-8-20 14:00:00'))

	console.log(result)
	expect(result.readableTimeline).toEqual([
		{ label: 'clip1', start: new Date('2020-8-20 15:00:00').getTime(), duration: 11 * 1000},
		{ label: 'clip2', start: new Date('2020-8-20 15:00:11').getTime(), duration: 13 * 1000},
	])
})

test('overlapping - first takes priority', () => {
	const schedule: Array<ScheduleElement> = [
		{
			type: ScheduleType.File,
			path: 'clip1',
			times: [
				'15:00:00'
			]
		},
		{
			type: ScheduleType.File,
			path: 'clip2',
			times: [
				'15:00:05'
			]
		}
	]
	const parser = getParser()
	parser.schedule = schedule

	const result = parser.getNextTimeline(new DateObj('2020-8-20 14:00:00'))

	console.log(result)
	expect(result.readableTimeline).toEqual([
		{ label: 'clip1', start: new Date('2020-8-20 15:00:00').getTime(), duration: 11 * 1000}
	])
})