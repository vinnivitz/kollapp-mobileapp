package org.kollappbackend.accounting.adapters.secondary.db;

import org.kollappbackend.accounting.adapters.secondary.db.jpa.ActivityPostingJpaRepository;
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

    @Autowired
    private ActivityPostingJpaRepository activityPostingJpaRepository;

    @Override
    public Optional<Posting> findById(long postingId) {
        return postingJpaRepository.findById(postingId);
    }

    @Override
    public Posting save(Posting posting) {
        return postingJpaRepository.save(posting);
    }

    @Override
    public void deleteByActivityId(long activityId) {
        activityPostingJpaRepository.deleteByActivityId(activityId);
    }
}
