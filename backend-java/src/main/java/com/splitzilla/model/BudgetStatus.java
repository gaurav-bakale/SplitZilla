package com.splitzilla.model;

/**
 * Represents the health status of a group's budget at any point in time.
 * Determined by the Chain of Responsibility budget-check pipeline.
 */
public enum BudgetStatus {
    ON_TRACK,
    WARNING,
    EXCEEDED
}
