package org.kollappbackend.accounting.adapters.primary.rest.mapper;

import org.kollappbackend.accounting.adapters.primary.rest.model.BudgetAccountTO;
import org.kollappbackend.accounting.application.model.BudgetAccount;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = PostingMapper.class)
public interface BudgetAccountMapper {
    BudgetAccountTO mapBudgetAccountToBudgetAccountTO(BudgetAccount budgetAccount);
}
