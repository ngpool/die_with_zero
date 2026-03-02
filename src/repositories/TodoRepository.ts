import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { todoItems } from "../db/schema";
import { Platform } from "react-native";

const STORAGE_KEY = "dwz_todos";

export const TodoRepository = {
    async getAllTodos() {
        if (Platform.OS === "web") {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        }
        return db.select().from(todoItems).orderBy(todoItems.createdAt);
    },

    async createTodo(data: { title: string; description?: string }) {
        if (Platform.OS === "web") {
            const todos = await this.getAllTodos();
            const newTodo = {
                id: Date.now(),
                ...data,
                isCompleted: false,
                createdAt: new Date().toISOString(),
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify([...todos, newTodo]));
            return [newTodo];
        }
        return db.insert(todoItems).values(data).returning();
    },

    async toggleTodoCompletion(id: number, isCompleted: boolean) {
        if (Platform.OS === "web") {
            const todos = await this.getAllTodos();
            const updated = todos.map((t: any) =>
                t.id === id ? { ...t, isCompleted, updatedAt: new Date().toISOString() } : t,
            );
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return;
        }
        return db
            .update(todoItems)
            .set({ isCompleted, updatedAt: new Date() })
            .where(eq(todoItems.id, id));
    },

    async deleteTodo(id: number) {
        if (Platform.OS === "web") {
            const todos = await this.getAllTodos();
            const filtered = todos.filter((t: any) => t.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
            return;
        }
        return db.delete(todoItems).where(eq(todoItems.id, id));
    },
};
