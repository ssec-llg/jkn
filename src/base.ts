import { Config, Fetcher, SendOption, Type } from './fetcher.js';

export abstract class BaseApi<T extends Type = Type> {
	protected abstract readonly type: T;

	constructor(private readonly fetcher: Fetcher) {}

	protected send<R, M = unknown>(option: SendOption) {
		return this.fetcher.send<T, R, M>(this.type, option);
	}

	protected async getConfig(): Promise<Config> {
		return this.fetcher.getConfig();
	}

	protected async requiredConfig(...keys: (keyof Config)[]) {
		const config = await this.getConfig();
		for (const key of keys) {
			if (!config[key]) {
				const message = `The "${key}" config value must not be falsy for this request`;
				throw new Error(message);
			}
		}
		return config;
	}

	protected interpolatePath(path: `/${string}`, values: unknown[]) {
		return <`/${string}`>path.replace(/{\d+}/g, (substring) => {
			const index = parseInt(substring.match(/\d+/)?.[0] || '');
			return values[index] !== undefined ? String(values[index]) : substring;
		});
	}
}

type CacheKey = `${Type}${string}`;

export class CachedApi {
	private readonly cached = new Map<CacheKey, BaseApi>();

	constructor(private readonly fetcher: Fetcher) {}

	get<K extends CacheKey, V extends BaseApi>(
		key: K,
		Api: new (...args: ConstructorParameters<typeof BaseApi>) => V
	): V {
		let api = this.cached.get(key);
		if (!api) {
			api = new Api(this.fetcher);
			this.cached.set(key, api);
		}
		return api as V;
	}

	clear(): void {
		this.cached.clear();
	}
}
