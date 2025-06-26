import type { AccountPostingDto } from './account-posting.dto';

export type BudgetAccountDto = {
	id: number;
	postings: AccountPostingDto[];
};
