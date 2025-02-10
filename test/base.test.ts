import { describe, expect, it } from 'vitest';
import { BaseApi } from '../src/base';
import { Fetcher } from '../src/fetcher';

class BaseTest extends BaseApi<'apotek'> {
	protected type = 'apotek' as const;

	interpolatePath = this.interpolatePath;
}

describe('base', () => {
	it.concurrent('interpolatePath()', async () => {
		const base = new BaseTest(new Fetcher());
		const path = base.interpolatePath(`/monitoring/klaim/{0}/{1}`, ['1', 2023]);

		expect(path).toBeTypeOf('string');
		expect(path).toBe('/monitoring/klaim/1/2023');
	});
});
