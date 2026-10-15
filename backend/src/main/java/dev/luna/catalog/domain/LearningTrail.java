package dev.luna.catalog.domain;

public record LearningTrail(
        String id,
        String title,
        String description,
        int plannedCourseCount,
        ContentStatus status
) {
    public enum ContentStatus {
        PLANNED,
        IN_PROGRESS,
        AVAILABLE
    }
}
