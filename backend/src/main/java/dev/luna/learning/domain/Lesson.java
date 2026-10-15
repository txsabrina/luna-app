package dev.luna.learning.domain;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import java.util.List;

/** Presentation contract: no assessment key or quiz feedback is included. */
public record Lesson(String id, int contentVersion, String title, String status,
                     List<String> objectives, List<Step> steps) {
    public record Lume(String mood, String message) {}
    public record Option(String id, String label) {}
    public record ObservationOption(String id, String label, String feedback) {}

    @JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
    @JsonSubTypes({
        @JsonSubTypes.Type(value = Explanation.class, name = "explanation"),
        @JsonSubTypes.Type(value = Observation.class, name = "observation"),
        @JsonSubTypes.Type(value = SingleChoice.class, name = "single-choice")
    })
    public sealed interface Step permits Explanation, Observation, SingleChoice {
        String id();
        String title();
        Lume lume();
    }
    public record Explanation(String id, String title, Lume lume,
                              List<String> paragraphs, String cta) implements Step {}
    public record Observation(String id, String title, Lume lume,
                              String imagePath, String imageAlt,
                              List<ObservationOption> options) implements Step {}
    public record SingleChoice(String id, String title, Lume lume,
                               String question, List<Option> options) implements Step {}
}
