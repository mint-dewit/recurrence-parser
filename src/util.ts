export class DateObj extends Date {
	getWeek (): number {
		let oneJan = new Date(this.getFullYear(),0,1)
		let millisecsInDay = 86400000

		let t = this.getTime() // current time
		t -= this.getTimezoneOffset() * 60000 // adjust for timezone
		t -= oneJan.getTime() // remove all before the start of the year (t = ms elapsed this year)
		t /= millisecsInDay // divide by ms/day => t = days elapsed this year
		t += oneJan.getDay() + 1 // account for the fact that newyears don't always start on the first day of week
		t = Math.floor(t)
		t /= 7 // divide by 7 to get the week no
		t = Math.ceil(t)

		return t
	}

	setWeek (week: number): DateObj {
		this.setFullYear(this.getFullYear(), 0, 1)
		this.setDate(-this.getDay() + 1)
		this.setDate((this.getDate() - 1) + week * 7 - 6)
		return this
	}
}
