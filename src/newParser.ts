import { DateTime } from 'luxon'
import { ScheduleElement2, ScheduleElement2Element, ScheduleElementTimings } from './interface.js'
import { getFirstExecution } from './resolver2.js'

export interface ExecutionTimesResult {
	executions: Record<string, number>
	errors: string[]
}

export function scheduleToExecutionTimes<T extends object>(
	schedule: Array<ScheduleElement2<T>>,
	datetime = Date.now(),
): ExecutionTimesResult {
	const executions: Record<string, number> = {}
	const errors: string[] = []

	const recurseElement = (el: ScheduleElement2<T>, start: DateTime, inheritTimes?: string[]) => {
		try {
			if (!el.triggers) {
				el.triggers = []
			}
			if (!el.triggers.length) {
				el.triggers.push({})
			}

			const firstResult = el.triggers
				.map((t) => ({
					result: getFirstExecution(!t.times ? { ...t, times: inheritTimes } : t, start),
					trigger: t,
				}))
				.filter(
					(r): r is { result: { execution: number }; trigger: ScheduleElementTimings } =>
						'execution' in r.result,
				)
				.reduce((a, b) => (a.result.execution < b.result.execution ? a : b))

			executions[el._id] = firstResult.result.execution

			if ('children' in el) {
				for (const child of el.children) {
					recurseElement(
						child,
						DateTime.fromMillis(firstResult.result.execution),
						firstResult.trigger.times ?? inheritTimes,
					)
				}
			}
		} catch (e) {
			errors.push(`${el._id}: ${e}`)
		}
	}

	for (const child of schedule) {
		recurseElement(child, DateTime.fromMillis(datetime))
	}

	return { executions, errors }
}

export function scheduleToFirstOrderedExecution<T extends object>(
	schedule: Array<ScheduleElement2<T>>,
	datetime = Date.now(),
): { executions: Record<string, number>; time: number; order: { _id: string; content: T }[]; errors: string[] } {
	const executionResult = scheduleToExecutionTimes(schedule, datetime)

	const contentMap = new Map<string, T>()
	const recurseElement = (elements: ScheduleElement2<T>[]) => {
		for (const el of elements) {
			if ('content' in el) {
				contentMap.set(el._id, el.content)
			}

			if ('children' in el) {
				recurseElement(el.children)
			}
		}
	}
	recurseElement(schedule)

	const timeToIds: Record<number, string[]> = {}
	for (const [id, t] of Object.entries(executionResult.executions)) {
		if (!timeToIds[t]) {
			timeToIds[t] = []
		}
		timeToIds[t].push(id)
	}
	const timeToContent: Record<number, ScheduleElement2Element<T>[]> = Object.fromEntries(
		Object.entries(timeToIds)
			.map(([t, ids]) => [
				t,
				ids.map((id) => ({ _id: id, content: contentMap.get(id) })).filter((n) => n.content),
			])
			.filter(([_, content]) => content.length),
	)
	const firstContentTs = parseInt(Object.keys(timeToContent).reduce((a, b) => (a < b ? a : b)))

	return {
		executions: executionResult.executions,
		errors: executionResult.errors,

		time: firstContentTs,
		order: timeToContent[firstContentTs],
	}
}
