import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { getUserProfile, upsertUserProfile } from "./db";
import { z } from "zod";

const profileSchema = z.object({
  fullName: z.string().optional(),
  primaryPhone: z.string().optional(),
  backupPhone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  preferredSize: z.string().optional(),
  weight: z.string().optional(),
});

type ProfileInput = z.infer<typeof profileSchema>;

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const profile = await getUserProfile(ctx.user.id);
      return profile || null;
    }),
    update: protectedProcedure
      .input(profileSchema)
      .mutation(async ({ ctx, input }) => {
        const profile = await upsertUserProfile({
          userId: ctx.user.id,
          ...input,
        });
        return profile;
      }),
  }),
});

export type AppRouter = typeof appRouter;
