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

function getDuration (clip: string) {
	const c = media.find(c => c.name === clip)
	if (c) return c.format.duration
	return 0
}
function getMediatime (clip: string) {
	const c = media.find(c => c.name === clip)
	if (c) return c.mediaTime.getTime()
	return 0
}
function getFolderContents (folder: string) {
	const c = media.filter(c => c.name.indexOf(folder) === 0).map(c => c.name)
	return c
}
function getParser () {
	return new RecurrenceParser(getDuration, getMediatime, getFolderContents, () => new DateObj())
}

describe('default schedule', () => {
	const schedule: Array<ScheduleElement> = [
		{ // root
			type: ScheduleType.Group,
			times: [
				'11:00:00',
				'13:00:00',
				'15:00:00'
			],
			children: [
				{ // announce
					type: ScheduleType.File,
					path: 'clip1'
				},
				{ // commercials
					type: ScheduleType.Group,
					children: [
						{
							type: ScheduleType.File,
							path: 'folderA/clip1',
							days: [4]
						},
						{
							type: ScheduleType.File,
							path: 'folderA/clip2'
						},
						{
							type: ScheduleType.File,
							path: 'folderA/clip3',
							times: [
								'15:00:00'
							]
						}
					]
				},
				{ // programmes
					type: ScheduleType.Folder,
					path: 'folderB'
				},
				{ // special programme
					type: ScheduleType.File,
					path: 'clip3',
					days: [4],
					times: [
						'15:00:00'
					]
				},
				{ // announce
					type: ScheduleType.File,
					path: 'clip2'
				}
			]
		}
	]
	const parser = getParser()
	parser.schedule = schedule

	test('min schedule', () => {
		const result = parser.getNextTimeline(new DateObj('2020-8-19 10:00:00')) // wednesday week 34

		expect(result.readableTimeline).toEqual([
			{ label: 'clip1', start: new Date('2020-8-19 11:00:00').getTime(), duration: 11 * 1000 },
			{ label: 'folderA/clip2', start: new Date('2020-8-19 11:00:11').getTime(), duration: 13 * 1000 },
			{ label: 'folderB/clip1', start: new Date('2020-8-19 11:00:24').getTime(), duration: 11 * 1000 },
			{ label: 'folderB/clip2', start: new Date('2020-8-19 11:00:35').getTime(), duration: 13 * 1000 },
			{ label: 'folderB/clip3', start: new Date('2020-8-19 11:00:48').getTime(), duration: 15 * 1000 },
			{ label: 'clip2', start: new Date('2020-8-19 11:01:03').getTime(), duration: 13 * 1000 }
		])
	})
	test('time based entry', () => {
		const result2 = parser.getNextTimeline(new DateObj('2020-8-19 14:00:00')) // wednesday week 34
		expect(result2.readableTimeline).toEqual([
			{ label: 'clip1', start: new Date('2020-8-19 15:00:00').getTime(), duration: 11 * 1000 },
			{ label: 'folderA/clip2', start: new Date('2020-8-19 15:00:11').getTime(), duration: 13 * 1000 },
			{ label: 'folderA/clip3', start: new Date('2020-8-19 15:00:24').getTime(), duration: 15 * 1000 },
			{ label: 'folderB/clip1', start: new Date('2020-8-19 15:00:39').getTime(), duration: 11 * 1000 },
			{ label: 'folderB/clip2', start: new Date('2020-8-19 15:00:50').getTime(), duration: 13 * 1000 },
			{ label: 'folderB/clip3', start: new Date('2020-8-19 15:01:03').getTime(), duration: 15 * 1000 },
			{ label: 'clip2', start: new Date('2020-8-19 15:01:18').getTime(), duration: 13 * 1000 }
		])
	})
	test('day based entry', () => {
		const result3 = parser.getNextTimeline(new DateObj('2020-8-20 10:00:00')) // thursday week 34
		expect(result3.readableTimeline).toEqual([
			{ label: 'clip1', start: new Date('2020-8-20 11:00:00').getTime(), duration: 11 * 1000 },
			{ label: 'folderA/clip1', start: new Date('2020-8-20 11:00:11').getTime(), duration: 11 * 1000 },
			{ label: 'folderA/clip2', start: new Date('2020-8-20 11:00:22').getTime(), duration: 13 * 1000 },
			{ label: 'folderB/clip1', start: new Date('2020-8-20 11:00:35').getTime(), duration: 11 * 1000 },
			{ label: 'folderB/clip2', start: new Date('2020-8-20 11:00:46').getTime(), duration: 13 * 1000 },
			{ label: 'folderB/clip3', start: new Date('2020-8-20 11:00:59').getTime(), duration: 15 * 1000 },
			{ label: 'clip2', start: new Date('2020-8-20 11:01:14').getTime(), duration: 13 * 1000 }
		])
	})
	test('day and time based entry', () => {
		const result4 = parser.getNextTimeline(new DateObj('2020-8-20 14:00:00')) // thursday week 34
		expect(result4.readableTimeline).toEqual([
			{ label: 'clip1', start: new Date('2020-8-20 15:00:00').getTime(), duration: 11 * 1000 },
			{ label: 'folderA/clip1', start: new Date('2020-8-20 15:00:11').getTime(), duration: 11 * 1000 },
			{ label: 'folderA/clip2', start: new Date('2020-8-20 15:00:22').getTime(), duration: 13 * 1000 },
			{ label: 'folderA/clip3', start: new Date('2020-8-20 15:00:35').getTime(), duration: 15 * 1000 },
			{ label: 'folderB/clip1', start: new Date('2020-8-20 15:00:50').getTime(), duration: 11 * 1000 },
			{ label: 'folderB/clip2', start: new Date('2020-8-20 15:01:01').getTime(), duration: 13 * 1000 },
			{ label: 'folderB/clip3', start: new Date('2020-8-20 15:01:14').getTime(), duration: 15 * 1000 },
			{ label: 'clip3', start: new Date('2020-8-20 15:01:29').getTime(), duration: 15 * 1000 },
			{ label: 'clip2', start: new Date('2020-8-20 15:01:44').getTime(), duration: 13 * 1000 }
		])
	})
})

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
			days: [4, 5]
		}
	]
	const parser = getParser()
	parser.schedule = schedule

	const result = parser.getNextTimeline(new DateObj('2020-8-20 14:00:00')) // thursday week 34

	expect(result.readableTimeline).toEqual([
		{ label: 'folderA/clip1', start: new Date('2020-8-20 15:00:00').getTime(), duration: 11 * 1000 },
		{ label: 'folderA/clip2', start: new Date('2020-8-20 15:00:11').getTime(), duration: 13 * 1000 },
		{ label: 'folderA/clip3', start: new Date('2020-8-20 15:00:24').getTime(), duration: 15 * 1000 }
	])

	const result2 = parser.getNextTimeline(new DateObj('2020-8-20 15:01:00')) // thursday week 34
	expect(result2.readableTimeline).toEqual([
		{ label: 'folderB/clip1', start: new Date('2020-8-21 13:00:00').getTime(), duration: 11 * 1000 },
		{ label: 'folderB/clip2', start: new Date('2020-8-21 13:00:11').getTime(), duration: 13 * 1000 },
		{ label: 'folderB/clip3', start: new Date('2020-8-21 13:00:24').getTime(), duration: 15 * 1000 }
	])
})
test('same start time inside group', () => {
	const schedule: Array<ScheduleElement> = [
		{
			type: ScheduleType.Group,
			times: [
				'15:00:00'
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

	const result = parser.getNextTimeline(new DateObj('2020-8-20 14:00:00')) // thursday week 34

	expect(result.readableTimeline).toEqual([
		{ label: 'clip1', start: new Date('2020-8-20 15:00:00').getTime(), duration: 11 * 1000 },
		{ label: 'clip2', start: new Date('2020-8-20 15:00:11').getTime(), duration: 13 * 1000 }
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

	const result = parser.getNextTimeline(new DateObj('2020-8-20 14:00:00')) // thursday week 34

	expect(result.readableTimeline).toEqual([
		{ label: 'clip1', start: new Date('2020-8-20 15:00:00').getTime(), duration: 11 * 1000 },
		{ label: 'clip2', start: new Date('2020-8-20 15:00:11').getTime(), duration: 13 * 1000 }
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

	const result = parser.getNextTimeline(new DateObj('2020-8-20 14:00:00')) // thursday week 34

	expect(result.readableTimeline).toEqual([
		{ label: 'clip1', start: new Date('2020-8-20 15:00:00').getTime(), duration: 11 * 1000 }
	])
})
