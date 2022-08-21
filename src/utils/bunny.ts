const BunnyStorage = require('bunnycdn-storage').default;

export const bunnyStorage = new BunnyStorage(
	process.env.BUNNY_CDN_KEY,
	`${process.env.STORAGE_NAME}/${process.env.NEXT_PUBLIC_STORAGE_FOLDER}`
);
