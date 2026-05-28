// LQIP 方案来源: https://blog.cosine.ren/post/astro-lqip-implementation

import sharp from "sharp";
import { glob } from "glob";
import fs from "fs/promises";
import path from "path";

const SRC_DIR = "src";
const OUTPUT_FILE = "src/constants/lqips.json";

interface RgbColor {
	r: number;
	g: number;
	b: number;
}

type LqipMap = Record<string, string>;

function rgbToHex(color: RgbColor): string {
	const hex = (n: number) => n.toString(16).padStart(2, "0");
	return `#${hex(color.r)}${hex(color.g)}${hex(color.b)}`;
}

async function processImage(imagePath: string): Promise<string | null> {
	try {
		const { data, info } = await sharp(imagePath)
			.resize(2, 2, { fit: "fill" })
			.raw()
			.toBuffer({ resolveWithObject: true });

		const channels = info.channels;
		const colors: RgbColor[] = [];

		for (let i = 0; i < 4; i++) {
			const offset = i * channels;
			colors.push({
				r: data[offset],
				g: data[offset + 1],
				b: data[offset + 2],
			});
		}

		// 使用 corners[0], [1], [3] 生成 135deg 斜向渐变
		const compact = `${rgbToHex(colors[0]).slice(1)}${rgbToHex(colors[1]).slice(1)}${rgbToHex(colors[3]).slice(1)}`;
		return compact;
	} catch (error) {
		console.error(`Error processing ${imagePath}:`, error);
		return null;
	}
}

function filePathToKey(filePath: string): string {
	const relative = path.relative(SRC_DIR, filePath).replace(/\\/g, "/");
	return relative;
}

async function main() {
	const files = await glob("src/**/*.{png,jpg,jpeg,webp,avif}");

	if (files.length === 0) {
		console.log("No image files found.");
		return;
	}

	console.log(`Found ${files.length} images. Processing...`);

	const lqips: LqipMap = {};
	let processed = 0;

	for (const file of files) {
		const filePath = path.resolve(file);
		process.stdout.write(`\rProcessing ${processed + 1}/${files.length}...`);
		const compact = await processImage(filePath);
		if (compact !== null) {
			const key = filePathToKey(file);
			lqips[key] = compact;
			processed++;
		}
	}

	const dir = path.dirname(OUTPUT_FILE);
	await fs.mkdir(dir, { recursive: true });
	await fs.writeFile(OUTPUT_FILE, JSON.stringify(lqips, null, 2), "utf-8");

	console.log(
		`\nDone! Processed ${processed}/${files.length} images. Output: ${OUTPUT_FILE}`,
	);
}

main();
