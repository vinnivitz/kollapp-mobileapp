import type { BudgetPostingDto } from './budget-posting.dto';

export type BudgetAccountDto = {
	id: number;
	postings: BudgetPostingDto[];
};
