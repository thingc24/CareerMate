package vn.careermate.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.careermate.model.Package;
import vn.careermate.model.Subscription;
import vn.careermate.model.User;
import vn.careermate.repository.PackageRepository;
import vn.careermate.repository.SubscriptionRepository;
import vn.careermate.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PackageService {

    private final PackageRepository packageRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

    public List<Package> getAllPackages() {
        return packageRepository.findAll();
    }

    public Optional<Subscription> getCurrentSubscription(UUID userId) {
        List<Subscription> activeSubs = subscriptionRepository.findByUserIdAndStatus(userId, Subscription.SubscriptionStatus.ACTIVE);
        return activeSubs.stream()
                .filter(sub -> sub.getEndDate().isAfter(java.time.LocalDateTime.now()))
                .findFirst();
    }

    public Optional<Subscription> getMyCurrentSubscription() {
        User user = getCurrentUser();
        return getCurrentSubscription(user.getId());
    }

    @Transactional
    public Subscription subscribeToPackage(UUID packageId) {
        Package packageEntity = packageRepository.findById(packageId)
                .orElseThrow(() -> new RuntimeException("Package not found"));

        User user = getCurrentUser();
        
        // Cancel existing active subscription
        subscriptionRepository.findByUserIdAndStatus(user.getId(), Subscription.SubscriptionStatus.ACTIVE)
                .forEach(sub -> {
                    sub.setStatus(Subscription.SubscriptionStatus.CANCELLED);
                    subscriptionRepository.save(sub);
                });

        // Create new subscription
        LocalDateTime now = LocalDateTime.now();
        Subscription subscription = Subscription.builder()
                .user(user)
                .packageEntity(packageEntity)
                .status(Subscription.SubscriptionStatus.ACTIVE)
                .startDate(now)
                .endDate(now.plusDays(packageEntity.getDurationDays()))
                .build();

        return subscriptionRepository.save(subscription);
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}

