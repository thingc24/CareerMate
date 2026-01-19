package vn.careermate.learningservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import vn.careermate.learningservice.model.Package;
import vn.careermate.learningservice.model.Subscription;
import vn.careermate.learningservice.service.PackageService;
import vn.careermate.userservice.model.User;
import vn.careermate.userservice.repository.UserRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/packages")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PackageController {

    private final PackageService packageService;
    private final UserRepository userRepository;

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

    @GetMapping("/my-subscriptions")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Subscription>> getMySubscriptions() {
        return ResponseEntity.ok(packageService.getMySubscriptions());
    }

    @PostMapping("/{packageId}/request")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Subscription> requestSubscription(@PathVariable UUID packageId) {
        try {
            return ResponseEntity.ok(packageService.requestSubscription(packageId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Legacy endpoint - kept for backward compatibility
    @PostMapping("/{packageId}/subscribe")
    @PreAuthorize("hasRole('STUDENT') or hasRole('RECRUITER')")
    public ResponseEntity<Subscription> subscribeToPackage(@PathVariable UUID packageId) {
        try {
            return ResponseEntity.ok(packageService.requestSubscription(packageId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Admin endpoints for managing subscriptions
    @GetMapping("/subscriptions/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Subscription>> getPendingSubscriptions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(packageService.getPendingSubscriptions(pageable));
    }
    
    @PostMapping("/subscriptions/{subscriptionId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Subscription> approveSubscription(@PathVariable UUID subscriptionId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            UUID adminId = userRepository.findByEmail(email)
                    .map(User::getId)
                    .orElseThrow(() -> new RuntimeException("Admin not found"));
            
            return ResponseEntity.ok(packageService.approveSubscription(subscriptionId, adminId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/subscriptions/{subscriptionId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Subscription> rejectSubscription(@PathVariable UUID subscriptionId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            UUID adminId = userRepository.findByEmail(email)
                    .map(User::getId)
                    .orElseThrow(() -> new RuntimeException("Admin not found"));
            
            return ResponseEntity.ok(packageService.rejectSubscription(subscriptionId, adminId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/subscriptions/approved")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Subscription>> getApprovedSubscriptions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(packageService.getApprovedSubscriptions(pageable));
    }
    
    @GetMapping("/subscriptions/history")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Subscription>> getAllSubscriptionsHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(packageService.getAllSubscriptionsHistory(pageable));
    }
}
