package com.none.kollappbackend.activity.application.model;

import com.none.kollappbackend.core.application.TransactionType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ActivityTransactionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description;
    private long amountInCents;
    private String category;
    private TransactionType transactionType;

    @ManyToOne
    @JoinColumn(name="activity_id", nullable = false)
    private Activity activity;

}
