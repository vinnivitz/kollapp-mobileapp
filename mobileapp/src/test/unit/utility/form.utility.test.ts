import { beforeEach, describe, expect, it, vi } from 'vitest';
import { object, string } from 'yup';

vi.mock('@ionic/core', () => ({
	loadingController: {
		create: vi.fn()
	}
}));

describe('form.utility', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('yup schema validation', () => {
		it('should validate successfully with valid data', async () => {
			const schema = object({ name: string().required() });
			const data = { name: 'John' };

			await expect(schema.validate(data)).resolves.toEqual(data);
		});

		it('should throw validation error with invalid data', async () => {
			const schema = object({ name: string().required('Name is required') });
			const data = { name: '' };

			await expect(schema.validate(data)).rejects.toThrow();
		});

		it('should validate email format', async () => {
			const schema = object({
				email: string().email('Invalid email').required()
			});

			await expect(schema.validate({ email: 'test@example.com' })).resolves.toBeTruthy();
			await expect(schema.validate({ email: 'invalid' })).rejects.toThrow();
		});

		it('should validate nested objects', async () => {
			const schema = object({
				user: object({
					name: string().required('Name is required')
				})
			});

			await expect(schema.validate({ user: { name: 'John' } })).resolves.toBeTruthy();
			await expect(schema.validate({ user: { name: '' } })).rejects.toThrow();
		});

		it('should validate multiple fields', async () => {
			const schema = object({
				email: string().email().required(),
				name: string().required()
			});

			await expect(schema.validate({ email: 'john@example.com', name: 'John' })).resolves.toBeTruthy();
		});
	});
});
