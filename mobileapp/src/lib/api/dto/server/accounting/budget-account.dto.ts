import type { AccountPostingDto } from './account-posting.dto';

/**
 * Data Transfer Object for budget account information.
 */
export type BudgetAccountDto = {
	id: number;
	postings: AccountPostingDto[];
};
