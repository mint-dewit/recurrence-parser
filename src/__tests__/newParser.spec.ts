import { describe, expect, test } from 'vitest'
import { ScheduleElement2 } from '../interface.js'
import { scheduleToExecutionTimes, scheduleToFirstOrderedExecution } from '../newParser.js'

describe('default schedule', () => {
	const schedule: Array<ScheduleElement2<{ path: string }>> = [
		{
			// root
			_id: 'root',
			triggers: [{ times: ['11:00:00', '13:00:00', '15:00:00'] }],
			children: [
				{
					// announce
					_id: 'announce',
					triggers: [],
					content: { path: 'clip1' },
				},
				{
					// commercials
					_id: 'commercials',
					triggers: [],
					children: [
						{
							_id: 'commercials-clip1',
							triggers: [{ days: [4] }],
							content: { path: 'folderA/clip1' },
						},
						{
							_id: 'commercials-clip2',
							triggers: [],
							content: { path: 'folderA/clip2' },
						},
						{
							_id: 'commercials-clip3',
							triggers: [{ times: ['15:00:00'] }],
							content: { path: 'folderA/clip3' },
						},
					],
				},
				{
					// programmes
					_id: 'programmes',
					triggers: [],
					content: { path: 'folderB' },
				},
				{
					// special programme
					_id: 'special',
					triggers: [{ days: [4], times: ['15:00:00'] }],
					content: { path: 'clip3' },
				},
				{
					// announce
					_id: 'outro',
					triggers: [],
					content: { path: 'clip2' },
				},
			],
		},
	]

	test('min schedule', () => {
		const result = scheduleToFirstOrderedExecution(schedule, new Date('2020-8-19 10:00:00').getTime())

		expect(result.errors).toHaveLength(0)
		expect(result.executions).toEqual({
			root: new Date('2020-8-19 11:00:00').getTime(),
			announce: new Date('2020-8-19 11:00:00').getTime(),
			commercials: new Date('2020-8-19 11:00:00').getTime(),
			'commercials-clip1': new Date('2020-8-20 11:00:00').getTime(),
			'commercials-clip2': new Date('2020-8-19 11:00:00').getTime(),
			'commercials-clip3': new Date('2020-8-19 15:00:00').getTime(),
			programmes: new Date('2020-8-19 11:00:00').getTime(),
			special: new Date('2020-8-20 15:00:00').getTime(),
			outro: new Date('2020-8-19 11:00:00').getTime(),
		})

		expect(result.time).toBe(new Date('2020-8-19 11:00:00').getTime())
		expect(result.order).toHaveLength(4)
		expect(result.order.map((n) => ({ _id: n._id, content: n.content }))).toEqual([
			{
				_id: 'announce',
				content: { path: 'clip1' },
			},
			{
				_id: 'commercials-clip2',
				content: { path: 'folderA/clip2' },
			},
			{
				_id: 'programmes',
				content: { path: 'folderB' },
			},
			{
				_id: 'outro',
				content: { path: 'clip2' },
			},
		])
	})
	test('time based entry', () => {
		const result = scheduleToExecutionTimes(schedule, new Date('2020-8-19 14:00:00').getTime())

		expect(result.errors).toHaveLength(0)
		expect(result.executions).toEqual({
			root: new Date('2020-8-19 15:00:00').getTime(),
			announce: new Date('2020-8-19 15:00:00').getTime(),
			commercials: new Date('2020-8-19 15:00:00').getTime(),
			'commercials-clip1': new Date('2020-8-20 11:00:00').getTime(),
			'commercials-clip2': new Date('2020-8-19 15:00:00').getTime(),
			'commercials-clip3': new Date('2020-8-19 15:00:00').getTime(),
			programmes: new Date('2020-8-19 15:00:00').getTime(),
			special: new Date('2020-8-20 15:00:00').getTime(),
			outro: new Date('2020-8-19 15:00:00').getTime(),
		})
	})
	test('day based entry', () => {
		const result = scheduleToExecutionTimes(schedule, new Date('2020-8-20 10:00:00').getTime())

		expect(result.errors).toHaveLength(0)
		expect(result.executions).toEqual({
			root: new Date('2020-8-20 11:00:00').getTime(),
			announce: new Date('2020-8-20 11:00:00').getTime(),
			commercials: new Date('2020-8-20 11:00:00').getTime(),
			'commercials-clip1': new Date('2020-8-20 11:00:00').getTime(),
			'commercials-clip2': new Date('2020-8-20 11:00:00').getTime(),
			'commercials-clip3': new Date('2020-8-20 15:00:00').getTime(),
			programmes: new Date('2020-8-20 11:00:00').getTime(),
			special: new Date('2020-8-20 15:00:00').getTime(),
			outro: new Date('2020-8-20 11:00:00').getTime(),
		})
	})
	test('day and time based entry', () => {
		const result = scheduleToExecutionTimes(schedule, new Date('2020-8-20 14:00:00').getTime())

		expect(result.errors).toHaveLength(0)
		expect(result.executions).toEqual({
			root: new Date('2020-8-20 15:00:00').getTime(),
			announce: new Date('2020-8-20 15:00:00').getTime(),
			commercials: new Date('2020-8-20 15:00:00').getTime(),
			'commercials-clip1': new Date('2020-8-20 15:00:00').getTime(),
			'commercials-clip2': new Date('2020-8-20 15:00:00').getTime(),
			'commercials-clip3': new Date('2020-8-20 15:00:00').getTime(),
			programmes: new Date('2020-8-20 15:00:00').getTime(),
			special: new Date('2020-8-20 15:00:00').getTime(),
			outro: new Date('2020-8-20 15:00:00').getTime(),
		})
	})
})

test('2 folders with days set play within 24hrs', () => {
	const schedule: Array<ScheduleElement2<{ path: string }>> = [
		{
			_id: 'folderB',
			triggers: [{ times: ['13:00:00'], days: [5] }],
			content: { path: 'folderB' },
		},
		{
			_id: 'folderA',
			triggers: [{ times: ['15:00:00'], days: [4, 5] }],
			content: { path: 'folderA' },
		},
	]

	const result = scheduleToExecutionTimes(schedule, new Date('2020-8-20 14:00:00').getTime())
	expect(result.executions).toEqual({
		folderB: new Date('2020-8-21 13:00:00').getTime(),
		folderA: new Date('2020-8-20 15:00:00').getTime(),
	})
	const result2 = scheduleToExecutionTimes(schedule, new Date('2020-8-20 15:01:00').getTime())
	expect(result2.executions).toEqual({
		folderB: new Date('2020-8-21 13:00:00').getTime(),
		folderA: new Date('2020-8-21 15:00:00').getTime(),
	})
})

test('same start time inside group', () => {
	const schedule: Array<ScheduleElement2<{ path: string }>> = [
		{
			_id: 'group',
			triggers: [{ times: ['15:00:00'] }],
			children: [
				{
					_id: 'clip1',
					triggers: [{ times: ['15:00:00'] }],
					content: { path: 'clip1' },
				},
				{
					_id: 'clip2',
					triggers: [{ times: ['15:00:00'] }],
					content: { path: 'clip2' },
				},
			],
		},
	]

	const result = scheduleToExecutionTimes(schedule, new Date('2020-8-20 14:00:00').getTime())
	expect(result.executions).toEqual({
		group: new Date('2020-8-20 15:00:00').getTime(),
		clip1: new Date('2020-8-20 15:00:00').getTime(),
		clip2: new Date('2020-8-20 15:00:00').getTime(),
	})
})

test('same start time inside root', () => {
	const schedule: Array<ScheduleElement2<{ path: string }>> = [
		{
			_id: 'clip1',
			triggers: [{ times: ['15:00:00'] }],
			content: { path: 'clip1' },
		},
		{
			_id: 'clip2',
			triggers: [{ times: ['15:00:00'] }],
			content: { path: 'clip2' },
		},
	]

	const result = scheduleToExecutionTimes(schedule, new Date('2020-8-20 14:00:00').getTime())
	expect(result.executions).toEqual({
		clip1: new Date('2020-8-20 15:00:00').getTime(),
		clip2: new Date('2020-8-20 15:00:00').getTime(),
	})
})

test('overlapping - each gets its own execution time', () => {
	const schedule: Array<ScheduleElement2<{ path: string }>> = [
		{
			_id: 'clip1',
			triggers: [{ times: ['15:00:00'] }],
			content: { path: 'clip1' },
		},
		{
			_id: 'clip2',
			triggers: [{ times: ['15:00:05'] }],
			content: { path: 'clip2' },
		},
	]

	const result = scheduleToExecutionTimes(schedule, new Date('2020-8-20 14:00:00').getTime())
	expect(result.executions).toEqual({
		clip1: new Date('2020-8-20 15:00:00').getTime(),
		clip2: new Date('2020-8-20 15:00:05').getTime(),
	})
})

test('day + daterange before 10th of the month', () => {
	const schedule: Array<ScheduleElement2<{ path: string }>> = [
		{
			_id: 'clip1',
			triggers: [{ times: ['15:00:00'], days: [1], dates: [['2020-09-20', '2020-10-04']] }],
			content: { path: 'clip1' },
		},
	]

	const result = scheduleToExecutionTimes(schedule, new Date('2020-8-20 14:00:00').getTime())
	expect(result.executions).toEqual({
		clip1: new Date('2020-9-21 15:00:00').getTime(),
	})
})
