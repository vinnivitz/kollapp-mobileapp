package org.kollappbackend.accounting.application.repository;

import org.jmolecules.architecture.hexagonal.SecondaryPort;
import org.kollappbackend.accounting.application.model.Posting;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@SecondaryPort
@Repository
public interface PostingRepository {
    Optional<Posting> findById(long postingId);

    Posting save(Posting posting);

    void deleteById(long postingId);
}
