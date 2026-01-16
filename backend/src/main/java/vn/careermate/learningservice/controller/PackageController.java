package vn.careermate.learningservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.careermate.learningservice.model.Package;
import vn.careermate.learningservice.model.Subscription;
import vn.careermate.learningservice.service.PackageService;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/packages")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PackageController {

    private final PackageService packageService;

    @GetMapping
    public ResponseEntity<List<Package>> getAllPackages() {
        return ResponseEntity.ok(packageService.getAllPackages());
    }

    @GetMapping("/my-subscription")
    @PreAuthorize("hasRole('STUDENT') or hasRole('RECRUITER')")
    public ResponseEntity<Subscription> getMySubscription() {
        Optional<Subscription> subscription = packageService.getMyCurrentSubscription();
        return subscription.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{packageId}/subscribe")
    @PreAuthorize("hasRole('STUDENT') or hasRole('RECRUITER')")
    public ResponseEntity<Subscription> subscribeToPackage(@PathVariable UUID packageId) {
        return ResponseEntity.ok(packageService.subscribeToPackage(packageId));
    }
}
