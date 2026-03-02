import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { userProfile } from "../db/schema";
import { Platform } from "react-native";

const STORAGE_KEY = "dwz_user_profile";

export const UserProfileRepository = {
	async getProfile() {
		if (Platform.OS === "web") {
			const data = localStorage.getItem(STORAGE_KEY);
			return data ? JSON.parse(data) : null;
		}
		const result = await db.select().from(userProfile).limit(1);
		return result[0] || null;
	},

	async createOrUpdateProfile(data: {
		name: string;
		dateOfBirth: string;
		lifeExpectancyYears: number;
		gender?: string;
	}) {
		if (Platform.OS === "web") {
			const profile = { id: 1, ...data, updatedAt: new Date().toISOString() };
			localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
			return [profile];
		}
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
