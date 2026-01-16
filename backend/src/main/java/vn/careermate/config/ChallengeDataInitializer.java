package vn.careermate.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import vn.careermate.learningservice.model.Badge;
import vn.careermate.learningservice.model.Challenge;
import vn.careermate.learningservice.repository.BadgeRepository;
import vn.careermate.learningservice.repository.ChallengeRepository;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(3) // Run after CourseDataInitializer
public class ChallengeDataInitializer implements CommandLineRunner {

    private final ChallengeRepository challengeRepository;
    private final BadgeRepository badgeRepository;

    @Override
    @Transactional
    public void run(String... args) {
        try {
            long challengeCount = challengeRepository.count();
            long badgeCount = badgeRepository.count();
            log.info("Current challenge count: {}, badge count: {}", challengeCount, badgeCount);
            
            // Clear existing data if any
            if (challengeCount > 0 || badgeCount > 0) {
                log.info("Deleting existing challenges and badges to recreate...");
                challengeRepository.deleteAll();
                badgeRepository.deleteAll();
                log.info("Existing challenges and badges deleted");
            }

            log.info("Initializing challenge and badge data...");

            // Create badges first
            Badge firstStepBadge = createBadge(
                "Bước Đầu Tiên",
                "Hoàn thành thử thách đầu tiên của bạn! Đây là bước khởi đầu tuyệt vời trên hành trình phát triển nghề nghiệp.",
                "BEGINNER",
                Badge.BadgeRarity.COMMON
            );

            Badge cvMasterBadge = createBadge(
                "Bậc Thầy CV",
                "Tạo và tối ưu hóa CV của bạn để gây ấn tượng với nhà tuyển dụng. CV chuyên nghiệp là chìa khóa thành công!",
                "CV",
                Badge.BadgeRarity.RARE
            );

            Badge jobHunterBadge = createBadge(
                "Thợ Săn Việc",
                "Nộp đơn ứng tuyển cho 5 công việc phù hợp với kỹ năng của bạn. Bước vào thế giới việc làm!",
                "JOB",
                Badge.BadgeRarity.COMMON
            );

            Badge profileCompleteBadge = createBadge(
                "Hồ Sơ Hoàn Chỉnh",
                "Hoàn thiện 100% hồ sơ cá nhân của bạn. Một hồ sơ đầy đủ sẽ giúp bạn được nhà tuyển dụng chú ý hơn.",
                "PROFILE",
                Badge.BadgeRarity.COMMON
            );

            Badge quickLearnerBadge = createBadge(
                "Người Học Nhanh",
                "Hoàn thành 3 khóa học trong hệ thống. Kiến thức là sức mạnh!",
                "LEARNING",
                Badge.BadgeRarity.RARE
            );

            Badge skillBuilderBadge = createBadge(
                "Xây Dựng Kỹ Năng",
                "Thêm 5 kỹ năng vào hồ sơ của bạn. Kỹ năng đa dạng mở ra nhiều cơ hội hơn!",
                "SKILLS",
                Badge.BadgeRarity.COMMON
            );

            Badge networkerBadge = createBadge(
                "Người Kết Nối",
                "Kết nối LinkedIn, GitHub và Portfolio vào hồ sơ của bạn. Mở rộng mạng lưới nghề nghiệp!",
                "NETWORKING",
                Badge.BadgeRarity.COMMON
            );

            Badge articleReaderBadge = createBadge(
                "Độc Giả Tích Cực",
                "Đọc 10 bài viết về phát triển nghề nghiệp. Cập nhật kiến thức mới mỗi ngày!",
                "CONTENT",
                Badge.BadgeRarity.COMMON
            );

            Badge companyExplorerBadge = createBadge(
                "Nhà Thám Hiểm Công Ty",
                "Xem chi tiết 10 công ty khác nhau. Tìm hiểu về văn hóa và môi trường làm việc!",
                "COMPANY",
                Badge.BadgeRarity.COMMON
            );

            Badge cvAnalyzerBadge = createBadge(
                "Chuyên Gia Phân Tích CV",
                "Phân tích CV của bạn bằng AI 3 lần. Hiểu rõ điểm mạnh và điểm cần cải thiện!",
                "AI",
                Badge.BadgeRarity.RARE
            );

            Badge roadmapFollowerBadge = createBadge(
                "Người Theo Dõi Lộ Trình",
                "Tạo và xem 3 lộ trình nghề nghiệp khác nhau. Lập kế hoạch cho tương lai của bạn!",
                "CAREER",
                Badge.BadgeRarity.EPIC
            );

            Badge challengeWinnerBadge = createBadge(
                "Người Chiến Thắng",
                "Hoàn thành 5 thử thách khác nhau. Chứng minh khả năng và sự kiên trì của bạn!",
                "CHALLENGE",
                Badge.BadgeRarity.EPIC
            );

            Badge allStarBadge = createBadge(
                "Ngôi Sao Toàn Diện",
                "Hoàn thành tất cả các thử thách trong hệ thống. Bạn là người xuất sắc nhất!",
                "ACHIEVEMENT",
                Badge.BadgeRarity.LEGENDARY
            );

            log.info("Created {} badges", badgeRepository.count());

            // Create challenges with badges
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime futureDate = now.plusYears(1);

            // Challenge 1: First Steps
            createChallenge(
                "Bước Đầu Tiên",
                "Hoàn thành hồ sơ cá nhân cơ bản và tải lên CV đầu tiên của bạn. Đây là bước quan trọng để bắt đầu hành trình tìm việc làm.\n\n" +
                "Yêu cầu:\n" +
                "• Hoàn thiện thông tin cá nhân (tên, email, số điện thoại)\n" +
                "• Tải lên CV đầu tiên (PDF hoặc DOCX)\n" +
                "• Thêm ít nhất 1 kỹ năng vào hồ sơ",
                "ONBOARDING",
                "EASY",
                firstStepBadge,
                now,
                futureDate
            );

            // Challenge 2: CV Master
            createChallenge(
                "Bậc Thầy CV",
                "Tạo và tối ưu hóa CV của bạn để đạt điểm số cao từ AI. Một CV tốt là chìa khóa để mở cánh cửa việc làm.\n\n" +
                "Yêu cầu:\n" +
                "• Tải lên CV (PDF hoặc DOCX)\n" +
                "• Phân tích CV bằng AI\n" +
                "• Đạt điểm số CV >= 70/100 từ AI Analysis",
                "CV",
                "MEDIUM",
                cvMasterBadge,
                now,
                futureDate
            );

            // Challenge 3: Job Hunter
            createChallenge(
                "Thợ Săn Việc",
                "Tích cực tìm kiếm và ứng tuyển các công việc phù hợp. Cơ hội chỉ đến với những người chủ động.\n\n" +
                "Yêu cầu:\n" +
                "• Nộp đơn ứng tuyển cho 5 công việc khác nhau\n" +
                "• Xem chi tiết ít nhất 10 công việc\n" +
                "• Sử dụng tính năng Job Recommendations",
                "JOB",
                "MEDIUM",
                jobHunterBadge,
                now,
                futureDate
            );

            // Challenge 4: Complete Profile
            createChallenge(
                "Hồ Sơ Hoàn Chỉnh",
                "Hoàn thiện 100% hồ sơ cá nhân của bạn. Một hồ sơ đầy đủ sẽ tăng khả năng được nhà tuyển dụng chú ý.\n\n" +
                "Yêu cầu:\n" +
                "• Điền đầy đủ thông tin cá nhân (ngày sinh, giới tính, địa chỉ, thành phố)\n" +
                "• Thông tin học vấn (trường đại học, ngành học, năm tốt nghiệp)\n" +
                "• Thêm mô tả bản thân (Bio)\n" +
                "• Tải lên ảnh đại diện",
                "PROFILE",
                "EASY",
                profileCompleteBadge,
                now,
                futureDate
            );

            // Challenge 5: Quick Learner
            createChallenge(
                "Người Học Nhanh",
                "Hoàn thành các khóa học để nâng cao kỹ năng của bạn. Học tập là đầu tư tốt nhất cho tương lai.\n\n" +
                "Yêu cầu:\n" +
                "• Đăng ký và hoàn thành 3 khóa học bất kỳ\n" +
                "• Mỗi khóa học phải đạt tiến độ >= 80%\n" +
                "• Hoàn thành tất cả bài quiz trong khóa học",
                "LEARNING",
                "MEDIUM",
                quickLearnerBadge,
                now,
                futureDate
            );

            // Challenge 6: Skill Builder
            createChallenge(
                "Xây Dựng Kỹ Năng",
                "Phát triển và cập nhật kỹ năng của bạn. Kỹ năng đa dạng mở ra nhiều cơ hội nghề nghiệp hơn.\n\n" +
                "Yêu cầu:\n" +
                "• Thêm ít nhất 5 kỹ năng vào hồ sơ\n" +
                "• Mỗi kỹ năng phải có mức độ thành thạo (Beginner, Intermediate, Advanced, Expert)\n" +
                "• Có ít nhất 2 kỹ năng ở mức Advanced trở lên",
                "SKILLS",
                "EASY",
                skillBuilderBadge,
                now,
                futureDate
            );

            // Challenge 7: Networker
            createChallenge(
                "Người Kết Nối",
                "Xây dựng mạng lưới nghề nghiệp bằng cách kết nối các tài khoản xã hội chuyên nghiệp.\n\n" +
                "Yêu cầu:\n" +
                "• Kết nối LinkedIn profile\n" +
                "• Kết nối GitHub profile\n" +
                "• Thêm Portfolio URL (nếu có)",
                "NETWORKING",
                "EASY",
                networkerBadge,
                now,
                futureDate
            );

            // Challenge 8: Article Reader
            createChallenge(
                "Độc Giả Tích Cực",
                "Đọc các bài viết về phát triển nghề nghiệp để cập nhật kiến thức và xu hướng mới.\n\n" +
                "Yêu cầu:\n" +
                "• Đọc ít nhất 10 bài viết trong hệ thống\n" +
                "• Đọc ít nhất 3 bài viết từ các chủ đề khác nhau\n" +
                "• Mỗi bài viết phải xem ít nhất 2 phút",
                "CONTENT",
                "EASY",
                articleReaderBadge,
                now,
                futureDate
            );

            // Challenge 9: Company Explorer
            createChallenge(
                "Nhà Thám Hiểm Công Ty",
                "Tìm hiểu về các công ty để có cái nhìn tổng quan về thị trường việc làm và văn hóa doanh nghiệp.\n\n" +
                "Yêu cầu:\n" +
                "• Xem chi tiết ít nhất 10 công ty khác nhau\n" +
                "• Xem đánh giá của ít nhất 5 công ty\n" +
                "• Đánh giá ít nhất 2 công ty",
                "COMPANY",
                "EASY",
                companyExplorerBadge,
                now,
                futureDate
            );

            // Challenge 10: CV Analyzer
            createChallenge(
                "Chuyên Gia Phân Tích CV",
                "Sử dụng công cụ AI để phân tích và cải thiện CV của bạn. Hiểu rõ điểm mạnh và điểm cần cải thiện.\n\n" +
                "Yêu cầu:\n" +
                "• Phân tích CV bằng AI ít nhất 3 lần\n" +
                "• Cải thiện điểm số CV từ lần phân tích đầu đến lần cuối\n" +
                "• Đạt điểm số CV >= 75/100",
                "AI",
                "MEDIUM",
                cvAnalyzerBadge,
                now,
                futureDate
            );

            // Challenge 11: Roadmap Follower
            createChallenge(
                "Người Theo Dõi Lộ Trình",
                "Tạo và xem các lộ trình nghề nghiệp để lập kế hoạch phát triển sự nghiệp dài hạn.\n\n" +
                "Yêu cầu:\n" +
                "• Tạo ít nhất 3 lộ trình nghề nghiệp cho các vị trí khác nhau\n" +
                "• Xem chi tiết từng bước trong lộ trình\n" +
                "• Hoàn thành ít nhất 1 bước trong một lộ trình",
                "CAREER",
                "HARD",
                roadmapFollowerBadge,
                now,
                futureDate
            );

            // Challenge 12: Challenge Winner
            createChallenge(
                "Người Chiến Thắng",
                "Hoàn thành nhiều thử thách khác nhau để chứng minh khả năng và sự kiên trì của bạn.\n\n" +
                "Yêu cầu:\n" +
                "• Hoàn thành ít nhất 5 thử thách khác nhau\n" +
                "• Mỗi thử thách phải thuộc các danh mục khác nhau\n" +
                "• Nhận được ít nhất 5 badges từ các thử thách",
                "CHALLENGE",
                "HARD",
                challengeWinnerBadge,
                now,
                futureDate
            );

            // Challenge 13: All Star (Special Challenge)
            createChallenge(
                "Ngôi Sao Toàn Diện",
                "Thử thách đặc biệt dành cho những người xuất sắc nhất! Hoàn thành tất cả các thử thách trong hệ thống.\n\n" +
                "Yêu cầu:\n" +
                "• Hoàn thành TẤT CẢ các thử thách khác trong hệ thống\n" +
                "• Nhận được tất cả badges từ các thử thách\n" +
                "• Duy trì hồ sơ hoàn chỉnh và cập nhật thường xuyên",
                "ACHIEVEMENT",
                "LEGENDARY",
                allStarBadge,
                now,
                futureDate
            );

            long finalChallengeCount = challengeRepository.count();
            long finalBadgeCount = badgeRepository.count();
            log.info("Challenge and badge data initialization completed. Created {} challenges and {} badges", 
                finalChallengeCount, finalBadgeCount);
            
        } catch (Exception e) {
            log.error("Error initializing challenge and badge data", e);
        }
    }

    private Badge createBadge(String name, String description, String category, Badge.BadgeRarity rarity) {
        Badge badge = Badge.builder()
            .name(name)
            .description(description)
            .category(category)
            .rarity(rarity)
            .build();
        return badgeRepository.save(badge);
    }

    private Challenge createChallenge(String title, String description, String category, 
                                     String difficulty, Badge badge, 
                                     LocalDateTime startDate, LocalDateTime endDate) {
        Challenge challenge = Challenge.builder()
            .title(title)
            .description(description)
            .category(category)
            .difficulty(difficulty)
            .badge(badge)
            .startDate(startDate)
            .endDate(endDate)
            .build();
        return challengeRepository.save(challenge);
    }
}
