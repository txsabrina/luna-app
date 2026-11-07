package dev.luna.learning.domain;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import java.util.List;

/** Presentation contract: no assessment key or quiz feedback is included. */
public record Lesson(String id, int contentVersion, String title, String status,
                     List<String> objectives, List<Step> steps, List<LearningPath> paths) {
    public record LearningPath(String id, String title, List<String> stepIds) {}
    public record Lume(String mood, String message) {}
    public record Option(String id, String label) {}
    public record ObservationOption(String id, String label, String feedback) {}

    @JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
    @JsonSubTypes({
        @JsonSubTypes.Type(value = Explanation.class, name = "explanation"),
        @JsonSubTypes.Type(value = Observation.class, name = "observation"),
        @JsonSubTypes.Type(value = SingleChoice.class, name = "single-choice"),
        @JsonSubTypes.Type(value = Exploration.class, name = "exploration"),
        @JsonSubTypes.Type(value = Classification.class, name = "classification"),
        @JsonSubTypes.Type(value = Study.class, name = "study")
    })
    public sealed interface Step permits Explanation, Observation, SingleChoice, Exploration, Classification, Study {
        String id();
        String title();
        Lume lume();
    }
    public record Explanation(String id, String title, Lume lume,
                              List<String> paragraphs, String cta) implements Step {}
    public record Observation(String id, String title, Lume lume,
                              String cardId, String imageAlt,
                              List<ObservationOption> options) implements Step {}
    public record Symbol(String id, String label, String observation, String interpretation) {}
    public record Exploration(String id, String title, Lume lume, String cardId, String imageAlt,
                              List<String> paragraphs, List<Symbol> symbols, String reflection) implements Step {}
    public record Classification(String id, String title, Lume lume, String instruction,
                                 List<Option> items, List<Option> categories,
                                 List<String> paragraphs, String note) implements Step {}
    public record SingleChoice(String id, String title, Lume lume,
                               String question, List<Option> options, List<String> paragraphs) implements Step {}
    public record StudyBlock(String label, List<String> paragraphs, boolean collapsible) {}
    public record Study(String id, String title, Lume lume, List<String> paragraphs,
                        List<StudyBlock> blocks, String cardMode, String cardId, String imageAlt,
                        List<String> afterReveal, String reflection, String cta) implements Step {}
}
