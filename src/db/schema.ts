import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const userProfile = sqliteTable("user_profile", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
	dateOfBirth: text("date_of_birth").notNull(), // ISO string YYYY-MM-DD
	lifeExpectancyYears: integer("life_expectancy_years").notNull(),
	gender: text("gender"),
	createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
		() => new Date(),
	),
	updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
		() => new Date(),
	),
});

export const todoItems = sqliteTable("todo_items", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	title: text("title").notNull(),
	description: text("description"),
	isCompleted: integer("is_completed", { mode: "boolean" }).default(false),
	dueDate: text("due_date"), // ISO string
	priority: integer("priority").default(0),
	createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
		() => new Date(),
	),
	updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
		() => new Date(),
	),
});
