export class DateObj extends Date {
	getWeek (): number {
		let oneJan = new Date(this.getFullYear(),0,1)
		console.log('oneJan day', oneJan.getDay())
		if (oneJan.getDay() > 4) {
			oneJan.setDate(8 - oneJan.getDay())
		} else {
			oneJan.setDate(-oneJan.getDay() + 1)
		}
		console.log('1st week', oneJan)

		let millisecsInDay = 86400000

		let t = this.getTime() // current time
		t -= this.getTimezoneOffset() * 60000 // adjust for timezone
		t -= oneJan.getTime() // remove all before the start of the first week (t = ms elapsed this year)
		t /= millisecsInDay // divide by ms/day => t = days elapsed this year
		t += oneJan.getDay() + 1 // account for the fact that newyears don't always start on the first day of week
		t = Math.floor(t)
		if (t < 0) return 53
		console.log('days', t)
		t /= 7 // divide by 7 to get the week no
		console.log('weeks', t)
		t = Math.ceil(t)

		return t
	}

	setWeek (week: number): DateObj {
		// set to jan 1st
		this.setFullYear(this.getFullYear(), 0, 1)
		this.setHours(0, 0, 0, 0)

		// set to start of week 1
		if (this.getDay() > 4) {
			this.setDate(8 - this.getDay())
		} else {
			this.setDate(-this.getDay() + 1)
		}

		this.setDate((this.getDate() - 1) + week * 7 - 6)
		return this
	}
}
