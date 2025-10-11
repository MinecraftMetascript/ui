import fs from 'fs/promises';
import path from 'path';

const biomeRoot = './static/mcmeta/data/minecraft/worldgen/biome';
const biomeDir = await fs.readdir(biomeRoot);

const allBiomes: Record<string, string> = {};
for (const biomeFile of biomeDir) {
	const content = await fs.readFile(path.join(biomeRoot, biomeFile), 'utf-8');
	allBiomes[path.basename(biomeFile, '.json')] = JSON.parse(content);
}

await fs.writeFile('./static/1.21.8.biomes.json', JSON.stringify(allBiomes));

const noiseRoot = './static/mcmeta/data/minecraft/worldgen/noise';
const noiseDir = await fs.readdir(noiseRoot);

const allNoises: Record<string, string> = {};
for (const noiseFile of noiseDir) {
	const content = await fs.readFile(path.join(noiseRoot, noiseFile), 'utf-8');
	allNoises[path.basename(noiseFile, '.json')] = JSON.parse(content);
}

await fs.writeFile('./static/1.21.8.noise.json', JSON.stringify(allNoises));

const densityFnRoot = './static/mcmeta/data/minecraft/worldgen/density_function';
const densityFnDir = await fs.readdir(densityFnRoot);

const alldensityFns: Record<string, string> = {};

const addDensityFn = async (root: string, name: string) => {
	const p = path.join(root, name);
	if ((await fs.stat(p)).isDirectory()) {
		for (const child of await fs.readdir(p)) {
			addDensityFn(p, child);
		}
	} else {
		const content = await fs.readFile(p, 'utf-8');
		alldensityFns[path.basename(name, '.json')] = JSON.parse(content);
	}
};

for (const densityFnFile of densityFnDir) {
	await addDensityFn(densityFnRoot, densityFnFile);
}

await fs.writeFile('./static/1.21.8.density_functions.json', JSON.stringify(alldensityFns));
