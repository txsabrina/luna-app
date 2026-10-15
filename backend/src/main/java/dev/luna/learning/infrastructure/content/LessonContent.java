package dev.luna.learning.infrastructure.content;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.luna.learning.domain.Lesson;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.HashSet;
import java.util.Map;

@ApplicationScoped
public class LessonContent {
    public record Assessment(String expectedOptionId, String explanation, Map<String, String> feedback) {}
    public record Document(Lesson lesson, Map<String, Assessment> assessments) {}
    private final Document document;

    public LessonContent(ObjectMapper mapper) {
        try (var stream = LessonContent.class.getResourceAsStream("/content/tarot/fool-first-step.v1.json")) {
            if (stream == null) throw new IllegalStateException("Missing lesson content");
            document = mapper.readValue(stream, Document.class);
            validate(document);
        } catch (Exception exception) {
            throw new IllegalStateException("Invalid lesson content", exception);
        }
    }

    public Document document() { return document; }

    public static void validate(Document document) {
        if (document == null || document.lesson() == null || document.assessments() == null)
            throw new IllegalStateException("Missing document fields");
        var lesson = document.lesson();
        if (!"fool-first-step".equals(lesson.id()) || lesson.contentVersion() != 1
                || !"PREVIEW".equals(lesson.status()) || lesson.title() == null
                || lesson.objectives() == null || lesson.objectives().isEmpty()
                || lesson.steps() == null || lesson.steps().size() != 4)
            throw new IllegalStateException("Invalid lesson metadata");
        var ids = new HashSet<String>();
        var assessed = new HashSet<String>();
        for (var step : lesson.steps()) {
            if (step.id() == null || !ids.add(step.id()) || step.title() == null
                    || step.lume() == null || step.lume().message() == null || step.lume().mood() == null)
                throw new IllegalStateException("Invalid step");
            if (step instanceof Lesson.Explanation explanation) {
                if (explanation.paragraphs() == null || explanation.paragraphs().isEmpty() || explanation.cta() == null)
                    throw new IllegalStateException("Invalid explanation");
            } else if (step instanceof Lesson.Observation observation) {
                var options = new HashSet<String>();
                if (observation.imagePath() == null || observation.imageAlt() == null
                        || observation.options() == null || observation.options().isEmpty())
                    throw new IllegalStateException("Invalid observation");
                for (var option : observation.options())
                    if (option.id() == null || !options.add(option.id()) || option.label() == null || option.feedback() == null)
                        throw new IllegalStateException("Invalid observation option");
            } else if (step instanceof Lesson.SingleChoice choice) {
                var options = new HashSet<String>();
                if (choice.question() == null || choice.options() == null || choice.options().size() < 2)
                    throw new IllegalStateException("Invalid choice");
                for (var option : choice.options())
                    if (option.id() == null || !options.add(option.id()) || option.label() == null)
                        throw new IllegalStateException("Invalid choice option");
                var assessment = document.assessments().get(step.id());
                if (assessment == null || assessment.explanation() == null || assessment.feedback() == null
                        || !options.contains(assessment.expectedOptionId())
                        || !options.equals(assessment.feedback().keySet())
                        || assessment.feedback().values().stream().anyMatch(value -> value == null || value.isBlank()))
                    throw new IllegalStateException("Invalid assessment");
                assessed.add(step.id());
            }
        }
        if (!assessed.equals(document.assessments().keySet())) throw new IllegalStateException("Orphan assessment");
    }
}
