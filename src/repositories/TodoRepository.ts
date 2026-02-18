import { desc, eq } from "drizzle-orm";
import { db } from "../db/client";
import { todoItems } from "../db/schema";

export const TodoRepository = {
    async getAllTodos() {
        return db.select().from(todoItems).orderBy(desc(todoItems.createdAt));
    },

    async createTodo(data: {
        title: string;
        description?: string;
        dueDate?: string;
        priority?: number;
    }) {
        return db.insert(todoItems).values(data).returning();
    },

    async toggleTodoCompletion(id: number, isCompleted: boolean) {
        return db
            .update(todoItems)
            .set({ isCompleted, updatedAt: new Date() })
            .where(eq(todoItems.id, id))
            .returning();
    },

    async deleteTodo(id: number) {
        return db.delete(todoItems).where(eq(todoItems.id, id)).returning();
    },
};
