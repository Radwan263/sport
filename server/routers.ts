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

  reviews: router({
    list: publicProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => {
        const { getReviewsByProductId, getAverageRating } = await import("./db");
        const reviewsData = await getReviewsByProductId(input.productId);
        const averageRating = await getAverageRating(input.productId);
        
        return {
          reviews: reviewsData,
          averageRating,
        };
      }),
    
    create: protectedProcedure
      .input(z.object({
        productId: z.number(),
        rating: z.number().min(1).max(5),
        title: z.string().optional(),
        comment: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createReview } = await import("./db");
        return await createReview({
          productId: input.productId,
          userId: ctx.user.id,
          rating: input.rating,
          title: input.title,
          comment: input.comment,
        });
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        rating: z.number().min(1).max(5).optional(),
        title: z.string().optional(),
        comment: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { updateReview } = await import("./db");
        return await updateReview(input.id, {
          rating: input.rating,
          title: input.title,
          comment: input.comment,
        });
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { deleteReview } = await import("./db");
        return await deleteReview(input.id);
      }),
    
    like: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { addReviewLike } = await import("./db");
        return await addReviewLike(input.id, ctx.user.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
