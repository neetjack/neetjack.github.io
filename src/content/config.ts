import { defineCollection, z } from "astro:content";

const postsCollection = defineCollection({
	// loader 将自动从 posts 目录加载 markdown 文件
	schema: z.object({
		title: z.string(),
		published: z.date(),
		updated: z.date().optional(),
		draft: z.boolean().optional().default(false),
		description: z.string().optional().default(""),
		image: z.string().optional().default(""),
		tags: z.array(z.string()).optional().default([]),
		category: z.string().optional().nullable().default(""),
		lang: z.string().optional().default(""),

		/* For internal use */
		prevTitle: z.string().default(""),
		prevSlug: z.string().default(""),
		nextTitle: z.string().default(""),
		nextSlug: z.string().default(""),
	}),
});

const specCollection = defineCollection({
	// loader 将自动从 spec 目录加载 markdown 文件
	schema: z.object({}).passthrough(),
});

export const collections = {
	posts: postsCollection,
	spec: specCollection,
};
