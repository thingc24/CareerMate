package vn.careermate.learningservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.careermate.learningservice.model.Badge;
import vn.careermate.learningservice.model.Challenge;
import vn.careermate.learningservice.model.ChallengeParticipation;
import vn.careermate.learningservice.service.ChallengeService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/challenges")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChallengeController {

    private final ChallengeService challengeService;

    @GetMapping
    public ResponseEntity<List<Challenge>> getAvailableChallenges(
            @RequestParam(required = false) String category
    ) {
        return ResponseEntity.ok(challengeService.getAvailableChallenges(category));
    }

    @GetMapping("/{challengeId}")
    public ResponseEntity<Challenge> getChallenge(@PathVariable UUID challengeId) {
        try {
            Challenge challenge = challengeService.getChallengeById(challengeId);
            return ResponseEntity.ok(challenge);
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{challengeId}/join")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ChallengeParticipation> joinChallenge(@PathVariable UUID challengeId) {
        return ResponseEntity.ok(challengeService.joinChallenge(challengeId));
    }

    @PostMapping("/participations/{participationId}/complete")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ChallengeParticipation> completeChallenge(@PathVariable UUID participationId) {
        return ResponseEntity.ok(challengeService.completeChallenge(participationId));
    }

    @GetMapping("/my-participations")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<ChallengeParticipation>> getMyParticipations() {
        return ResponseEntity.ok(challengeService.getMyParticipations());
    }

    @GetMapping("/my-badges")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Badge>> getMyBadges() {
        return ResponseEntity.ok(challengeService.getMyBadges());
    }
}
