export const LifeExpectancyService = {
	calculateRemainingTime(dateOfBirth: string, lifeExpectancyYears: number) {
		const now = new Date();
		const dob = new Date(dateOfBirth);
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

		const seconds = Math.floor((diffMs / 1000) % 60);
		const minutes = Math.floor((diffMs / 1000 / 60) % 60);
		const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
		const days = Math.floor((diffMs / (1000 * 60 * 60 * 24)) % 365.25);
		const years = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));

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
