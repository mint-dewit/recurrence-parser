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

export interface ScheduleElement {
	type: ScheduleType
	_id?: string
	audio?: boolean

	path?: string
	sort?: FolderSort

	input?: number
	duration?: number
	priority?: number

	days?: Array<number>
	weeks?: Array<number>
	dates?: Array<[string, string]>
	times?: Array<string>

	children?: Array<ScheduleElement>
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
