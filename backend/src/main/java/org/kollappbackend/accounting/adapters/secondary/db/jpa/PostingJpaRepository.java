package org.kollappbackend.accounting.adapters.secondary.db.jpa;

import org.kollappbackend.accounting.application.model.Posting;
import org.springframework.data.jpa.repository.JpaRepository;


public interface PostingJpaRepository extends JpaRepository<Posting, Long> { }
