import * as deepslate from 'deepslate';

export const loadAssets = async (assetRoot: string) => {
	const noises = await fetch(assetRoot + '/1.21.8.noise.json').then((r) => r.json());
	for (const [name, noiseDef] of Object.entries(noises)) {
		deepslate.WorldgenRegistries.NOISE.register(
			deepslate.Identifier.parse(`minecraft:${name}`),
			noiseDef as deepslate.NoiseParameters
		);
	}
	const densityFunctions = await fetch(assetRoot + '/1.21.8.density_functions.json').then((r) =>
		r.json()
	);
	for (const [name, densityFn] of Object.entries(densityFunctions)) {
		deepslate.WorldgenRegistries.DENSITY_FUNCTION.register(
			deepslate.Identifier.parse(`minecraft:${name}`),
			deepslate.DensityFunction.fromJson(densityFn)
		);
	}
	const biomes = await fetch(assetRoot + '/1.21.8.biomes.json').then((r) => r.json());
	for (const [name, biome] of Object.entries(biomes)) {
		deepslate.WorldgenRegistries.BIOME.register(
			deepslate.Identifier.parse(`minecraft:${name}`),
			deepslate.BiomeSource.fromJson(biome)
		);
	}

	deepslate.WorldgenRegistries.NOISE_SETTINGS;
	deepslate.WorldgenRegistries.SURFACE_NOISE;
	deepslate.WorldgenRegistries.SURFACE_SECONDARY_NOISE;
	deepslate.WorldgenRegistries.DENSITY_FUNCTION;
};
