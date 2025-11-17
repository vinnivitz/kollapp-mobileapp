import { beforeEach, describe, expect, it, vi } from 'vitest';
import { object, string } from 'yup';

import { appendToBody, clickableElement, clone, debounce, getObjectFromSchema } from '$lib/utility';

describe('ui.utility', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		document.body.innerHTML = '';
	});

	describe('clickableElement', () => {
		it('should add clickable attributes and event listener', () => {
			const element = document.createElement('div');
			const callback = vi.fn();

			const { destroy } = clickableElement(element, callback);

			expect(element.getAttribute('role')).toBe('button');
			expect(element.getAttribute('tabindex')).toBe('0');
			expect(element.classList.contains('ion-activatable')).toBe(true);
			expect(element.classList.contains('ripple-parent')).toBe(true);
			expect(element.querySelector('ion-ripple-effect')).toBeTruthy();

			element.click();
			expect(callback).toHaveBeenCalledTimes(1);

			destroy();
		});

		it('should remove event listener on destroy', () => {
			const element = document.createElement('div');
			const callback = vi.fn();

			const { destroy } = clickableElement(element, callback);

			destroy();

			element.click();
			expect(callback).not.toHaveBeenCalled();
		});
	});

	describe('appendToBody', () => {
		it('should append element to body', () => {
			const element = document.createElement('div');
			element.id = 'test-element';

			const result = appendToBody(element);

			expect(document.body.contains(element)).toBe(true);
			expect(result).toBeDefined();
		});

		it('should not append if element already in body', () => {
			const element = document.createElement('div');
			document.body.append(element);

			const result = appendToBody(element);

			expect(result).toBeUndefined();
		});

		it('should remove element on destroy', () => {
			const element = document.createElement('div');

			const result = appendToBody(element);
			expect(document.body.contains(element)).toBe(true);

			result?.destroy();
			expect(document.body.contains(element)).toBe(false);
		});
	});

	describe('debounce', () => {
		it('should debounce function calls', () => {
			vi.useFakeTimers();
			const function_ = vi.fn();
			const debouncedFunction = debounce(function_, 500);

			debouncedFunction('arg1');
			debouncedFunction('arg2');
			debouncedFunction('arg3');

			expect(function_).not.toHaveBeenCalled();

			vi.advanceTimersByTime(500);

			expect(function_).toHaveBeenCalledTimes(1);
			expect(function_).toHaveBeenCalledWith('arg3');

			vi.useRealTimers();
		});

		it('should reset timer on subsequent calls', () => {
			vi.useFakeTimers();
			const function_ = vi.fn();
			const debouncedFunction = debounce(function_, 500);

			debouncedFunction('arg1');
			vi.advanceTimersByTime(300);
			debouncedFunction('arg2');
			vi.advanceTimersByTime(300);
			expect(function_).not.toHaveBeenCalled();

			vi.advanceTimersByTime(200);
			expect(function_).toHaveBeenCalledTimes(1);
			expect(function_).toHaveBeenCalledWith('arg2');

			vi.useRealTimers();
		});

		it('should allow multiple executions after delay', () => {
			vi.useFakeTimers();
			const function_ = vi.fn();
			const debouncedFunction = debounce(function_, 500);

			debouncedFunction('arg1');
			vi.advanceTimersByTime(500);
			expect(function_).toHaveBeenCalledTimes(1);

			debouncedFunction('arg2');
			vi.advanceTimersByTime(500);
			expect(function_).toHaveBeenCalledTimes(2);

			vi.useRealTimers();
		});
	});

	describe('getObjectFromSchema', () => {
		it('should get default object from schema', () => {
			const schema = object({
				email: string().default('john@example.com'),
				name: string().default('John')
			});

			const result = getObjectFromSchema(schema);

			expect(result).toEqual({
				email: 'john@example.com',
				name: 'John'
			});
		});

		it('should handle empty defaults', () => {
			const schema = object({
				age: string(),
				name: string()
			});

			const result = getObjectFromSchema(schema);

			expect(result).toEqual({
				age: undefined,
				name: undefined
			});
		});
	});

	describe('clone', () => {
		it('should deep clone an object', () => {
			const original = {
				address: {
					city: 'New York',
					zip: '10001'
				},
				hobbies: ['reading', 'gaming'],
				name: 'John'
			};

			const cloned = clone(original);

			expect(cloned).toEqual(original);
			expect(cloned).not.toBe(original);
			expect(cloned.address).not.toBe(original.address);
			expect(cloned.hobbies).not.toBe(original.hobbies);
		});

		it('should clone arrays', () => {
			const original = [1, 2, { a: 3 }];
			const cloned = clone(original);

			expect(cloned).toEqual(original);
			expect(cloned).not.toBe(original);
			expect(cloned[2]).not.toBe(original[2]);
		});

		it('should clone primitive values', () => {
			expect(clone('string')).toBe('string');
			expect(clone(123)).toBe(123);
			expect(clone(true)).toBe(true);
			expect(clone({})).toBe({});
		});
	});
});
