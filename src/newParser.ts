import { ScheduleElement2 } from './interface'
import { getFirstExecution } from './resolver'
import { DateObj } from './util'

export interface ExecutionTimesResult {
	executions: Record<string, number>
	errors: string[]
}

export function scheduleToExecutionTimes<T extends object>(
	schedule: Array<ScheduleElement2<T>>,
	datetime = Date.now()
): ExecutionTimesResult {
	const executions: Record<string, number> = {}
	const errors: string[] = []

	const recurseElement = (el: ScheduleElement2<T>, start: DateObj) => {
		try {
			if (!el.triggers) el.triggers = []
			if (!el.triggers.length) el.triggers.push({})

			const executionTime = el.triggers.map((t) => getFirstExecution(t, start)).reduce((a, b) => (a < b ? a : b))

			executions[el._id] = executionTime

			if ('children' in el) {
				for (const child of el.children) {
					recurseElement(child, new DateObj(executionTime))
				}
			}
		} catch (e) {
			errors.push(el._id)
		}
	}

	for (const child of schedule) {
		recurseElement(child, new DateObj(datetime))
	}

	return { executions, errors }
}
