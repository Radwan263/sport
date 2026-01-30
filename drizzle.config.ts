import { defineConfig } from "drizzle-kit";

// بنجيب الرابط من ملف .env
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

export default defineConfig({
  // ⚠️ تأكد إن مسار ملف السكيما صح
  // لو ملف schema.ts جوه فولدر shared خليها "./shared/schema.ts"
  // لو جوه فولدر drizzle سيبها زي ما هي
  schema: "./shared/schema.ts", 
  out: "./drizzle",
  
  // 👇 دي أهم حاجة غيرناها (من mysql لـ postgresql)
  dialect: "postgresql", 
  
  dbCredentials: {
    url: connectionString,
  },
});
