import { DateTime } from 'luxon'
import { ScheduleElement2, ScheduleElementTimings } from './interface.js'
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
