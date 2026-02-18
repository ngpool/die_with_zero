import { eq } from "drizzle-orm";
import { db } from "./client";
import { userProfile } from "./schema";

export const UserProfileRepository = {
	async getProfile() {
		const result = await db.select().from(userProfile).limit(1);
		return result[0] || null;
	},

	async createOrUpdateProfile(data: {
		name: string;
		dateOfBirth: string;
		lifeExpectancyYears: number;
		gender?: string;
	}) {
		const existing = await this.getProfile();
		if (existing) {
			return db
				.update(userProfile)
				.set({ ...data, updatedAt: new Date() })
				.where(eq(userProfile.id, existing.id))
				.returning();
		}
		return db.insert(userProfile).values(data).returning();
	},
};
