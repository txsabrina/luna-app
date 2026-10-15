package dev.luna.catalog.application;

import dev.luna.catalog.domain.LearningTrail;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

import static dev.luna.catalog.domain.LearningTrail.ContentStatus.PLANNED;

@ApplicationScoped
public class GetLearningTrails {

    public List<LearningTrail> execute() {
        return List.of(
                new LearningTrail(
                        "tarot",
                        "Tarô",
                        "Investigue imagens, conecte símbolos e construa leituras contextualizadas.",
                        4,
                        PLANNED
                ),
                new LearningTrail(
                        "numerology",
                        "Numerologia",
                        "Explore números e tradições simbólicas com métodos identificados.",
                        6,
                        PLANNED
                ),
                new LearningTrail(
                        "patterns",
                        "Padrões e autoconhecimento",
                        "Explore hábitos e interpretações em atividades educativas.",
                        14,
                        PLANNED
                )
        );
    }
}
