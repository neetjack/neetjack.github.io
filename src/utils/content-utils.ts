import { type CollectionEntry, getCollection } from "astro:content";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { getCategoryUrl } from "@utils/url-utils.ts";
import { postLanguages } from "../config/languages";

// Extract base ID and variant (e.g. 'folder/my-post-en' -> baseId: 'folder/my-post', variant: 'en')
export function parsePostId(id: string) {
    const variantsList = Object.keys(postLanguages.variants).join('|');
    const regex = new RegExp(`^(.*?)-(${variantsList})$`, 'i');
    const match = id.match(regex);
    if (match) {
        return {
            baseId: match[1],
            variant: match[2].toLowerCase(),
            isVariant: true
        };
    }
    return {
        baseId: id,
        variant: null, // Default
        isVariant: false
    };
}

// Retrieve posts and sort them by publication date
async function getRawSortedPosts() {
	const allBlogPosts = await getCollection("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const sorted = allBlogPosts.sort((a, b) => {
		const dateA = new Date(a.data.published);
		const dateB = new Date(b.data.published);
		return dateA > dateB ? -1 : 1;
	});

	return sorted;
}

// Get all posts including language variants (used for generating all routes)
export async function getAllSortedPosts() {
	return await getRawSortedPosts();
}

// Get main posts excluding language variants (used for feeds, pagination, archives)
export async function getMainSortedPosts() {
	const sorted = await getRawSortedPosts();
	
	// Group posts by baseId
	const groups = new Map<string, typeof sorted>();
	for (const post of sorted) {
		const parsed = parsePostId(post.id);
		if (!groups.has(parsed.baseId)) {
			groups.set(parsed.baseId, []);
		}
		groups.get(parsed.baseId)!.push(post);
	}

	// For each group, select the main post to display
	const mainPosts = [];
	for (const [baseId, postsInGroup] of groups.entries()) {
		// Try to find the actual base post (no suffix)
		const basePost = postsInGroup.find(p => !parsePostId(p.id).isVariant);
		if (basePost) {
			mainPosts.push(basePost);
		} else {
			// If no base post exists, pick the 'en' variant, or just the first one
			const defaultVariant = postsInGroup.find(p => parsePostId(p.id).variant === 'en');
			mainPosts.push(defaultVariant || postsInGroup[0]);
		}
	}

	// Re-sort mainPosts by date
	mainPosts.sort((a, b) => {
		const dateA = new Date(a.data.published);
		const dateB = new Date(b.data.published);
		return dateA > dateB ? -1 : 1;
	});

	for (let i = 1; i < mainPosts.length; i++) {
		mainPosts[i].data.nextSlug = mainPosts[i - 1].id;
		mainPosts[i].data.nextTitle = mainPosts[i - 1].data.title;
	}
	for (let i = 0; i < mainPosts.length - 1; i++) {
		mainPosts[i].data.prevSlug = mainPosts[i + 1].id;
		mainPosts[i].data.prevTitle = mainPosts[i + 1].data.title;
	}

	return mainPosts;
}

// getSortedPosts is kept for backward compatibility and routes, but uses main posts
export async function getSortedPosts() {
	return await getMainSortedPosts();
}

export type PostForList = {
	slug: string;
	data: CollectionEntry<"posts">["data"];
};

export async function getSortedPostsList(): Promise<PostForList[]> {
	const mainPosts = await getMainSortedPosts();

	// delete post.body
	const sortedPostsList = mainPosts.map((post) => ({
		slug: post.id,
		data: post.data,
	}));

	return sortedPostsList;
}

export type Tag = {
	name: string;
	count: number;
};

export async function getTagList(): Promise<Tag[]> {
	const mainPosts = await getMainSortedPosts();

	const countMap: { [key: string]: number } = {};
	mainPosts.forEach((post) => {
		post.data.tags.forEach((tag: string) => {
			if (!countMap[tag]) countMap[tag] = 0;
			countMap[tag]++;
		});
	});

	// sort tags
	const keys: string[] = Object.keys(countMap).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	return keys.map((key) => ({ name: key, count: countMap[key] }));
}

export type Category = {
	name: string;
	count: number;
	url: string;
};

export async function getCategoryList(): Promise<Category[]> {
	const mainPosts = await getMainSortedPosts();
	const count: { [key: string]: number } = {};
	mainPosts.forEach((post) => {
		if (!post.data.category) {
			const ucKey = i18n(I18nKey.uncategorized);
			count[ucKey] = count[ucKey] ? count[ucKey] + 1 : 1;
			return;
		}

		const categoryName =
			typeof post.data.category === "string"
				? post.data.category.trim()
				: String(post.data.category).trim();

		count[categoryName] = count[categoryName] ? count[categoryName] + 1 : 1;
	});

	const lst = Object.keys(count).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	const ret: Category[] = [];
	for (const c of lst) {
		ret.push({
			name: c,
			count: count[c],
			url: getCategoryUrl(c),
		});
	}
	return ret;
}
