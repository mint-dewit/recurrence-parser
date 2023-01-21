import { TimelineObject } from 'superfly-timeline'

export enum ScheduleType {
	Group = 'group',
	Folder = 'folder',
	File = 'file',
	Input = 'input',
}

export enum LogLevel {
	Production = 1,
	Debug = 0,
}

// export interface ScheduleElement extends ScheduleElementTimings {
// 	type: ScheduleType
// 	_id?: string
// 	audio?: boolean

// 	path?: string
// 	sort?: FolderSort

// 	input?: number
// 	duration?: number
// 	priority?: number

// 	children?: Array<ScheduleElement>
// }
export type ScheduleElement = GroupElement | LiveElement | FolderElement | FileElement

export interface GroupElement extends ScheduleElementTimings, CommonScheduleElement {
	type: ScheduleType.Group

	children: Array<ScheduleElement>
}

export interface LiveElement extends ScheduleElementTimings, CommonScheduleElement {
	type: ScheduleType.Input

	input: number
	duration: number
	audio?: boolean
}

export interface FolderElement extends ScheduleElementTimings, CommonScheduleElement {
	type: ScheduleType.Folder

	path: string
	sort?: FolderSort
	audio?: boolean
}

export interface FileElement extends ScheduleElementTimings, CommonScheduleElement {
	type: ScheduleType.File
	audio?: boolean

	path: string
}

export interface CommonScheduleElement {
	type: ScheduleType
	_id?: string
	priority?: number
}

export interface ScheduleElementTimings {
	days?: Array<number>
	weeks?: Array<number>
	dates?: Array<[string, string]>
	times?: Array<string>
}

export type ScheduleElement2<T extends object> = ScheduleElement2Group<T> | ScheduleElement2Element<T>

export interface ScheduleElement2Group<T extends object> extends ScheduleElement2Common {
	triggers: ScheduleElementTimings[]

	children: ScheduleElement2<T>[]
}

export interface ScheduleElement2Element<T extends object> extends ScheduleElement2Common {
	triggers: ScheduleElementTimings[]

	content: T
}

export interface ScheduleElement2Common {
	_id: string
}

export interface BuildTimelineResult {
	start: number
	end: number
	timeline: Array<TimelineObject>
	readableTimeline: Array<ResolvedElement>
}

export interface ResolvedElement {
	label: string
	start: number
	duration: number
}

export enum LiveMode {
	CasparCG = 'casparcg',
	ATEM = 'atem',
}
export enum FolderSort {
	NameAsc = 'name_asc',
	NameDesc = 'name_desc',
	DateAsc = 'date_asc',
	DateDesc = 'date_desc',
}
