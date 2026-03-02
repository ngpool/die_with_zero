export const LifeExpectancyService = {
	calculateRemainingTime(dateOfBirth: string, lifeExpectancyYears: number) {
		const now = new Date();
		// Robust parsing: "YYYY-MM-DD"
		const parts = dateOfBirth.split("-");
		if (parts.length !== 3) return null;

		const dob = new Date(
			parseInt(parts[0], 10),
			parseInt(parts[1], 10) - 1,
			parseInt(parts[2], 10),
		);

		const deathDate = new Date(dob);
		deathDate.setFullYear(dob.getFullYear() + lifeExpectancyYears);

		const diffMs = deathDate.getTime() - now.getTime();

		if (diffMs <= 0) {
			return {
				years: 0,
				days: 0,
				hours: 0,
				minutes: 0,
				seconds: 0,
				isExpired: true,
			};
		}

		const totalSeconds = Math.floor(diffMs / 1000);
		const seconds = totalSeconds % 60;
		const minutes = Math.floor(totalSeconds / 60) % 60;
		const hours = Math.floor(totalSeconds / 3600) % 24;
		const days = Math.floor(totalSeconds / 86400) % 365;
		const years = Math.floor(totalSeconds / (86400 * 365.25));

		return {
			years,
			days,
			hours,
			minutes,
			seconds,
			isExpired: false,
		};
	},
};
