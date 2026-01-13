import { eq, like, and, SQL } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, InsertProduct, Product, InsertOrder, Order, InsertUserProfile, UserProfile, InsertCategory, Category, categories, orders, products, userProfiles } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get all products with optional filtering
 */
export async function getProducts(filters?: {
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions: SQL[] = [];

  if (filters?.category) {
    conditions.push(eq(products.category, filters.category));
  }

  if (filters?.search) {
    conditions.push(like(products.name, `%${filters.search}%`));
  }

  let query: any = db.select().from(products);

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.offset(filters.offset);
  }

  return await query;
}

/**
 * Get a single product by ID
 */
export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Create a new product
 */
export async function createProduct(product: InsertProduct) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(products).values(product);
  return result;
}

/**
 * Update a product
 */
export async function updateProduct(id: number, updates: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) return undefined;

  return db.update(products).set(updates).where(eq(products.id, id));
}

/**
 * Delete a product
 */
export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  return db.delete(products).where(eq(products.id, id));
}

/**
 * Create a new order
 */
export async function createOrder(order: InsertOrder) {
  const db = await getDb();
  if (!db) return undefined;

  return db.insert(orders).values(order);
}

/**
 * Get orders by user ID
 */
export async function getOrdersByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(orders).where(eq(orders.userId, userId));
}

/**
 * Get user profile
 */
export async function getUserProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Upsert user profile
 */
export async function upsertUserProfile(profile: InsertUserProfile) {
  const db = await getDb();
  if (!db) return undefined;

  if (!profile.userId) {
    throw new Error("User ID is required for upsert");
  }

  return db
    .insert(userProfiles)
    .values(profile)
    .onDuplicateKeyUpdate({
      set: profile,
    });
}

/**
 * Get all categories
 */
export async function getCategories() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(categories);
}

/**
 * Create a new category
 */
export async function createCategory(category: InsertCategory) {
  const db = await getDb();
  if (!db) return undefined;

  return db.insert(categories).values(category);
}
