import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { todoItems } from "../db/schema";
import { Platform } from "react-native";

const STORAGE_KEY = "dwz_goals";

export type Goal = {
    id: number;
    title: string;
    description?: string;
    dueDate?: string; // YYYY-MM-DD
    targetAmount?: number; // optional monetary target
    isCompleted: boolean;
    createdAt: string;
};

export const GoalRepository = {
    async getAllGoals(): Promise<Goal[]> {
        if (Platform.OS === "web") {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        }
        const rows = await db.select().from(todoItems).orderBy(todoItems.createdAt);
        return rows.map((r) => ({
            id: r.id,
            title: r.title,
            description: r.description ?? undefined,
            dueDate: r.dueDate ?? undefined,
            isCompleted: r.isCompleted ?? false,
            createdAt: r.createdAt?.toISOString() ?? new Date().toISOString(),
        }));
    },

    async createGoal(data: { title: string; description?: string; dueDate?: string; targetAmount?: number }): Promise<Goal> {
        if (Platform.OS === "web") {
            const goals = await this.getAllGoals();
            const newGoal: Goal = {
                id: Date.now(),
                ...data,
                isCompleted: false,
                createdAt: new Date().toISOString(),
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify([...goals, newGoal]));
            return newGoal;
        }
        const rows = await db.insert(todoItems).values({
            title: data.title,
            description: data.description,
            dueDate: data.dueDate,
        }).returning();
        const r = rows[0];
        return {
            id: r.id,
            title: r.title,
            description: r.description ?? undefined,
            dueDate: r.dueDate ?? undefined,
            isCompleted: r.isCompleted ?? false,
            createdAt: r.createdAt?.toISOString() ?? new Date().toISOString(),
        };
    },

    async toggleGoal(id: number, isCompleted: boolean): Promise<void> {
        if (Platform.OS === "web") {
            const goals = await this.getAllGoals();
            const updated = goals.map((g) =>
                g.id === id ? { ...g, isCompleted } : g,
            );
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return;
        }
        await db.update(todoItems).set({ isCompleted }).where(eq(todoItems.id, id));
    },

    async deleteGoal(id: number): Promise<void> {
        if (Platform.OS === "web") {
            const goals = await this.getAllGoals();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(goals.filter((g) => g.id !== id)));
            return;
        }
        await db.delete(todoItems).where(eq(todoItems.id, id));
    },
};
