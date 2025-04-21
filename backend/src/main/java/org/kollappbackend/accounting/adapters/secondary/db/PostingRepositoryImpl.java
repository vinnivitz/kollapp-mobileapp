package org.kollappbackend.accounting.adapters.secondary.db;

import org.kollappbackend.accounting.adapters.secondary.db.jpa.PostingJpaRepository;
import org.kollappbackend.accounting.application.model.Posting;
import org.kollappbackend.accounting.application.repository.PostingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class PostingRepositoryImpl implements PostingRepository {

    @Autowired
    private PostingJpaRepository postingJpaRepository;

    @Override
    public Optional<Posting> findById(long postingId) {
        return postingJpaRepository.findById(postingId);
    }

    @Override
    public Posting save(Posting posting) {
        return postingJpaRepository.save(posting);
    }

    @Override
    public void deleteById(long postingId) {
        postingJpaRepository.deleteById(postingId);
    }
}
