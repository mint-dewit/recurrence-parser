// NOTE: algorithms pseudocode taken from wikipedia: https://en.wikipedia.org/wiki/ISO_week_date

export class DateObj extends Date {
	getWeek(): number {
		const p = (y: number) => (y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400)) % 7 // assuming y >= 0
		const weeks = (year: number) => 52 + (p(year) === 4 || p(year - 1) === 3 ? 1 : 0)

		const year = this.getFullYear()
		const oneJan = new Date(year, 0, 1)
		// step 0: ordinal date or day of year
		let ordDate =
			(this.getTime() -
				this.getTimezoneOffset() * 60000 -
				(oneJan.getTime() - oneJan.getTimezoneOffset() * 60000)) /
				86400000 +
			1

		// step 1: substract day of week from ordinal date
		ordDate -= this.getDay()

		// step 2: add 10
		ordDate += 10

		// step 3: divide by 7
		ordDate /= 7

		// step 4: ignore remainder
		ordDate = Math.floor(ordDate)

		if (ordDate < 1) {
			return weeks(year - 1) // last years last week
		} else if (ordDate > weeks(year)) {
			return 1 // first week
		} else {
			return ordDate
		}
	}

	setWeek(week: number): DateObj {
		const jan4 = new Date(this.getFullYear(), 0, 4)
		const days = (y: number) => {
			const jan1 = new Date(y, 0, 1)
			const dec31 = new Date(y, 11, 31)
			return (
				(dec31.getTime() -
					dec31.getTimezoneOffset() * 60000 -
					(jan1.getTime() - jan1.getTimezoneOffset() * 60000)) /
					86400000 +
				1
			)
		}

		let y = this.getFullYear()
		const d = week * 7 - (jan4.getDay() + 3)
		let doy
		if (d < 1) {
			y--
			doy = d + days(y - 1)
		} else if (d > days(y)) {
			y++
			doy = d - days(y)
		} else {
			doy = d
		}

		this.setTime(new Date(y, 0, 1).getTime() + doy * 86400000)

		return this
	}
}
