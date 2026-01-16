package vn.careermate.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import vn.careermate.learningservice.model.*;
import vn.careermate.learningservice.repository.*;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(2)
public class CourseDataInitializer implements CommandLineRunner {

    private final CourseRepository courseRepository;
    private final CourseModuleRepository moduleRepository;
    private final LessonRepository lessonRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final CourseEnrollmentRepository enrollmentRepository;

    @Override
    @Transactional
    public void run(String... args) {
        try {
            long courseCount = courseRepository.count();
            log.info("Current course count: {}", courseCount);
            
            // Xóa tất cả courses cũ để tạo lại với quiz
            // Phải xóa theo thứ tự để tránh foreign key constraint violation
            if (courseCount > 0) {
                log.info("Deleting {} existing courses to recreate with quizzes...", courseCount);
                log.info("Step 1: Deleting lesson progress records...");
                lessonProgressRepository.deleteAll();
                log.info("Step 2: Deleting course enrollments...");
                enrollmentRepository.deleteAll();
                log.info("Step 3: Deleting lessons...");
                lessonRepository.deleteAll();
                log.info("Step 4: Deleting course modules...");
                moduleRepository.deleteAll();
                log.info("Step 5: Deleting courses...");
                courseRepository.deleteAll();
                log.info("All existing courses deleted. Recreating courses with quizzes...");
            }

            log.info("No courses found. Initializing course data...");

            // 1. Khóa học miễn phí: Lập trình Java cơ bản
            log.info("Creating Java Basic course...");
            createJavaBasicCourse();
            log.info("Java Basic course created");
            
            // 2. Khóa học miễn phí: Kỹ năng viết CV chuyên nghiệp
            log.info("Creating CV Writing course...");
            createCVWritingCourse();
            log.info("CV Writing course created");
            
            // 3. Khóa học miễn phí: Kỹ năng phỏng vấn xin việc
            log.info("Creating Interview Skills course...");
            createInterviewSkillsCourse();
            log.info("Interview Skills course created");
            
            // 4. Khóa học miễn phí: HTML/CSS cơ bản
            log.info("Creating HTML/CSS Basic course...");
            createHTMLCSSBasicCourse();
            log.info("HTML/CSS Basic course created");
            
            // 5. Khóa học miễn phí: JavaScript cơ bản
            log.info("Creating JavaScript Basic course...");
            createJavaScriptBasicCourse();
            log.info("JavaScript Basic course created");
            
            // 6. Khóa học miễn phí: Git và GitHub
            log.info("Creating Git/GitHub course...");
            createGitCourse();
            log.info("Git/GitHub course created");
            
            // 4. Khóa học Premium: Lập trình Java nâng cao
            log.info("Creating Java Advanced course...");
            createJavaAdvancedCourse();
            log.info("Java Advanced course created");
            
            // 5. Khóa học Premium: Full-stack Web Development
            log.info("Creating Full-stack course...");
            createFullstackCourse();
            log.info("Full-stack course created");
            
            // 6. Khóa học Premium: Data Science với Python
            log.info("Creating Data Science course...");
            createDataScienceCourse();
            log.info("Data Science course created");

            long finalCount = courseRepository.count();
            log.info("Course data initialization completed. Created {} courses", finalCount);
            
            if (finalCount == 0) {
                log.error("WARNING: No courses were created! Check for errors above.");
            }
        } catch (Exception e) {
            log.error("ERROR initializing course data: ", e);
            e.printStackTrace();
        }
    }

    private Course createJavaBasicCourse() {
        Course course = Course.builder()
                .title("Lập trình Java cơ bản")
                .description("Khóa học lập trình Java từ cơ bản đến nâng cao, phù hợp cho người mới bắt đầu. Học cách viết code Java, hiểu về OOP, và xây dựng ứng dụng đầu tiên.")
                .instructor("CareerMate Team")
                .category("TECHNICAL")
                .level(Course.CourseLevel.BEGINNER)
                .durationHours(20)
                .price(BigDecimal.ZERO)
                .isPremium(false)
                .build();
        course = courseRepository.save(course);

        // Module 1: Giới thiệu về Java
        CourseModule module1 = createModule(course, 1, "Giới thiệu về Java", 
                "Tìm hiểu về ngôn ngữ lập trình Java, cài đặt môi trường phát triển, và chạy chương trình đầu tiên.");
        createLesson(module1, 1, "Java là gì? Tại sao học Java?", "TEXT", 
                "<h2>Java là gì?</h2><p>Java là một ngôn ngữ lập trình hướng đối tượng, được phát triển bởi Sun Microsystems (nay thuộc Oracle). Java được thiết kế để có thể chạy trên nhiều nền tảng khác nhau mà không cần biên dịch lại.</p><h3>Tại sao học Java?</h3><ul><li>Dễ học và dễ đọc</li><li>Ứng dụng rộng rãi: Web, Mobile, Enterprise</li><li>Cộng đồng lớn và tài liệu phong phú</li><li>Cơ hội việc làm cao</li></ul>", 
                15, true);
        createLesson(module1, 2, "Cài đặt JDK và IDE", "TEXT",
                "<h2>Cài đặt JDK</h2><p>JDK (Java Development Kit) là bộ công cụ cần thiết để phát triển ứng dụng Java.</p><h3>Bước 1: Tải JDK</h3><p>Truy cập trang web của Oracle và tải JDK phiên bản mới nhất.</p><h3>Bước 2: Cài đặt</h3><p>Chạy file cài đặt và làm theo hướng dẫn.</p><h3>Bước 3: Cấu hình biến môi trường</h3><p>Thiết lập JAVA_HOME và PATH trong hệ thống.</p>",
                20, false);
        createLesson(module1, 3, "Chương trình Hello World đầu tiên", "TEXT",
                "<h2>Viết chương trình đầu tiên</h2><pre><code>public class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, World!\");\n    }\n}</code></pre><p>Đây là chương trình Java đơn giản nhất. Chúng ta sẽ tìm hiểu từng phần của nó.</p>",
                10, false);

        // Module 2: Cú pháp cơ bản
        CourseModule module2 = createModule(course, 2, "Cú pháp cơ bản Java",
                "Học về biến, kiểu dữ liệu, toán tử, và các cấu trúc điều khiển trong Java.");
        createLesson(module2, 1, "Biến và kiểu dữ liệu", "TEXT",
                "<h2>Biến trong Java</h2><p>Biến là nơi lưu trữ dữ liệu trong chương trình.</p><h3>Các kiểu dữ liệu cơ bản:</h3><ul><li><strong>int</strong>: Số nguyên</li><li><strong>double</strong>: Số thực</li><li><strong>boolean</strong>: true/false</li><li><strong>String</strong>: Chuỗi ký tự</li></ul><pre><code>int age = 25;\ndouble salary = 5000.50;\nboolean isActive = true;\nString name = \"John\";</code></pre>",
                25, false);
        createLesson(module2, 2, "Toán tử và biểu thức", "TEXT",
                "<h2>Toán tử trong Java</h2><h3>Toán tử số học:</h3><ul><li>+ (cộng)</li><li>- (trừ)</li><li>* (nhân)</li><li>/ (chia)</li><li>% (chia lấy dư)</li></ul><h3>Toán tử so sánh:</h3><ul><li>== (bằng)</li><li>!= (khác)</li><li>&lt; (nhỏ hơn)</li><li>&gt; (lớn hơn)</li></ul>",
                20, false);
        createLesson(module2, 3, "Cấu trúc if-else", "TEXT",
                "<h2>Điều kiện if-else</h2><pre><code>int score = 85;\nif (score >= 90) {\n    System.out.println(\"Xuất sắc\");\n} else if (score >= 70) {\n    System.out.println(\"Khá\");\n} else {\n    System.out.println(\"Cần cố gắng\");\n}</code></pre>",
                15, false);
        createLesson(module2, 4, "Vòng lặp for và while", "TEXT",
                "<h2>Vòng lặp</h2><h3>Vòng lặp for:</h3><pre><code>for (int i = 0; i &lt; 10; i++) {\n    System.out.println(i);\n}</code></pre><h3>Vòng lặp while:</h3><pre><code>int i = 0;\nwhile (i &lt; 10) {\n    System.out.println(i);\n    i++;\n}</code></pre>",
                20, false);

        // Module 3: Hướng đối tượng cơ bản
        CourseModule module3 = createModule(course, 3, "Lập trình hướng đối tượng",
                "Tìm hiểu về class, object, phương thức, và các nguyên lý OOP cơ bản.");
        createLesson(module3, 1, "Class và Object", "TEXT",
                "<h2>Class và Object</h2><p>Class là khuôn mẫu để tạo object. Object là thể hiện cụ thể của class.</p><pre><code>public class Student {\n    String name;\n    int age;\n    \n    public void study() {\n        System.out.println(name + \" đang học\");\n    }\n}</code></pre>",
                30, false);
        createLesson(module3, 2, "Phương thức và tham số", "TEXT",
                "<h2>Phương thức trong Java</h2><pre><code>public int add(int a, int b) {\n    return a + b;\n}</code></pre><p>Phương thức là một khối code có thể tái sử dụng.</p>",
                25, false);
        
        // Quiz cuối khóa học - bài học cuối cùng
        CourseModule finalModule = createModule(course, 4, "Kiểm tra cuối khóa",
                "Bài kiểm tra tổng hợp toàn bộ kiến thức đã học trong khóa học.");
        createQuizLesson(finalModule, 1, "Kiểm tra cuối khóa: Lập trình Java cơ bản", 
                createJavaBasicFinalQuiz(), 30, false);

        return course;
    }

    private Course createCVWritingCourse() {
        Course course = Course.builder()
                .title("Kỹ năng viết CV chuyên nghiệp")
                .description("Học cách viết CV hiệu quả, thu hút nhà tuyển dụng. Bao gồm cấu trúc CV, cách trình bày, và các lỗi thường gặp.")
                .instructor("CareerMate Team")
                .category("SOFT_SKILLS")
                .level(Course.CourseLevel.BEGINNER)
                .durationHours(8)
                .price(BigDecimal.ZERO)
                .isPremium(false)
                .build();
        course = courseRepository.save(course);

        CourseModule module1 = createModule(course, 1, "Cấu trúc CV cơ bản",
                "Tìm hiểu về các phần cần có trong một CV chuyên nghiệp.");
        createLesson(module1, 1, "CV là gì và tại sao quan trọng?", "TEXT",
                "<h2>CV là gì?</h2><p>CV (Curriculum Vitae) là bản tóm tắt về kinh nghiệm làm việc, học vấn, và kỹ năng của bạn.</p><h3>Tại sao CV quan trọng?</h3><ul><li>Là ấn tượng đầu tiên với nhà tuyển dụng</li><li>Quyết định bạn có được mời phỏng vấn không</li><li>Thể hiện sự chuyên nghiệp</li></ul>",
                15, true);
        createLesson(module1, 2, "Các phần cần có trong CV", "TEXT",
                "<h2>Cấu trúc CV chuẩn</h2><ol><li><strong>Thông tin cá nhân</strong>: Tên, email, số điện thoại</li><li><strong>Mục tiêu nghề nghiệp</strong>: Tóm tắt ngắn gọn</li><li><strong>Học vấn</strong>: Trường, chuyên ngành, GPA</li><li><strong>Kinh nghiệm</strong>: Công việc, dự án</li><li><strong>Kỹ năng</strong>: Kỹ năng kỹ thuật và mềm</li><li><strong>Chứng chỉ</strong>: Nếu có</li></ol>",
                20, false);

        CourseModule module2 = createModule(course, 2, "Viết từng phần CV",
                "Học cách viết từng phần của CV một cách hiệu quả.");
        createLesson(module2, 1, "Viết mục tiêu nghề nghiệp ấn tượng", "TEXT",
                "<h2>Mục tiêu nghề nghiệp</h2><p>Mục tiêu nghề nghiệp nên ngắn gọn (2-3 câu), rõ ràng, và thể hiện giá trị bạn mang lại.</p><h3>Ví dụ tốt:</h3><p>Sinh viên CNTT năm cuối với kinh nghiệm phát triển web. Mong muốn ứng tuyển vị trí Frontend Developer tại công ty công nghệ hàng đầu, nơi tôi có thể áp dụng kỹ năng React và JavaScript để xây dựng sản phẩm chất lượng.</p>",
                25, false);
        createLesson(module2, 2, "Trình bày kinh nghiệm hiệu quả", "TEXT",
                "<h2>Kinh nghiệm làm việc</h2><p>Sử dụng công thức STAR:</p><ul><li><strong>S</strong>ituation: Tình huống</li><li><strong>T</strong>ask: Nhiệm vụ</li><li><strong>A</strong>ction: Hành động</li><li><strong>R</strong>esult: Kết quả</li></ul><h3>Ví dụ:</h3><p>Phát triển website bán hàng online (React, Node.js), tăng 30% doanh thu trong 3 tháng.</p>",
                30, false);
        
        // Quiz cuối khóa học - bài học cuối cùng
        CourseModule finalModule = createModule(course, 3, "Kiểm tra cuối khóa",
                "Bài kiểm tra tổng hợp toàn bộ kiến thức đã học trong khóa học.");
        createQuizLesson(finalModule, 1, "Kiểm tra cuối khóa: Kỹ năng viết CV", 
                createCVWritingFinalQuiz(), 25, false);

        return course;
    }

    private Course createInterviewSkillsCourse() {
        Course course = Course.builder()
                .title("Kỹ năng phỏng vấn xin việc")
                .description("Chuẩn bị tốt nhất cho buổi phỏng vấn. Học cách trả lời câu hỏi, thể hiện bản thân, và xử lý tình huống khó.")
                .instructor("CareerMate Team")
                .category("INTERVIEW")
                .level(Course.CourseLevel.BEGINNER)
                .durationHours(10)
                .price(BigDecimal.ZERO)
                .isPremium(false)
                .build();
        course = courseRepository.save(course);

        CourseModule module1 = createModule(course, 1, "Chuẩn bị trước phỏng vấn",
                "Những điều cần chuẩn bị trước khi đi phỏng vấn.");
        createLesson(module1, 1, "Nghiên cứu công ty và vị trí", "TEXT",
                "<h2>Nghiên cứu công ty</h2><p>Trước khi phỏng vấn, bạn cần:</p><ul><li>Tìm hiểu về lịch sử công ty</li><li>Xem sản phẩm/dịch vụ của công ty</li><li>Đọc mô tả công việc kỹ lưỡng</li><li>Xem tin tức mới nhất về công ty</li></ul>",
                20, true);
        createLesson(module1, 2, "Chuẩn bị câu hỏi và câu trả lời", "TEXT",
                "<h2>Chuẩn bị câu trả lời</h2><p>Chuẩn bị trước các câu hỏi thường gặp:</p><ul><li>Giới thiệu về bản thân</li><li>Tại sao bạn muốn làm việc ở đây?</li><li>Điểm mạnh/yếu của bạn?</li><li>Kinh nghiệm làm việc</li></ul>",
                25, false);

        CourseModule module2 = createModule(course, 2, "Trong buổi phỏng vấn",
                "Cách ứng xử và trả lời câu hỏi trong buổi phỏng vấn.");
        createLesson(module2, 1, "Ấn tượng đầu tiên", "TEXT",
                "<h2>Tạo ấn tượng tốt</h2><ul><li>Đến sớm 10-15 phút</li><li>Ăn mặc chuyên nghiệp</li><li>Bắt tay chắc chắn</li><li>Giao tiếp bằng mắt</li><li>Nụ cười thân thiện</li></ul>",
                20, false);
        createLesson(module2, 2, "Trả lời câu hỏi khó", "TEXT",
                "<h2>Xử lý câu hỏi khó</h2><p>Khi gặp câu hỏi khó:</p><ol><li>Dừng lại suy nghĩ (không vội vàng)</li><li>Yêu cầu làm rõ nếu cần</li><li>Trả lời trung thực</li><li>Liên hệ với kinh nghiệm của bạn</li></ol>",
                25, false);
        
        // Quiz cuối khóa học - bài học cuối cùng
        CourseModule finalModule = createModule(course, 3, "Kiểm tra cuối khóa",
                "Bài kiểm tra tổng hợp toàn bộ kiến thức đã học trong khóa học.");
        createQuizLesson(finalModule, 1, "Kiểm tra cuối khóa: Kỹ năng phỏng vấn", 
                createInterviewSkillsFinalQuiz(), 25, false);

        return course;
    }

    private Course createHTMLCSSBasicCourse() {
        Course course = Course.builder()
                .title("HTML/CSS cơ bản")
                .description("Khóa học HTML và CSS từ cơ bản, học cách tạo trang web đẹp và responsive. Phù hợp cho người mới bắt đầu học web development.")
                .instructor("CareerMate Team")
                .category("TECHNICAL")
                .level(Course.CourseLevel.BEGINNER)
                .durationHours(12)
                .price(BigDecimal.ZERO)
                .isPremium(false)
                .build();
        course = courseRepository.save(course);

        CourseModule module1 = createModule(course, 1, "HTML cơ bản",
                "Học các thẻ HTML cơ bản và cách cấu trúc một trang web.");
        createLesson(module1, 1, "Giới thiệu HTML", "TEXT",
                "<h2>HTML là gì?</h2><p>HTML (HyperText Markup Language) là ngôn ngữ đánh dấu để tạo cấu trúc cho trang web.</p><h3>Các thẻ cơ bản:</h3><ul><li>&lt;html&gt;: Thẻ gốc</li><li>&lt;head&gt;: Phần đầu</li><li>&lt;body&gt;: Phần thân</li><li>&lt;h1&gt; đến &lt;h6&gt;: Tiêu đề</li><li>&lt;p&gt;: Đoạn văn</li></ul>",
                20, true);
        createLesson(module1, 2, "Các thẻ HTML phổ biến", "TEXT",
                "<h2>Thẻ HTML phổ biến</h2><pre><code>&lt;div&gt;: Khối nội dung\n&lt;span&gt;: Nội dung inline\n&lt;a&gt;: Liên kết\n&lt;img&gt;: Hình ảnh\n&lt;ul&gt;, &lt;ol&gt;: Danh sách\n&lt;table&gt;: Bảng</code></pre>",
                25, false);
        createLesson(module1, 3, "Form và Input", "TEXT",
                "<h2>Form trong HTML</h2><pre><code>&lt;form&gt;\n  &lt;input type=\"text\" name=\"username\"&gt;\n  &lt;input type=\"email\" name=\"email\"&gt;\n  &lt;button type=\"submit\"&gt;Gửi&lt;/button&gt;\n&lt;/form&gt;</code></pre>",
                30, false);

        CourseModule module2 = createModule(course, 2, "CSS cơ bản",
                "Học cách tạo style cho trang web với CSS.");
        createLesson(module2, 1, "Giới thiệu CSS", "TEXT",
                "<h2>CSS là gì?</h2><p>CSS (Cascading Style Sheets) dùng để tạo style cho trang web.</p><h3>Cách sử dụng:</h3><ul><li>Inline CSS</li><li>Internal CSS</li><li>External CSS</li></ul>",
                20, false);
        createLesson(module2, 2, "Selectors và Properties", "TEXT",
                "<h2>CSS Selectors</h2><pre><code>/* Element selector */\np { color: blue; }\n\n/* Class selector */\n.title { font-size: 24px; }\n\n/* ID selector */\n#header { background: gray; }</code></pre>",
                25, false);
        createLesson(module2, 3, "Layout với Flexbox", "TEXT",
                "<h2>Flexbox</h2><pre><code>.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}</code></pre>",
                30, false);
        
        // Quiz cuối khóa học - bài học cuối cùng
        CourseModule finalModule = createModule(course, 3, "Kiểm tra cuối khóa",
                "Bài kiểm tra tổng hợp toàn bộ kiến thức đã học trong khóa học.");
        createQuizLesson(finalModule, 1, "Kiểm tra cuối khóa: HTML/CSS cơ bản", 
                createHTMLCSSFinalQuiz(), 25, false);

        return course;
    }

    private Course createJavaScriptBasicCourse() {
        Course course = Course.builder()
                .title("JavaScript cơ bản")
                .description("Khóa học JavaScript từ cơ bản, học cách tạo tương tác cho trang web. Bao gồm biến, hàm, DOM manipulation, và event handling.")
                .instructor("CareerMate Team")
                .category("TECHNICAL")
                .level(Course.CourseLevel.BEGINNER)
                .durationHours(15)
                .price(BigDecimal.ZERO)
                .isPremium(false)
                .build();
        course = courseRepository.save(course);

        CourseModule module1 = createModule(course, 1, "JavaScript cơ bản",
                "Học cú pháp và các khái niệm cơ bản của JavaScript.");
        createLesson(module1, 1, "Giới thiệu JavaScript", "TEXT",
                "<h2>JavaScript là gì?</h2><p>JavaScript là ngôn ngữ lập trình để tạo tương tác cho trang web.</p><h3>Đặc điểm:</h3><ul><li>Chạy trên browser</li><li>Dynamic typing</li><li>Event-driven</li></ul>",
                20, true);
        createLesson(module1, 2, "Biến và kiểu dữ liệu", "TEXT",
                "<h2>Biến trong JavaScript</h2><pre><code>let name = \"John\";\nconst age = 25;\nvar city = \"HCM\";\n\n// Kiểu dữ liệu\nlet num = 10;        // Number\nlet text = \"Hello\"; // String\nlet flag = true;    // Boolean</code></pre>",
                25, false);
        createLesson(module1, 3, "Hàm trong JavaScript", "TEXT",
                "<h2>Functions</h2><pre><code>function greet(name) {\n  return \"Hello, \" + name;\n}\n\n// Arrow function\nconst greet2 = (name) => {\n  return \"Hello, \" + name;\n};</code></pre>",
                30, false);

        CourseModule module2 = createModule(course, 2, "DOM Manipulation",
                "Học cách tương tác với DOM để thay đổi nội dung trang web.");
        createLesson(module2, 1, "Truy cập DOM elements", "TEXT",
                "<h2>DOM Methods</h2><pre><code>// getElementById\nconst element = document.getElementById('myId');\n\n// querySelector\nconst element2 = document.querySelector('.myClass');\n\n// querySelectorAll\nconst elements = document.querySelectorAll('p');</code></pre>",
                25, false);
        createLesson(module2, 2, "Thay đổi nội dung", "TEXT",
                "<h2>Modify DOM</h2><pre><code>element.textContent = \"New text\";\nelement.innerHTML = \"&lt;strong&gt;Bold&lt;/strong&gt;\";\nelement.style.color = \"red\";</code></pre>",
                30, false);
        
        // Quiz cuối khóa học - bài học cuối cùng
        CourseModule finalModule = createModule(course, 3, "Kiểm tra cuối khóa",
                "Bài kiểm tra tổng hợp toàn bộ kiến thức đã học trong khóa học.");
        createQuizLesson(finalModule, 1, "Kiểm tra cuối khóa: JavaScript cơ bản", 
                createJavaScriptFinalQuiz(), 25, false);

        return course;
    }

    private Course createGitCourse() {
        Course course = Course.builder()
                .title("Git và GitHub cơ bản")
                .description("Học cách sử dụng Git và GitHub để quản lý mã nguồn, làm việc nhóm, và version control. Kỹ năng cần thiết cho mọi developer.")
                .instructor("CareerMate Team")
                .category("TECHNICAL")
                .level(Course.CourseLevel.BEGINNER)
                .durationHours(8)
                .price(BigDecimal.ZERO)
                .isPremium(false)
                .build();
        course = courseRepository.save(course);

        CourseModule module1 = createModule(course, 1, "Git cơ bản",
                "Học các lệnh Git cơ bản để quản lý version control.");
        createLesson(module1, 1, "Giới thiệu Git", "TEXT",
                "<h2>Git là gì?</h2><p>Git là hệ thống quản lý phiên bản phân tán (Distributed Version Control System).</p><h3>Lợi ích:</h3><ul><li>Theo dõi thay đổi code</li><li>Làm việc nhóm dễ dàng</li><li>Khôi phục phiên bản cũ</li><li>Branch và merge</li></ul>",
                20, true);
        createLesson(module1, 2, "Các lệnh Git cơ bản", "TEXT",
                "<h2>Git Commands</h2><pre><code>git init          # Khởi tạo repository\ngit add .         # Thêm file vào staging\ngit commit -m \"message\"  # Commit thay đổi\ngit status        # Xem trạng thái\ngit log           # Xem lịch sử commit</code></pre>",
                25, false);
        createLesson(module1, 3, "Branch và Merge", "TEXT",
                "<h2>Branching</h2><pre><code>git branch              # Xem các branch\ngit branch new-feature  # Tạo branch mới\ngit checkout new-feature # Chuyển branch\ngit merge new-feature   # Merge branch</code></pre>",
                30, false);

        CourseModule module2 = createModule(course, 2, "GitHub",
                "Học cách sử dụng GitHub để lưu trữ và chia sẻ code.");
        createLesson(module2, 1, "Giới thiệu GitHub", "TEXT",
                "<h2>GitHub là gì?</h2><p>GitHub là nền tảng lưu trữ code trên cloud, sử dụng Git.</p><h3>Tính năng:</h3><ul><li>Lưu trữ code online</li><li>Pull Request</li><li>Issues tracking</li><li>Collaboration</li></ul>",
                20, false);
        createLesson(module2, 2, "Push và Pull", "TEXT",
                "<h2>Remote Repository</h2><pre><code>git remote add origin https://github.com/user/repo.git\ngit push -u origin main    # Push code lên GitHub\ngit pull                    # Pull code từ GitHub\ngit clone URL               # Clone repository</code></pre>",
                25, false);
        
        // Quiz cuối khóa học - bài học cuối cùng
        CourseModule finalModule = createModule(course, 3, "Kiểm tra cuối khóa",
                "Bài kiểm tra tổng hợp toàn bộ kiến thức đã học trong khóa học.");
        createQuizLesson(finalModule, 1, "Kiểm tra cuối khóa: Git và GitHub", 
                createGitFinalQuiz(), 20, false);

        return course;
    }

    private Course createJavaAdvancedCourse() {
        Course course = Course.builder()
                .title("Lập trình Java nâng cao")
                .description("Khóa học nâng cao về Java: Collections, Streams, Multithreading, Design Patterns, và Spring Framework. Dành cho người đã có kiến thức Java cơ bản.")
                .instructor("Senior Java Developer")
                .category("TECHNICAL")
                .level(Course.CourseLevel.ADVANCED)
                .durationHours(40)
                .price(new BigDecimal("500000"))
                .isPremium(true)
                .build();
        course = courseRepository.save(course);

        CourseModule module1 = createModule(course, 1, "Java Collections Framework",
                "Tìm hiểu về các collection classes trong Java: List, Set, Map, và cách sử dụng hiệu quả.");
        createLesson(module1, 1, "Tổng quan về Collections", "TEXT",
                "<h2>Java Collections Framework</h2><p>Collections là các cấu trúc dữ liệu được xây dựng sẵn trong Java.</p><h3>Các interface chính:</h3><ul><li>List: Danh sách có thứ tự</li><li>Set: Tập hợp không trùng lặp</li><li>Map: Cặp key-value</li><li>Queue: Hàng đợi</li></ul>",
                30, true);
        createLesson(module1, 2, "ArrayList vs LinkedList", "TEXT",
                "<h2>So sánh ArrayList và LinkedList</h2><p><strong>ArrayList:</strong> Truy cập nhanh, thêm/xóa chậm ở giữa</p><p><strong>LinkedList:</strong> Thêm/xóa nhanh, truy cập chậm</p>",
                25, false);
        createLesson(module1, 3, "HashMap và TreeMap", "TEXT",
                "<h2>Map implementations</h2><p>HashMap: O(1) average, không có thứ tự</p><p>TreeMap: O(log n), có thứ tự</p>",
                30, false);

        CourseModule module2 = createModule(course, 2, "Java Streams API",
                "Học cách sử dụng Streams API để xử lý dữ liệu một cách functional và hiệu quả.");
        createLesson(module2, 1, "Giới thiệu Streams", "TEXT",
                "<h2>Java Streams</h2><p>Streams cho phép xử lý collections theo cách functional programming.</p><pre><code>List&lt;String&gt; names = Arrays.asList(\"John\", \"Jane\", \"Bob\");\nnames.stream()\n    .filter(name -&gt; name.startsWith(\"J\"))\n    .map(String::toUpperCase)\n    .forEach(System.out::println);</code></pre>",
                35, false);
        createLesson(module2, 2, "Stream Operations", "TEXT",
                "<h2>Các operations trong Stream</h2><ul><li>filter(): Lọc</li><li>map(): Chuyển đổi</li><li>reduce(): Tổng hợp</li><li>collect(): Thu thập</li></ul>",
                30, false);

        CourseModule module3 = createModule(course, 3, "Multithreading",
                "Học về concurrency và multithreading trong Java.");
        createLesson(module3, 1, "Thread và Runnable", "TEXT",
                "<h2>Multithreading cơ bản</h2><pre><code>Thread thread = new Thread(() -&gt; {\n    System.out.println(\"Running in thread\");\n});\nthread.start();</code></pre>",
                40, false);
        createLesson(module3, 2, "Synchronization", "TEXT",
                "<h2>Đồng bộ hóa</h2><p>Sử dụng synchronized để tránh race condition.</p>",
                35, false);
        
        // Quiz cuối khóa học - bài học cuối cùng
        CourseModule finalModule = createModule(course, 4, "Kiểm tra cuối khóa",
                "Bài kiểm tra tổng hợp toàn bộ kiến thức đã học trong khóa học.");
        createQuizLesson(finalModule, 1, "Kiểm tra cuối khóa: Lập trình Java nâng cao", 
                createJavaAdvancedFinalQuiz(), 35, false);

        return course;
    }

    private Course createFullstackCourse() {
        Course course = Course.builder()
                .title("Full-stack Web Development")
                .description("Khóa học toàn diện về phát triển web full-stack: React, Node.js, Express, MongoDB. Xây dựng ứng dụng web hoàn chỉnh từ đầu đến cuối.")
                .instructor("Full-stack Developer")
                .category("TECHNICAL")
                .level(Course.CourseLevel.INTERMEDIATE)
                .durationHours(60)
                .price(new BigDecimal("800000"))
                .isPremium(true)
                .build();
        course = courseRepository.save(course);

        CourseModule module1 = createModule(course, 1, "Frontend với React",
                "Học React từ cơ bản đến nâng cao: Components, Hooks, State Management.");
        createLesson(module1, 1, "Giới thiệu React", "TEXT",
                "<h2>React là gì?</h2><p>React là thư viện JavaScript để xây dựng giao diện người dùng.</p><h3>Đặc điểm:</h3><ul><li>Component-based</li><li>Virtual DOM</li><li>Unidirectional data flow</li></ul>",
                30, true);
        createLesson(module1, 2, "React Components", "TEXT",
                "<h2>Components trong React</h2><pre><code>function Welcome(props) {\n    return &lt;h1&gt;Hello, {props.name}&lt;/h1&gt;;\n}</code></pre>",
                35, false);
        createLesson(module1, 3, "React Hooks", "TEXT",
                "<h2>Hooks trong React</h2><pre><code>const [count, setCount] = useState(0);\nuseEffect(() =&gt; {\n    document.title = `Count: ${count}`;\n}, [count]);</code></pre>",
                40, false);

        CourseModule module2 = createModule(course, 2, "Backend với Node.js",
                "Xây dựng API server với Node.js và Express.");
        createLesson(module2, 1, "Node.js cơ bản", "TEXT",
                "<h2>Node.js</h2><p>Node.js cho phép chạy JavaScript ở server-side.</p>",
                30, false);
        createLesson(module2, 2, "Express Framework", "TEXT",
                "<h2>Express.js</h2><pre><code>const express = require('express');\nconst app = express();\napp.get('/', (req, res) =&gt; {\n    res.send('Hello World');\n});</code></pre>",
                35, false);

        CourseModule module3 = createModule(course, 3, "Database với MongoDB",
                "Làm việc với MongoDB - NoSQL database.");
        createLesson(module3, 1, "MongoDB cơ bản", "TEXT",
                "<h2>MongoDB</h2><p>MongoDB là document database, linh hoạt và dễ mở rộng.</p>",
                30, false);
        
        // Quiz cuối khóa học - bài học cuối cùng
        CourseModule finalModule = createModule(course, 4, "Kiểm tra cuối khóa",
                "Bài kiểm tra tổng hợp toàn bộ kiến thức đã học trong khóa học.");
        createQuizLesson(finalModule, 1, "Kiểm tra cuối khóa: Full-stack Web Development", 
                createFullstackFinalQuiz(), 40, false);

        return course;
    }

    private Course createDataScienceCourse() {
        Course course = Course.builder()
                .title("Data Science với Python")
                .description("Khóa học Data Science toàn diện: Python, Pandas, NumPy, Matplotlib, Machine Learning. Phân tích dữ liệu và xây dựng mô hình dự đoán.")
                .instructor("Data Scientist")
                .category("TECHNICAL")
                .level(Course.CourseLevel.ADVANCED)
                .durationHours(50)
                .price(new BigDecimal("1000000"))
                .isPremium(true)
                .build();
        course = courseRepository.save(course);

        CourseModule module1 = createModule(course, 1, "Python cho Data Science",
                "Học Python và các thư viện cơ bản: NumPy, Pandas.");
        createLesson(module1, 1, "Python cơ bản", "TEXT",
                "<h2>Python cho Data Science</h2><p>Python là ngôn ngữ phổ biến nhất trong Data Science.</p>",
                30, true);
        createLesson(module1, 2, "NumPy - Xử lý mảng", "TEXT",
                "<h2>NumPy</h2><pre><code>import numpy as np\narr = np.array([1, 2, 3, 4, 5])</code></pre>",
                35, false);
        createLesson(module1, 3, "Pandas - Phân tích dữ liệu", "TEXT",
                "<h2>Pandas</h2><pre><code>import pandas as pd\ndf = pd.read_csv('data.csv')</code></pre>",
                40, false);

        CourseModule module2 = createModule(course, 2, "Visualization",
                "Vẽ biểu đồ và trực quan hóa dữ liệu với Matplotlib và Seaborn.");
        createLesson(module2, 1, "Matplotlib cơ bản", "TEXT",
                "<h2>Matplotlib</h2><p>Thư viện vẽ biểu đồ phổ biến nhất trong Python.</p>",
                30, false);

        CourseModule module3 = createModule(course, 3, "Machine Learning",
                "Giới thiệu về Machine Learning và các thuật toán cơ bản.");
        createLesson(module3, 1, "Giới thiệu Machine Learning", "TEXT",
                "<h2>Machine Learning</h2><p>ML là khả năng của máy tính học từ dữ liệu mà không cần lập trình rõ ràng.</p>",
                35, false);
        createLesson(module3, 2, "Linear Regression", "TEXT",
                "<h2>Linear Regression</h2><p>Thuật toán dự đoán giá trị liên tục.</p>",
                40, false);
        
        // Quiz cuối khóa học - bài học cuối cùng
        CourseModule finalModule = createModule(course, 4, "Kiểm tra cuối khóa",
                "Bài kiểm tra tổng hợp toàn bộ kiến thức đã học trong khóa học.");
        createQuizLesson(finalModule, 1, "Kiểm tra cuối khóa: Data Science với Python", 
                createDataScienceFinalQuiz(), 40, false);

        return course;
    }

    private CourseModule createModule(Course course, int orderIndex, String title, String description) {
        CourseModule module = CourseModule.builder()
                .course(course)
                .title(title)
                .description(description)
                .orderIndex(orderIndex)
                .build();
        return moduleRepository.save(module);
    }

    private Lesson createLesson(CourseModule module, int orderIndex, String title, String type, 
                                String content, Integer durationMinutes, Boolean isPreview) {
        Lesson lesson = Lesson.builder()
                .module(module)
                .title(title)
                .type(Lesson.LessonType.valueOf(type))
                .content(content)
                .durationMinutes(durationMinutes)
                .orderIndex(orderIndex)
                .isPreview(isPreview)
                .build();
        return lessonRepository.save(lesson);
    }

    private Lesson createQuizLesson(CourseModule module, int orderIndex, String title,
                                    String quizJson, Integer durationMinutes, Boolean isPreview) {
        Lesson lesson = Lesson.builder()
                .module(module)
                .title(title)
                .type(Lesson.LessonType.QUIZ)
                .content(quizJson)
                .durationMinutes(durationMinutes)
                .orderIndex(orderIndex)
                .isPreview(isPreview)
                .build();
        return lessonRepository.save(lesson);
    }

    // Quiz cuối khóa: Java Basic (12 câu)
    private String createJavaBasicFinalQuiz() {
        return "{\"questions\":[" +
                "{\"id\":1,\"question\":\"Kiểu dữ liệu nào trong Java dùng để lưu số nguyên?\",\"options\":[\"int\",\"double\",\"String\",\"boolean\"],\"correctAnswer\":0,\"explanationCorrect\":\"Đúng! 'int' là kiểu dữ liệu nguyên thủy trong Java dùng để lưu số nguyên.\",\"explanationWrong\":\"Sai! 'int' là kiểu dữ liệu đúng. 'double' dùng cho số thực, 'String' cho chuỗi, 'boolean' cho true/false.\"}," +
                "{\"id\":2,\"question\":\"Toán tử nào trong Java dùng để chia lấy phần dư?\",\"options\":[\"/\",\"%\",\"*\",\"+\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Toán tử '%' (modulo) dùng để chia lấy phần dư. Ví dụ: 10 % 3 = 1.\",\"explanationWrong\":\"Sai! Toán tử '%' là đúng. '/' là chia thường, '*' là nhân, '+' là cộng.\"}," +
                "{\"id\":3,\"question\":\"Vòng lặp nào trong Java thực thi ít nhất 1 lần?\",\"options\":[\"for\",\"while\",\"do-while\",\"Tất cả đều giống nhau\"],\"correctAnswer\":2,\"explanationCorrect\":\"Đúng! Vòng lặp 'do-while' kiểm tra điều kiện ở cuối, nên sẽ thực thi ít nhất 1 lần.\",\"explanationWrong\":\"Sai! 'do-while' là đúng. 'for' và 'while' kiểm tra điều kiện ở đầu, có thể không thực thi lần nào.\"}," +
                "{\"id\":4,\"question\":\"Cú pháp nào đúng để khai báo biến trong Java?\",\"options\":[\"int x = 10;\",\"x = 10 int;\",\"int 10 = x;\",\"x int = 10;\"],\"correctAnswer\":0,\"explanationCorrect\":\"Đúng! Cú pháp đúng là: kiểu_dữ_liệu tên_biến = giá_trị; Ví dụ: int x = 10;\",\"explanationWrong\":\"Sai! Cú pháp đúng là 'int x = 10;'. Thứ tự phải là: kiểu dữ liệu, tên biến, dấu =, giá trị.\"}," +
                "{\"id\":5,\"question\":\"Class trong Java là gì?\",\"options\":[\"Một biến\",\"Khuôn mẫu để tạo object\",\"Một phương thức\",\"Một toán tử\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Class là khuôn mẫu (template) để tạo các object. Nó định nghĩa các thuộc tính và phương thức mà object sẽ có.\",\"explanationWrong\":\"Sai! Class là khuôn mẫu để tạo object, không phải biến, phương thức hay toán tử.\"}," +
                "{\"id\":6,\"question\":\"Object trong Java là gì?\",\"options\":[\"Một class\",\"Thể hiện cụ thể của class\",\"Một phương thức\",\"Một biến\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Object là thể hiện cụ thể (instance) của class. Một class có thể tạo nhiều object.\",\"explanationWrong\":\"Sai! Object là thể hiện cụ thể của class, không phải class, phương thức hay biến.\"}," +
                "{\"id\":7,\"question\":\"Từ khóa nào trong Java dùng để tạo object mới?\",\"options\":[\"new\",\"create\",\"make\",\"build\"],\"correctAnswer\":0,\"explanationCorrect\":\"Đúng! Từ khóa 'new' dùng để tạo object mới. Ví dụ: Student s = new Student();\",\"explanationWrong\":\"Sai! Từ khóa 'new' là đúng. 'create', 'make', 'build' không phải từ khóa trong Java.\"}," +
                "{\"id\":8,\"question\":\"Phương thức nào là phương thức đặc biệt được gọi khi tạo object?\",\"options\":[\"main()\",\"toString()\",\"Constructor\",\"getter()\"],\"correctAnswer\":2,\"explanationCorrect\":\"Đúng! Constructor là phương thức đặc biệt được gọi tự động khi tạo object, có tên trùng với tên class.\",\"explanationWrong\":\"Sai! Constructor là đúng. 'main()' là entry point, 'toString()' và 'getter()' là phương thức thông thường.\"}," +
                "{\"id\":9,\"question\":\"Phương thức main() trong Java có kiểu trả về là gì?\",\"options\":[\"void\",\"int\",\"String\",\"Object\"],\"correctAnswer\":0,\"explanationCorrect\":\"Đúng! Phương thức main() có kiểu trả về là 'void', nghĩa là không trả về giá trị nào.\",\"explanationWrong\":\"Sai! Phương thức main() có kiểu trả về là 'void', không phải int, String hay Object.\"}," +
                "{\"id\":10,\"question\":\"Trong Java, từ khóa 'static' có nghĩa là gì?\",\"options\":[\"Biến không thể thay đổi\",\"Thuộc về class, không thuộc về object\",\"Chỉ dùng trong vòng lặp\",\"Từ khóa không tồn tại\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! 'static' có nghĩa là thuộc về class, không thuộc về object cụ thể. Có thể truy cập mà không cần tạo object.\",\"explanationWrong\":\"Sai! 'static' có nghĩa là thuộc về class, không thuộc về object. Không phải về biến không đổi hay vòng lặp.\"}," +
                "{\"id\":11,\"question\":\"Cú pháp nào đúng để khai báo mảng trong Java?\",\"options\":[\"int[] arr = new int[5];\",\"int arr[] = new int(5);\",\"array int arr = [5];\",\"int arr = array[5];\"],\"correctAnswer\":0,\"explanationCorrect\":\"Đúng! Cú pháp đúng là: int[] arr = new int[5]; Tạo mảng 5 phần tử kiểu int.\",\"explanationWrong\":\"Sai! Cú pháp đúng là 'int[] arr = new int[5];'. Dùng dấu [] và new int[size].\"}," +
                "{\"id\":12,\"question\":\"Trong Java, phương thức nào dùng để so sánh nội dung của 2 chuỗi?\",\"options\":[\"==\",\"equals()\",\"compare()\",\"same()\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Phương thức equals() dùng để so sánh nội dung của 2 chuỗi. Toán tử == chỉ so sánh địa chỉ.\",\"explanationWrong\":\"Sai! Phương thức equals() là đúng. Toán tử == chỉ so sánh địa chỉ, không so sánh nội dung.\"}" +
                "]}";
    }

    // Quiz cuối khóa: CV Writing (12 câu)
    private String createCVWritingFinalQuiz() {
        return "{\"questions\":[" +
                "{\"id\":1,\"question\":\"Mục tiêu nghề nghiệp trong CV nên dài bao nhiêu?\",\"options\":[\"1 trang\",\"2-3 câu\",\"1 đoạn dài\",\"Không cần thiết\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Mục tiêu nghề nghiệp nên ngắn gọn, chỉ 2-3 câu để nhà tuyển dụng nhanh chóng nắm bắt được định hướng của bạn.\",\"explanationWrong\":\"Sai! Mục tiêu nghề nghiệp nên ngắn gọn 2-3 câu. Quá dài sẽ làm nhà tuyển dụng mất tập trung.\"}," +
                "{\"id\":2,\"question\":\"Công thức STAR trong CV là gì?\",\"options\":[\"Situation, Task, Action, Result\",\"Start, Time, Action, Review\",\"Simple, Technical, Advanced, Review\",\"Không có công thức này\"],\"correctAnswer\":0,\"explanationCorrect\":\"Đúng! STAR là Situation (Tình huống), Task (Nhiệm vụ), Action (Hành động), Result (Kết quả). Giúp mô tả kinh nghiệm một cách có cấu trúc.\",\"explanationWrong\":\"Sai! STAR là Situation, Task, Action, Result. Đây là công thức phổ biến để mô tả kinh nghiệm làm việc.\"}," +
                "{\"id\":3,\"question\":\"CV nên có độ dài bao nhiêu trang?\",\"options\":[\"1 trang\",\"2-3 trang\",\"Càng dài càng tốt\",\"Không giới hạn\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! CV nên dài 2-3 trang cho sinh viên/người mới. Quá ngắn thiếu thông tin, quá dài làm nhà tuyển dụng mệt mỏi.\",\"explanationWrong\":\"Sai! CV nên dài 2-3 trang. 1 trang quá ngắn, còn quá dài sẽ không được đọc hết.\"}," +
                "{\"id\":4,\"question\":\"Phần nào trong CV nên đặt ở đầu?\",\"options\":[\"Kinh nghiệm làm việc\",\"Học vấn\",\"Thông tin cá nhân\",\"Kỹ năng\"],\"correctAnswer\":2,\"explanationCorrect\":\"Đúng! Thông tin cá nhân (tên, email, số điện thoại) nên đặt ở đầu CV để nhà tuyển dụng dễ liên hệ.\",\"explanationWrong\":\"Sai! Thông tin cá nhân nên đặt ở đầu. Các phần khác có thể sắp xếp theo thứ tự quan trọng.\"}," +
                "{\"id\":5,\"question\":\"Khi mô tả kinh nghiệm làm việc, nên sử dụng động từ ở dạng nào?\",\"options\":[\"Nguyên mẫu (develop, create)\",\"Quá khứ (developed, created)\",\"Hiện tại (developing, creating)\",\"Không quan trọng\"],\"correctAnswer\":0,\"explanationCorrect\":\"Đúng! Nên dùng động từ nguyên mẫu (develop, create, manage) để thể hiện hành động mạnh mẽ và chuyên nghiệp.\",\"explanationWrong\":\"Sai! Nên dùng động từ nguyên mẫu (develop, create) để thể hiện hành động mạnh mẽ. Quá khứ và hiện tại không phù hợp.\"}," +
                "{\"id\":6,\"question\":\"Trong CV, phần kỹ năng nên liệt kê như thế nào?\",\"options\":[\"Chỉ kỹ năng kỹ thuật\",\"Chỉ kỹ năng mềm\",\"Cả kỹ năng kỹ thuật và mềm\",\"Không cần phần kỹ năng\"],\"correctAnswer\":2,\"explanationCorrect\":\"Đúng! Nên liệt kê cả kỹ năng kỹ thuật (lập trình, công cụ) và kỹ năng mềm (giao tiếp, làm việc nhóm) để thể hiện toàn diện.\",\"explanationWrong\":\"Sai! Nên liệt kê cả kỹ năng kỹ thuật và mềm. Chỉ một loại sẽ không đầy đủ.\"}," +
                "{\"id\":7,\"question\":\"Email trong CV nên có định dạng như thế nào?\",\"options\":[\"Email cá nhân vui vẻ (cutegirl123@gmail.com)\",\"Email chuyên nghiệp (nguyen.van.a@gmail.com)\",\"Email không quan trọng\",\"Không cần email\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Email nên chuyên nghiệp, thường là tên.họ@gmail.com hoặc tên.họ@domain.com. Tránh email vui vẻ hoặc không phù hợp.\",\"explanationWrong\":\"Sai! Email nên chuyên nghiệp. Email vui vẻ hoặc không phù hợp sẽ gây ấn tượng xấu.\"}," +
                "{\"id\":8,\"question\":\"Khi viết CV, nên sử dụng font chữ như thế nào?\",\"options\":[\"Font chữ nghệ thuật, nhiều màu sắc\",\"Font chữ đơn giản, dễ đọc (Arial, Times New Roman)\",\"Font chữ không quan trọng\",\"Nhiều font chữ khác nhau\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Nên dùng font chữ đơn giản, dễ đọc như Arial, Times New Roman, Calibri. Tránh font nghệ thuật hoặc nhiều màu sắc.\",\"explanationWrong\":\"Sai! Nên dùng font chữ đơn giản, dễ đọc. Font nghệ thuật hoặc nhiều màu sắc sẽ làm CV khó đọc.\"}," +
                "{\"id\":9,\"question\":\"Trong CV, phần học vấn nên sắp xếp như thế nào?\",\"options\":[\"Từ cũ đến mới\",\"Từ mới đến cũ\",\"Ngẫu nhiên\",\"Không quan trọng\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Nên sắp xếp từ mới đến cũ (bằng cấp gần đây nhất trước) để nhà tuyển dụng thấy trình độ hiện tại trước.\",\"explanationWrong\":\"Sai! Nên sắp xếp từ mới đến cũ. Bằng cấp gần đây nhất nên đặt trước.\"}," +
                "{\"id\":10,\"question\":\"Khi mô tả dự án trong CV, nên nhấn mạnh điều gì?\",\"options\":[\"Chỉ tên dự án\",\"Kết quả và tác động (số liệu cụ thể)\",\"Chỉ công nghệ sử dụng\",\"Không cần mô tả\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Nên nhấn mạnh kết quả và tác động với số liệu cụ thể (ví dụ: tăng 30% doanh thu, giảm 50% thời gian xử lý).\",\"explanationWrong\":\"Sai! Nên nhấn mạnh kết quả và tác động với số liệu cụ thể. Chỉ tên dự án hoặc công nghệ là chưa đủ.\"}," +
                "{\"id\":11,\"question\":\"CV nên được lưu dưới định dạng nào khi gửi?\",\"options\":[\".docx (Word)\",\".pdf\",\".txt\",\".jpg\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! CV nên được lưu dưới định dạng PDF để đảm bảo định dạng không bị thay đổi khi mở trên các thiết bị khác nhau.\",\"explanationWrong\":\"Sai! CV nên được lưu dưới định dạng PDF. Word có thể bị thay đổi định dạng, txt và jpg không phù hợp.\"}," +
                "{\"id\":12,\"question\":\"Khi viết CV, nên tránh điều gì?\",\"options\":[\"Lỗi chính tả và ngữ pháp\",\"Thông tin không chính xác\",\"CV quá dài hoặc quá ngắn\",\"Tất cả các điều trên\"],\"correctAnswer\":3,\"explanationCorrect\":\"Đúng! Nên tránh tất cả: lỗi chính tả, thông tin không chính xác, CV quá dài/ngắn. Những điều này sẽ gây ấn tượng xấu.\",\"explanationWrong\":\"Sai! Nên tránh tất cả các điều trên. Lỗi chính tả, thông tin sai, CV quá dài/ngắn đều không tốt.\"}" +
                "]}";
    }

    // Quiz cuối khóa: Interview Skills (12 câu)
    private String createInterviewSkillsFinalQuiz() {
        return "{\"questions\":[" +
                "{\"id\":1,\"question\":\"Bạn nên đến phỏng vấn sớm bao nhiêu phút?\",\"options\":[\"30 phút\",\"10-15 phút\",\"Đúng giờ\",\"Muộn 5 phút\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Đến sớm 10-15 phút là lý tưởng. Đến quá sớm gây bất tiện, đến muộn thể hiện thiếu chuyên nghiệp.\",\"explanationWrong\":\"Sai! Nên đến sớm 10-15 phút. Đến quá sớm (30 phút) gây bất tiện, đến muộn rất không chuyên nghiệp.\"}," +
                "{\"id\":2,\"question\":\"Khi gặp câu hỏi khó trong phỏng vấn, bạn nên làm gì?\",\"options\":[\"Trả lời ngay không suy nghĩ\",\"Dừng lại suy nghĩ, yêu cầu làm rõ nếu cần\",\"Nói không biết ngay\",\"Bỏ qua câu hỏi\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Khi gặp câu hỏi khó, nên dừng lại suy nghĩ một chút, có thể yêu cầu làm rõ câu hỏi. Điều này thể hiện sự cẩn thận và chuyên nghiệp.\",\"explanationWrong\":\"Sai! Nên dừng lại suy nghĩ và yêu cầu làm rõ nếu cần. Trả lời vội vàng hoặc bỏ qua đều không tốt.\"}," +
                "{\"id\":3,\"question\":\"Trước khi phỏng vấn, bạn nên làm gì?\",\"options\":[\"Không cần chuẩn bị gì\",\"Nghiên cứu công ty và vị trí\",\"Chỉ chuẩn bị câu trả lời\",\"Chỉ xem địa chỉ\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Nghiên cứu công ty, sản phẩm, văn hóa và vị trí ứng tuyển giúp bạn tự tin và thể hiện sự quan tâm thực sự.\",\"explanationWrong\":\"Sai! Nên nghiên cứu kỹ công ty và vị trí. Chuẩn bị tốt giúp bạn tự tin và gây ấn tượng tốt.\"}," +
                "{\"id\":4,\"question\":\"Khi trả lời câu hỏi về điểm yếu, bạn nên:\",\"options\":[\"Nói không có điểm yếu\",\"Nói điểm yếu thật nhưng kèm cách khắc phục\",\"Chỉ nói điểm yếu\",\"Từ chối trả lời\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Nên thành thật về điểm yếu nhưng quan trọng là thể hiện bạn đã nhận ra và đang khắc phục. Điều này cho thấy khả năng tự nhận thức và phát triển.\",\"explanationWrong\":\"Sai! Nên nói điểm yếu thật kèm cách khắc phục. Nói không có điểm yếu hoặc từ chối trả lời đều không tốt.\"}," +
                "{\"id\":5,\"question\":\"Khi được hỏi 'Tại sao bạn muốn làm việc ở đây?', bạn nên:\",\"options\":[\"Nói về lương cao\",\"Nói về công ty và vị trí cụ thể\",\"Nói không biết\",\"Từ chối trả lời\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Nên nói về công ty và vị trí cụ thể, thể hiện bạn đã nghiên cứu và thực sự quan tâm. Tránh chỉ nói về lương.\",\"explanationWrong\":\"Sai! Nên nói về công ty và vị trí cụ thể. Chỉ nói về lương sẽ gây ấn tượng xấu.\"}," +
                "{\"id\":6,\"question\":\"Trong phỏng vấn, trang phục nên như thế nào?\",\"options\":[\"Thoải mái, tự do\",\"Chuyên nghiệp, phù hợp với văn hóa công ty\",\"Càng đắt tiền càng tốt\",\"Không quan trọng\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Trang phục nên chuyên nghiệp và phù hợp với văn hóa công ty. Nghiên cứu dress code của công ty trước.\",\"explanationWrong\":\"Sai! Trang phục nên chuyên nghiệp và phù hợp. Thoải mái quá hoặc không phù hợp sẽ gây ấn tượng xấu.\"}," +
                "{\"id\":7,\"question\":\"Khi được hỏi về mức lương mong muốn, bạn nên:\",\"options\":[\"Nói số tiền cụ thể ngay\",\"Nghiên cứu mức lương thị trường trước, đưa ra khoảng hợp lý\",\"Từ chối trả lời\",\"Nói càng cao càng tốt\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Nên nghiên cứu mức lương thị trường cho vị trí tương tự, đưa ra khoảng lương hợp lý dựa trên kinh nghiệm và kỹ năng.\",\"explanationWrong\":\"Sai! Nên nghiên cứu mức lương thị trường và đưa ra khoảng hợp lý. Nói quá cao hoặc từ chối đều không tốt.\"}," +
                "{\"id\":8,\"question\":\"Khi kết thúc phỏng vấn, bạn nên:\",\"options\":[\"Rời đi ngay\",\"Cảm ơn và hỏi về bước tiếp theo\",\"Yêu cầu trả lời ngay\",\"Không nói gì\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Nên cảm ơn người phỏng vấn và hỏi về bước tiếp theo hoặc thời gian nhận kết quả. Thể hiện sự chuyên nghiệp.\",\"explanationWrong\":\"Sai! Nên cảm ơn và hỏi về bước tiếp theo. Rời đi ngay hoặc yêu cầu trả lời ngay đều không phù hợp.\"}," +
                "{\"id\":9,\"question\":\"Khi trả lời câu hỏi 'Giới thiệu về bản thân', bạn nên:\",\"options\":[\"Kể toàn bộ cuộc đời\",\"Tóm tắt ngắn gọn: học vấn, kinh nghiệm, kỹ năng liên quan đến vị trí\",\"Chỉ nói tên tuổi\",\"Từ chối trả lời\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Nên tóm tắt ngắn gọn (1-2 phút) về học vấn, kinh nghiệm và kỹ năng liên quan đến vị trí ứng tuyển.\",\"explanationWrong\":\"Sai! Nên tóm tắt ngắn gọn về học vấn, kinh nghiệm, kỹ năng liên quan. Quá dài hoặc quá ngắn đều không tốt.\"}," +
                "{\"id\":10,\"question\":\"Trong phỏng vấn, body language quan trọng như thế nào?\",\"options\":[\"Không quan trọng\",\"Rất quan trọng - giao tiếp bằng mắt, tư thế tự tin\",\"Chỉ quan trọng khi nói\",\"Không cần chú ý\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Body language rất quan trọng. Giao tiếp bằng mắt, tư thế tự tin, nụ cười thân thiện sẽ tạo ấn tượng tích cực.\",\"explanationWrong\":\"Sai! Body language rất quan trọng. Giao tiếp bằng mắt, tư thế tự tin sẽ tạo ấn tượng tốt.\"}," +
                "{\"id\":11,\"question\":\"Khi được hỏi về câu hỏi của bạn cho nhà tuyển dụng, bạn nên:\",\"options\":[\"Nói không có câu hỏi\",\"Hỏi về công ty, vị trí, cơ hội phát triển\",\"Chỉ hỏi về lương\",\"Từ chối trả lời\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Nên hỏi về công ty, vị trí, cơ hội phát triển, văn hóa làm việc. Thể hiện sự quan tâm thực sự.\",\"explanationWrong\":\"Sai! Nên hỏi về công ty, vị trí, cơ hội phát triển. Không có câu hỏi hoặc chỉ hỏi về lương đều không tốt.\"}," +
                "{\"id\":12,\"question\":\"Sau phỏng vấn, bạn nên làm gì?\",\"options\":[\"Không làm gì\",\"Gửi email cảm ơn trong vòng 24 giờ\",\"Gọi điện hỏi kết quả ngay\",\"Gửi nhiều email liên tục\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Nên gửi email cảm ơn trong vòng 24 giờ sau phỏng vấn. Nhắc lại sự quan tâm và điểm mạnh của bạn.\",\"explanationWrong\":\"Sai! Nên gửi email cảm ơn trong vòng 24 giờ. Không làm gì hoặc gọi điện/gửi nhiều email đều không phù hợp.\"}" +
                "]}";
    }

    // Quiz cuối khóa: HTML/CSS (12 câu)
    private String createHTMLCSSFinalQuiz() {
        return "{\"questions\":[" +
                "{\"id\":1,\"question\":\"HTML là viết tắt của gì?\",\"options\":[\"HyperText Markup Language\",\"High Tech Markup Language\",\"Home Tool Markup Language\",\"Hyperlink Text Markup\"],\"correctAnswer\":0,\"explanationCorrect\":\"Đúng! HTML là HyperText Markup Language - ngôn ngữ đánh dấu siêu văn bản.\",\"explanationWrong\":\"Sai! HTML là HyperText Markup Language. Đây là ngôn ngữ cơ bản để tạo cấu trúc trang web.\"}," +
                "{\"id\":2,\"question\":\"Thẻ nào trong HTML dùng để tạo tiêu đề lớn nhất?\",\"options\":[\"&lt;h1&gt;\",\"&lt;h6&gt;\",\"&lt;title&gt;\",\"&lt;header&gt;\"],\"correctAnswer\":0,\"explanationCorrect\":\"Đúng! Thẻ &lt;h1&gt; dùng để tạo tiêu đề lớn nhất. Có 6 cấp độ từ h1 đến h6.\",\"explanationWrong\":\"Sai! Thẻ &lt;h1&gt; là đúng. h6 là nhỏ nhất, title và header là thẻ khác.\"}," +
                "{\"id\":3,\"question\":\"CSS là viết tắt của gì?\",\"options\":[\"Computer Style Sheets\",\"Cascading Style Sheets\",\"Creative Style Sheets\",\"Colorful Style Sheets\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! CSS là Cascading Style Sheets - bảng định kiểu xếp tầng.\",\"explanationWrong\":\"Sai! CSS là Cascading Style Sheets. 'Cascading' có nghĩa là xếp tầng, cho phép kế thừa style.\"}," +
                "{\"id\":4,\"question\":\"Selector nào trong CSS có độ ưu tiên cao nhất?\",\"options\":[\"Element selector (p)\",\"Class selector (.class)\",\"ID selector (#id)\",\"Tất cả bằng nhau\"],\"correctAnswer\":2,\"explanationCorrect\":\"Đúng! ID selector (#id) có độ ưu tiên cao nhất, tiếp theo là class, cuối cùng là element.\",\"explanationWrong\":\"Sai! ID selector (#id) có độ ưu tiên cao nhất. Thứ tự: ID > Class > Element.\"}," +
                "{\"id\":5,\"question\":\"Flexbox là gì?\",\"options\":[\"Một layout model\",\"Một thẻ HTML\",\"Một ngôn ngữ lập trình\",\"Một framework\"],\"correctAnswer\":0,\"explanationCorrect\":\"Đúng! Flexbox là một layout model trong CSS giúp sắp xếp và căn chỉnh các phần tử một cách linh hoạt.\",\"explanationWrong\":\"Sai! Flexbox là một layout model trong CSS, không phải thẻ HTML hay ngôn ngữ lập trình.\"}," +
                "{\"id\":6,\"question\":\"Thuộc tính CSS nào dùng để thay đổi màu chữ?\",\"options\":[\"background-color\",\"color\",\"font-color\",\"text-color\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Thuộc tính 'color' dùng để thay đổi màu chữ. background-color dùng cho màu nền.\",\"explanationWrong\":\"Sai! Thuộc tính 'color' là đúng. background-color dùng cho màu nền, không phải chữ.\"}," +
                "{\"id\":7,\"question\":\"Thẻ nào trong HTML dùng để tạo liên kết?\",\"options\":[\"&lt;link&gt;\",\"&lt;a&gt;\",\"&lt;url&gt;\",\"&lt;href&gt;\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Thẻ &lt;a&gt; (anchor) dùng để tạo liên kết. Cần thuộc tính href để chỉ định URL.\",\"explanationWrong\":\"Sai! Thẻ &lt;a&gt; là đúng. link dùng cho stylesheet, url và href không phải thẻ.\"}," +
                "{\"id\":8,\"question\":\"Thuộc tính CSS nào dùng để căn giữa phần tử theo chiều ngang?\",\"options\":[\"align-center\",\"text-align: center\",\"margin: 0 auto\",\"Cả B và C\"],\"correctAnswer\":3,\"explanationCorrect\":\"Đúng! Có thể dùng 'text-align: center' cho text hoặc 'margin: 0 auto' cho block element. Cả hai đều đúng tùy trường hợp.\",\"explanationWrong\":\"Sai! Cả 'text-align: center' và 'margin: 0 auto' đều có thể dùng, tùy vào loại phần tử.\"}," +
                "{\"id\":9,\"question\":\"Thẻ nào trong HTML dùng để chèn hình ảnh?\",\"options\":[\"&lt;img&gt;\",\"&lt;image&gt;\",\"&lt;picture&gt;\",\"&lt;photo&gt;\"],\"correctAnswer\":0,\"explanationCorrect\":\"Đúng! Thẻ &lt;img&gt; dùng để chèn hình ảnh. Cần thuộc tính src để chỉ định đường dẫn.\",\"explanationWrong\":\"Sai! Thẻ &lt;img&gt; là đúng. image, picture, photo không phải thẻ HTML chuẩn.\"}," +
                "{\"id\":10,\"question\":\"Responsive design là gì?\",\"options\":[\"Thiết kế chỉ cho desktop\",\"Thiết kế tự động điều chỉnh theo kích thước màn hình\",\"Thiết kế cố định\",\"Thiết kế chỉ cho mobile\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Responsive design là thiết kế tự động điều chỉnh layout và nội dung theo kích thước màn hình khác nhau.\",\"explanationWrong\":\"Sai! Responsive design là thiết kế tự động điều chỉnh theo màn hình, không phải cố định cho một loại thiết bị.\"}," +
                "{\"id\":11,\"question\":\"Media query trong CSS dùng để làm gì?\",\"options\":[\"Tạo animation\",\"Áp dụng style dựa trên điều kiện (như kích thước màn hình)\",\"Tạo màu sắc\",\"Tạo font chữ\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Media query cho phép áp dụng CSS dựa trên điều kiện như kích thước màn hình, hướng thiết bị, v.v. Rất quan trọng cho responsive design.\",\"explanationWrong\":\"Sai! Media query dùng để áp dụng style dựa trên điều kiện, không phải cho animation hay màu sắc.\"}," +
                "{\"id\":12,\"question\":\"Box model trong CSS bao gồm những gì?\",\"options\":[\"Chỉ margin\",\"Content, padding, border, margin\",\"Chỉ border\",\"Content và padding\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Box model bao gồm: Content (nội dung), Padding (khoảng cách trong), Border (viền), Margin (khoảng cách ngoài).\",\"explanationWrong\":\"Sai! Box model bao gồm Content, Padding, Border, và Margin. Không chỉ một phần.\"}" +
                "]}";
    }

    // Quiz cuối khóa: JavaScript (12 câu)
    private String createJavaScriptFinalQuiz() {
        return "{\"questions\":[" +
                "{\"id\":1,\"question\":\"JavaScript là ngôn ngữ lập trình gì?\",\"options\":[\"Compiled language\",\"Interpreted language\",\"Markup language\",\"Style language\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! JavaScript là interpreted language - ngôn ngữ thông dịch, chạy trực tiếp mà không cần biên dịch.\",\"explanationWrong\":\"Sai! JavaScript là interpreted language, không phải compiled hay markup.\"}," +
                "{\"id\":2,\"question\":\"Từ khóa nào trong JavaScript dùng để khai báo biến có thể thay đổi?\",\"options\":[\"const\",\"let\",\"var\",\"Cả let và var\"],\"correctAnswer\":3,\"explanationCorrect\":\"Đúng! Cả 'let' và 'var' đều dùng để khai báo biến có thể thay đổi. 'const' dùng cho hằng số.\",\"explanationWrong\":\"Sai! Cả 'let' và 'var' đều đúng. 'const' dùng cho hằng số không thể thay đổi.\"}," +
                "{\"id\":3,\"question\":\"DOM là viết tắt của gì?\",\"options\":[\"Document Object Model\",\"Data Object Model\",\"Dynamic Object Model\",\"Document Oriented Model\"],\"correctAnswer\":0,\"explanationCorrect\":\"Đúng! DOM là Document Object Model - mô hình đối tượng tài liệu, biểu diễn cấu trúc HTML dưới dạng object.\",\"explanationWrong\":\"Sai! DOM là Document Object Model, không phải Data hay Dynamic.\"}," +
                "{\"id\":4,\"question\":\"Phương thức nào dùng để chọn phần tử theo ID trong JavaScript?\",\"options\":[\"document.querySelector()\",\"document.getElementById()\",\"document.getElementsByClass()\",\"Cả A và B\"],\"correctAnswer\":3,\"explanationCorrect\":\"Đúng! Cả 'getElementById()' và 'querySelector(\"#id\")' đều có thể dùng để chọn phần tử theo ID.\",\"explanationWrong\":\"Sai! Cả 'getElementById()' và 'querySelector(\"#id\")' đều đúng. getElementsByClass không tồn tại.\"}," +
                "{\"id\":5,\"question\":\"Arrow function trong JavaScript có cú pháp nào?\",\"options\":[\"function() {}\",\"() => {}\",\"=> function()\",\"arrow function()\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Arrow function có cú pháp: () => {}. Ngắn gọn hơn function thông thường.\",\"explanationWrong\":\"Sai! Arrow function có cú pháp '() => {}'. Không phải function() hay => function().\"}," +
                "{\"id\":6,\"question\":\"Event listener trong JavaScript dùng để làm gì?\",\"options\":[\"Tạo biến\",\"Lắng nghe và xử lý sự kiện (click, hover, v.v.)\",\"Tạo function\",\"Tạo object\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Event listener dùng để lắng nghe và xử lý các sự kiện như click, hover, submit, v.v.\",\"explanationWrong\":\"Sai! Event listener dùng để lắng nghe sự kiện, không phải tạo biến hay function.\"}," +
                "{\"id\":7,\"question\":\"JSON là viết tắt của gì?\",\"options\":[\"JavaScript Object Notation\",\"Java Script Object Network\",\"JavaScript Oriented Notation\",\"Java Script Online Network\"],\"correctAnswer\":0,\"explanationCorrect\":\"Đúng! JSON là JavaScript Object Notation - định dạng dữ liệu dựa trên cú pháp JavaScript object.\",\"explanationWrong\":\"Sai! JSON là JavaScript Object Notation, không phải Network hay Oriented.\"}," +
                "{\"id\":8,\"question\":\"Phương thức nào dùng để chuyển đổi object thành JSON string?\",\"options\":[\"JSON.parse()\",\"JSON.stringify()\",\"JSON.convert()\",\"JSON.toString()\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! JSON.stringify() dùng để chuyển đổi object thành JSON string. JSON.parse() làm ngược lại.\",\"explanationWrong\":\"Sai! JSON.stringify() là đúng. JSON.parse() dùng để chuyển JSON string thành object.\"}," +
                "{\"id\":9,\"question\":\"Closure trong JavaScript là gì?\",\"options\":[\"Một function\",\"Một biến\",\"Function có thể truy cập biến từ scope bên ngoài\",\"Một object\"],\"correctAnswer\":2,\"explanationCorrect\":\"Đúng! Closure là function có thể truy cập và 'nhớ' biến từ scope bên ngoài, ngay cả khi scope đó đã đóng.\",\"explanationWrong\":\"Sai! Closure là function có thể truy cập biến từ scope bên ngoài, không chỉ là function hay biến thông thường.\"}," +
                "{\"id\":10,\"question\":\"Promise trong JavaScript dùng để làm gì?\",\"options\":[\"Tạo biến\",\"Xử lý asynchronous operations (bất đồng bộ)\",\"Tạo object\",\"Tạo array\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Promise dùng để xử lý asynchronous operations, giúp quản lý code bất đồng bộ dễ dàng hơn.\",\"explanationWrong\":\"Sai! Promise dùng để xử lý asynchronous operations, không phải tạo biến hay object.\"}," +
                "{\"id\":11,\"question\":\"Async/await trong JavaScript dùng để làm gì?\",\"options\":[\"Tạo biến đồng bộ\",\"Xử lý asynchronous code một cách đồng bộ hơn\",\"Tạo function đồng bộ\",\"Tạo object\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Async/await cho phép viết code asynchronous một cách đồng bộ hơn, dễ đọc và dễ hiểu hơn Promise.\",\"explanationWrong\":\"Sai! Async/await dùng để xử lý asynchronous code, không phải tạo biến hay function đồng bộ.\"}," +
                "{\"id\":12,\"question\":\"LocalStorage trong JavaScript dùng để làm gì?\",\"options\":[\"Lưu trữ dữ liệu tạm thời\",\"Lưu trữ dữ liệu vĩnh viễn trên browser\",\"Tạo biến\",\"Tạo object\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! LocalStorage cho phép lưu trữ dữ liệu vĩnh viễn trên browser, dữ liệu vẫn còn sau khi đóng browser.\",\"explanationWrong\":\"Sai! LocalStorage lưu trữ dữ liệu vĩnh viễn, không phải tạm thời. SessionStorage mới là tạm thời.\"}" +
                "]}";
    }

    // Quiz cuối khóa: Git/GitHub (10 câu)
    private String createGitFinalQuiz() {
        return "{\"questions\":[" +
                "{\"id\":1,\"question\":\"Git là gì?\",\"options\":[\"Một ngôn ngữ lập trình\",\"Hệ thống quản lý phiên bản phân tán (Version Control System)\",\"Một database\",\"Một framework\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Git là hệ thống quản lý phiên bản phân tán, giúp theo dõi thay đổi code và làm việc nhóm.\",\"explanationWrong\":\"Sai! Git là hệ thống quản lý phiên bản, không phải ngôn ngữ lập trình hay database.\"}," +
                "{\"id\":2,\"question\":\"Lệnh nào dùng để khởi tạo Git repository?\",\"options\":[\"git start\",\"git init\",\"git create\",\"git new\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! 'git init' dùng để khởi tạo Git repository trong thư mục hiện tại.\",\"explanationWrong\":\"Sai! 'git init' là đúng. start, create, new không phải lệnh Git.\"}," +
                "{\"id\":3,\"question\":\"Lệnh nào dùng để thêm file vào staging area?\",\"options\":[\"git commit\",\"git add\",\"git push\",\"git save\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! 'git add' dùng để thêm file vào staging area. 'git add .' thêm tất cả file.\",\"explanationWrong\":\"Sai! 'git add' là đúng. commit dùng để lưu thay đổi, push dùng để đẩy lên remote.\"}," +
                "{\"id\":4,\"question\":\"Lệnh nào dùng để lưu thay đổi với message?\",\"options\":[\"git save -m 'message'\",\"git commit -m 'message'\",\"git store -m 'message'\",\"git keep -m 'message'\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! 'git commit -m \"message\"' dùng để lưu thay đổi với message mô tả.\",\"explanationWrong\":\"Sai! 'git commit -m' là đúng. save, store, keep không phải lệnh Git.\"}," +
                "{\"id\":5,\"question\":\"Branch trong Git là gì?\",\"options\":[\"Một file\",\"Một nhánh phát triển độc lập của code\",\"Một commit\",\"Một repository\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Branch là nhánh phát triển độc lập, cho phép làm việc trên nhiều tính năng cùng lúc mà không ảnh hưởng nhau.\",\"explanationWrong\":\"Sai! Branch là nhánh phát triển độc lập, không phải file hay commit.\"}," +
                "{\"id\":6,\"question\":\"Lệnh nào dùng để tạo branch mới?\",\"options\":[\"git branch new-branch\",\"git create new-branch\",\"git new new-branch\",\"git make new-branch\"],\"correctAnswer\":0,\"explanationCorrect\":\"Đúng! 'git branch new-branch' tạo branch mới. 'git checkout -b new-branch' tạo và chuyển sang branch.\",\"explanationWrong\":\"Sai! 'git branch new-branch' là đúng. create, new, make không phải lệnh Git.\"}," +
                "{\"id\":7,\"question\":\"GitHub là gì?\",\"options\":[\"Một ngôn ngữ lập trình\",\"Nền tảng lưu trữ code trên cloud sử dụng Git\",\"Một database\",\"Một framework\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! GitHub là nền tảng lưu trữ code trên cloud, sử dụng Git để quản lý version control.\",\"explanationWrong\":\"Sai! GitHub là nền tảng lưu trữ code, không phải ngôn ngữ lập trình hay database.\"}," +
                "{\"id\":8,\"question\":\"Lệnh nào dùng để đẩy code lên GitHub?\",\"options\":[\"git pull\",\"git push\",\"git upload\",\"git send\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! 'git push' dùng để đẩy code lên remote repository (như GitHub). 'git pull' làm ngược lại.\",\"explanationWrong\":\"Sai! 'git push' là đúng. pull dùng để lấy code về, upload và send không phải lệnh Git.\"}," +
                "{\"id\":9,\"question\":\"Pull Request (PR) là gì?\",\"options\":[\"Yêu cầu xóa code\",\"Yêu cầu merge code từ branch này sang branch khác\",\"Yêu cầu tạo branch\",\"Yêu cầu xóa branch\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Pull Request là yêu cầu merge code từ một branch sang branch khác (thường là từ feature branch sang main).\",\"explanationWrong\":\"Sai! Pull Request là yêu cầu merge code, không phải xóa hay tạo branch.\"}," +
                "{\"id\":10,\"question\":\"Lệnh nào dùng để clone repository từ GitHub?\",\"options\":[\"git copy URL\",\"git clone URL\",\"git download URL\",\"git get URL\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! 'git clone URL' dùng để sao chép repository từ GitHub về máy local.\",\"explanationWrong\":\"Sai! 'git clone URL' là đúng. copy, download, get không phải lệnh Git.\"}" +
                "]}";
    }

    // Quiz cuối khóa: Java Advanced (15 câu)
    private String createJavaAdvancedFinalQuiz() {
        return "{\"questions\":[" +
                "{\"id\":1,\"question\":\"ArrayList và LinkedList khác nhau như thế nào?\",\"options\":[\"ArrayList truy cập nhanh, LinkedList thêm/xóa nhanh\",\"LinkedList truy cập nhanh, ArrayList thêm/xóa nhanh\",\"Giống nhau hoàn toàn\",\"Không có sự khác biệt\"],\"correctAnswer\":0,\"explanationCorrect\":\"Đúng! ArrayList dùng array nên truy cập O(1) nhưng thêm/xóa O(n). LinkedList dùng linked list nên thêm/xóa O(1) nhưng truy cập O(n).\",\"explanationWrong\":\"Sai! ArrayList truy cập nhanh, LinkedList thêm/xóa nhanh. Ngược lại là sai.\"}," +
                "{\"id\":2,\"question\":\"HashMap và TreeMap khác nhau như thế nào?\",\"options\":[\"HashMap có thứ tự, TreeMap không có\",\"HashMap không có thứ tự O(1), TreeMap có thứ tự O(log n)\",\"Giống nhau hoàn toàn\",\"Không có sự khác biệt\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! HashMap không có thứ tự, truy cập O(1) trung bình. TreeMap có thứ tự, truy cập O(log n).\",\"explanationWrong\":\"Sai! HashMap không có thứ tự O(1), TreeMap có thứ tự O(log n). Ngược lại là sai.\"}," +
                "{\"id\":3,\"question\":\"Stream API trong Java dùng để làm gì?\",\"options\":[\"Xử lý file\",\"Xử lý collections theo cách functional programming\",\"Tạo network connection\",\"Tạo database\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Stream API cho phép xử lý collections theo cách functional programming với các operations như filter, map, reduce.\",\"explanationWrong\":\"Sai! Stream API dùng để xử lý collections, không phải file hay network.\"}," +
                "{\"id\":4,\"question\":\"Thread trong Java là gì?\",\"options\":[\"Một class\",\"Một luồng thực thi độc lập trong chương trình\",\"Một method\",\"Một variable\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Thread là luồng thực thi độc lập, cho phép chương trình chạy nhiều tác vụ đồng thời (concurrency).\",\"explanationWrong\":\"Sai! Thread là luồng thực thi độc lập, không phải class hay method.\"}," +
                "{\"id\":5,\"question\":\"Synchronized trong Java dùng để làm gì?\",\"options\":[\"Tạo thread\",\"Đồng bộ hóa để tránh race condition\",\"Tạo object\",\"Tạo class\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Synchronized đảm bảo chỉ một thread có thể truy cập một đoạn code tại một thời điểm, tránh race condition.\",\"explanationWrong\":\"Sai! Synchronized dùng để đồng bộ hóa, không phải tạo thread hay object.\"}," +
                "{\"id\":6,\"question\":\"Lambda expression trong Java có cú pháp nào?\",\"options\":[\"() -> {}\",\"function() {}\",\"lambda() {}\",\"-> function()\"],\"correctAnswer\":0,\"explanationCorrect\":\"Đúng! Lambda expression có cú pháp: (parameters) -> { body }. Ví dụ: (x, y) -> x + y.\",\"explanationWrong\":\"Sai! Lambda expression có cú pháp '() -> {}'. Không phải function() hay lambda().\"}," +
                "{\"id\":7,\"question\":\"Optional trong Java dùng để làm gì?\",\"options\":[\"Tạo biến bắt buộc\",\"Xử lý giá trị có thể null một cách an toàn\",\"Tạo array\",\"Tạo list\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Optional giúp xử lý giá trị có thể null một cách an toàn, tránh NullPointerException.\",\"explanationWrong\":\"Sai! Optional dùng để xử lý giá trị có thể null, không phải tạo biến hay array.\"}," +
                "{\"id\":8,\"question\":\"Design Pattern là gì?\",\"options\":[\"Một ngôn ngữ lập trình\",\"Giải pháp tái sử dụng cho các vấn đề lập trình phổ biến\",\"Một framework\",\"Một library\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Design Pattern là giải pháp tái sử dụng, đã được chứng minh cho các vấn đề lập trình phổ biến.\",\"explanationWrong\":\"Sai! Design Pattern là giải pháp tái sử dụng, không phải ngôn ngữ hay framework.\"}," +
                "{\"id\":9,\"question\":\"Singleton Pattern là gì?\",\"options\":[\"Tạo nhiều instance\",\"Đảm bảo chỉ có một instance duy nhất của class\",\"Tạo array\",\"Tạo list\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Singleton Pattern đảm bảo chỉ có một instance duy nhất của class trong toàn bộ ứng dụng.\",\"explanationWrong\":\"Sai! Singleton Pattern đảm bảo chỉ có một instance, không phải nhiều instance.\"}," +
                "{\"id\":10,\"question\":\"Spring Framework là gì?\",\"options\":[\"Một ngôn ngữ lập trình\",\"Framework Java cho phát triển enterprise application\",\"Một database\",\"Một editor\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Spring Framework là framework Java phổ biến cho phát triển enterprise application, hỗ trợ dependency injection, AOP, v.v.\",\"explanationWrong\":\"Sai! Spring Framework là framework Java, không phải ngôn ngữ lập trình hay database.\"}," +
                "{\"id\":11,\"question\":\"Dependency Injection (DI) là gì?\",\"options\":[\"Tạo dependency trong class\",\"Cung cấp dependency từ bên ngoài thay vì tạo trong class\",\"Xóa dependency\",\"Không có khái niệm này\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Dependency Injection là cung cấp dependency từ bên ngoài (thông qua constructor, setter, hoặc framework) thay vì tạo trong class.\",\"explanationWrong\":\"Sai! Dependency Injection là cung cấp dependency từ bên ngoài, không phải tạo trong class.\"}," +
                "{\"id\":12,\"question\":\"@Autowired trong Spring dùng để làm gì?\",\"options\":[\"Tạo bean\",\"Tự động inject dependency\",\"Tạo class\",\"Tạo method\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! @Autowired tự động inject dependency vào field, constructor, hoặc setter method.\",\"explanationWrong\":\"Sai! @Autowired dùng để tự động inject dependency, không phải tạo bean hay class.\"}," +
                "{\"id\":13,\"question\":\"RESTful API là gì?\",\"options\":[\"Một database\",\"Kiến trúc API sử dụng HTTP methods (GET, POST, PUT, DELETE)\",\"Một framework\",\"Một ngôn ngữ\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! RESTful API là kiến trúc API sử dụng HTTP methods: GET (đọc), POST (tạo), PUT (cập nhật), DELETE (xóa).\",\"explanationWrong\":\"Sai! RESTful API là kiến trúc API sử dụng HTTP methods, không phải database hay framework.\"}," +
                "{\"id\":14,\"question\":\"JPA (Java Persistence API) dùng để làm gì?\",\"options\":[\"Tạo UI\",\"Quản lý persistence và ORM (Object-Relational Mapping)\",\"Tạo network\",\"Tạo file\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! JPA là API để quản lý persistence và ORM, giúp ánh xạ Java objects với database tables.\",\"explanationWrong\":\"Sai! JPA dùng để quản lý persistence và ORM, không phải UI hay network.\"}," +
                "{\"id\":15,\"question\":\"@Entity trong JPA dùng để làm gì?\",\"options\":[\"Tạo database\",\"Đánh dấu class là entity, ánh xạ với database table\",\"Tạo table\",\"Tạo column\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! @Entity đánh dấu class là JPA entity, sẽ được ánh xạ với một database table.\",\"explanationWrong\":\"Sai! @Entity đánh dấu class là entity, không phải tạo database hay table trực tiếp.\"}" +
                "]}";
    }

    // Quiz cuối khóa: Full-stack (15 câu)
    private String createFullstackFinalQuiz() {
        return "{\"questions\":[" +
                "{\"id\":1,\"question\":\"React là gì?\",\"options\":[\"Một ngôn ngữ lập trình\",\"Thư viện JavaScript để xây dựng UI\",\"Một database\",\"Một framework backend\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! React là thư viện JavaScript để xây dựng user interface, sử dụng component-based architecture.\",\"explanationWrong\":\"Sai! React là thư viện JavaScript cho UI, không phải ngôn ngữ lập trình hay database.\"}," +
                "{\"id\":2,\"question\":\"Component trong React là gì?\",\"options\":[\"Một function hoặc class trả về JSX\",\"Một database\",\"Một API\",\"Một file CSS\"],\"correctAnswer\":0,\"explanationCorrect\":\"Đúng! Component là function hoặc class trả về JSX, đại diện cho một phần của UI có thể tái sử dụng.\",\"explanationWrong\":\"Sai! Component là function/class trả về JSX, không phải database hay API.\"}," +
                "{\"id\":3,\"question\":\"useState hook trong React dùng để làm gì?\",\"options\":[\"Tạo component\",\"Quản lý state trong functional component\",\"Tạo API\",\"Tạo database\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! useState hook cho phép quản lý state trong functional component, trả về state value và setter function.\",\"explanationWrong\":\"Sai! useState dùng để quản lý state, không phải tạo component hay API.\"}," +
                "{\"id\":4,\"question\":\"Node.js là gì?\",\"options\":[\"Một framework frontend\",\"Runtime environment để chạy JavaScript ở server-side\",\"Một database\",\"Một ngôn ngữ lập trình\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Node.js là runtime environment cho phép chạy JavaScript ở server-side, sử dụng V8 engine.\",\"explanationWrong\":\"Sai! Node.js là runtime cho server-side JavaScript, không phải framework frontend hay database.\"}," +
                "{\"id\":5,\"question\":\"Express.js là gì?\",\"options\":[\"Một database\",\"Web framework cho Node.js để xây dựng API và server\",\"Một frontend framework\",\"Một ngôn ngữ\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Express.js là web framework cho Node.js, giúp xây dựng API và web server dễ dàng hơn.\",\"explanationWrong\":\"Sai! Express.js là web framework cho Node.js, không phải database hay frontend framework.\"}," +
                "{\"id\":6,\"question\":\"MongoDB là gì?\",\"options\":[\"Một relational database\",\"NoSQL document database\",\"Một frontend framework\",\"Một ngôn ngữ lập trình\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! MongoDB là NoSQL document database, lưu trữ dữ liệu dưới dạng documents (JSON-like).\",\"explanationWrong\":\"Sai! MongoDB là NoSQL document database, không phải relational database hay framework.\"}," +
                "{\"id\":7,\"question\":\"RESTful API sử dụng HTTP methods nào?\",\"options\":[\"Chỉ GET\",\"GET, POST, PUT, DELETE\",\"Chỉ POST\",\"Không sử dụng HTTP\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! RESTful API sử dụng GET (đọc), POST (tạo), PUT (cập nhật), DELETE (xóa) để thao tác với resources.\",\"explanationWrong\":\"Sai! RESTful API sử dụng GET, POST, PUT, DELETE. Không chỉ một method.\"}," +
                "{\"id\":8,\"question\":\"CORS là viết tắt của gì?\",\"options\":[\"Cross-Origin Resource Sharing\",\"Cross-Origin Request Service\",\"Central Origin Resource Sharing\",\"Cross-Origin Response Service\"],\"correctAnswer\":0,\"explanationCorrect\":\"Đúng! CORS là Cross-Origin Resource Sharing - cơ chế cho phép browser cho phép requests từ domain khác.\",\"explanationWrong\":\"Sai! CORS là Cross-Origin Resource Sharing, không phải Request Service hay Response Service.\"}," +
                "{\"id\":9,\"question\":\"JWT (JSON Web Token) dùng để làm gì?\",\"options\":[\"Lưu trữ database\",\"Xác thực và authorization, truyền thông tin người dùng\",\"Tạo UI\",\"Tạo API\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! JWT dùng để xác thực và authorization, cho phép truyền thông tin người dùng một cách an toàn giữa client và server.\",\"explanationWrong\":\"Sai! JWT dùng để xác thực và authorization, không phải lưu trữ database hay tạo UI.\"}," +
                "{\"id\":10,\"question\":\"Middleware trong Express.js là gì?\",\"options\":[\"Một database\",\"Function có quyền truy cập request, response, và next function\",\"Một frontend component\",\"Một API endpoint\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Middleware là function có quyền truy cập request, response, và next function, có thể thực hiện code và chuyển control.\",\"explanationWrong\":\"Sai! Middleware là function xử lý request/response, không phải database hay component.\"}," +
                "{\"id\":11,\"question\":\"npm là gì?\",\"options\":[\"Node Package Manager - quản lý packages cho Node.js\",\"Một database\",\"Một framework\",\"Một ngôn ngữ\"],\"correctAnswer\":0,\"explanationCorrect\":\"Đúng! npm là Node Package Manager, công cụ quản lý packages và dependencies cho Node.js projects.\",\"explanationWrong\":\"Sai! npm là Node Package Manager, không phải database hay framework.\"}," +
                "{\"id\":12,\"question\":\"Props trong React là gì?\",\"options\":[\"State của component\",\"Dữ liệu được truyền từ component cha sang component con\",\"Một hook\",\"Một method\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Props (properties) là dữ liệu được truyền từ component cha sang component con, là read-only.\",\"explanationWrong\":\"Sai! Props là dữ liệu truyền từ cha sang con, không phải state hay hook.\"}," +
                "{\"id\":13,\"question\":\"useEffect hook trong React dùng để làm gì?\",\"options\":[\"Quản lý state\",\"Thực hiện side effects (API calls, subscriptions, v.v.)\",\"Tạo component\",\"Tạo props\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! useEffect cho phép thực hiện side effects như API calls, subscriptions, DOM manipulation sau khi render.\",\"explanationWrong\":\"Sai! useEffect dùng để thực hiện side effects, không phải quản lý state hay tạo component.\"}," +
                "{\"id\":14,\"question\":\"Mongoose trong Node.js dùng để làm gì?\",\"options\":[\"Tạo frontend\",\"ODM (Object Document Mapper) cho MongoDB\",\"Tạo API\",\"Tạo database\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Mongoose là ODM cho MongoDB, cung cấp schema-based solution để model dữ liệu và tương tác với MongoDB.\",\"explanationWrong\":\"Sai! Mongoose là ODM cho MongoDB, không phải tạo frontend hay API.\"}," +
                "{\"id\":15,\"question\":\"Full-stack development là gì?\",\"options\":[\"Chỉ frontend\",\"Chỉ backend\",\"Cả frontend và backend\",\"Chỉ database\"],\"correctAnswer\":2,\"explanationCorrect\":\"Đúng! Full-stack development bao gồm cả frontend (UI) và backend (server, database, API), có thể làm việc với toàn bộ stack.\",\"explanationWrong\":\"Sai! Full-stack development bao gồm cả frontend và backend, không chỉ một phần.\"}" +
                "]}";
    }

    // Quiz cuối khóa: Data Science (15 câu)
    private String createDataScienceFinalQuiz() {
        return "{\"questions\":[" +
                "{\"id\":1,\"question\":\"Python thường được dùng trong Data Science vì lý do gì?\",\"options\":[\"Tốc độ nhanh nhất\",\"Có nhiều thư viện mạnh (NumPy, Pandas, Scikit-learn)\",\"Dễ cài đặt nhất\",\"Không có lý do\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Python phổ biến trong Data Science vì có nhiều thư viện mạnh như NumPy, Pandas, Scikit-learn, Matplotlib.\",\"explanationWrong\":\"Sai! Python phổ biến vì có nhiều thư viện mạnh, không phải vì tốc độ hay dễ cài đặt.\"}," +
                "{\"id\":2,\"question\":\"NumPy là gì?\",\"options\":[\"Một database\",\"Thư viện Python cho numerical computing và arrays\",\"Một framework web\",\"Một ngôn ngữ lập trình\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! NumPy là thư viện Python cung cấp arrays đa chiều và functions cho numerical computing.\",\"explanationWrong\":\"Sai! NumPy là thư viện cho numerical computing, không phải database hay framework.\"}," +
                "{\"id\":3,\"question\":\"Pandas là gì?\",\"options\":[\"Một database\",\"Thư viện Python cho data manipulation và analysis\",\"Một framework\",\"Một ngôn ngữ\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Pandas cung cấp DataFrame và Series để thao tác, phân tích dữ liệu dễ dàng.\",\"explanationWrong\":\"Sai! Pandas là thư viện cho data manipulation, không phải database hay framework.\"}," +
                "{\"id\":4,\"question\":\"DataFrame trong Pandas là gì?\",\"options\":[\"Một array\",\"Cấu trúc dữ liệu 2 chiều giống bảng (rows và columns)\",\"Một list\",\"Một dictionary\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! DataFrame là cấu trúc dữ liệu 2 chiều với rows và columns, giống bảng Excel hoặc SQL table.\",\"explanationWrong\":\"Sai! DataFrame là cấu trúc 2 chiều giống bảng, không phải array hay list.\"}," +
                "{\"id\":5,\"question\":\"Matplotlib dùng để làm gì?\",\"options\":[\"Xử lý dữ liệu\",\"Vẽ biểu đồ và visualization\",\"Tạo database\",\"Tạo API\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Matplotlib là thư viện Python để vẽ biểu đồ, charts, và visualization dữ liệu.\",\"explanationWrong\":\"Sai! Matplotlib dùng để vẽ biểu đồ, không phải xử lý dữ liệu hay tạo database.\"}," +
                "{\"id\":6,\"question\":\"Machine Learning là gì?\",\"options\":[\"Lập trình cứng nhắc\",\"Khả năng của máy tính học từ dữ liệu mà không cần lập trình rõ ràng\",\"Chỉ là database\",\"Chỉ là visualization\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Machine Learning cho phép máy tính học patterns từ dữ liệu và đưa ra dự đoán mà không cần lập trình rõ ràng.\",\"explanationWrong\":\"Sai! Machine Learning là học từ dữ liệu, không phải lập trình cứng nhắc hay chỉ database.\"}," +
                "{\"id\":7,\"question\":\"Linear Regression là gì?\",\"options\":[\"Thuật toán classification\",\"Thuật toán regression để dự đoán giá trị liên tục\",\"Thuật toán clustering\",\"Thuật toán không tồn tại\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Linear Regression là thuật toán regression dùng để dự đoán giá trị liên tục (như giá nhà, nhiệt độ) dựa trên features.\",\"explanationWrong\":\"Sai! Linear Regression là thuật toán regression cho giá trị liên tục, không phải classification hay clustering.\"}," +
                "{\"id\":8,\"question\":\"Supervised Learning là gì?\",\"options\":[\"Học không có label\",\"Học với labeled data (có input và output đã biết)\",\"Học không có data\",\"Học không có algorithm\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Supervised Learning học từ labeled data - có cả input và output đã biết, như classification và regression.\",\"explanationWrong\":\"Sai! Supervised Learning học từ labeled data, không phải không có label.\"}," +
                "{\"id\":9,\"question\":\"Unsupervised Learning là gì?\",\"options\":[\"Học với label\",\"Học từ unlabeled data (chỉ có input, không có output)\",\"Học không có data\",\"Học không có algorithm\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Unsupervised Learning học từ unlabeled data - chỉ có input, không có output, như clustering và dimensionality reduction.\",\"explanationWrong\":\"Sai! Unsupervised Learning học từ unlabeled data, không phải có label.\"}," +
                "{\"id\":10,\"question\":\"Overfitting trong Machine Learning là gì?\",\"options\":[\"Model học quá tốt trên training data nhưng kém trên test data\",\"Model học quá kém\",\"Model không học được gì\",\"Model không tồn tại\"],\"correctAnswer\":0,\"explanationCorrect\":\"Đúng! Overfitting xảy ra khi model học quá tốt trên training data (nhớ từng chi tiết) nhưng kém trên test data mới.\",\"explanationWrong\":\"Sai! Overfitting là học quá tốt trên training nhưng kém trên test, không phải học kém.\"}," +
                "{\"id\":11,\"question\":\"Feature trong Machine Learning là gì?\",\"options\":[\"Output của model\",\"Input variable (biến đầu vào) dùng để dự đoán\",\"Model itself\",\"Algorithm\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Feature là input variable (biến đầu vào) dùng để dự đoán output. Ví dụ: diện tích, số phòng là features để dự đoán giá nhà.\",\"explanationWrong\":\"Sai! Feature là input variable, không phải output hay model.\"}," +
                "{\"id\":12,\"question\":\"Scikit-learn là gì?\",\"options\":[\"Một database\",\"Thư viện Python cho Machine Learning\",\"Một framework web\",\"Một ngôn ngữ\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Scikit-learn là thư viện Python cung cấp nhiều thuật toán Machine Learning và tools.\",\"explanationWrong\":\"Sai! Scikit-learn là thư viện cho Machine Learning, không phải database hay framework.\"}," +
                "{\"id\":13,\"question\":\"Data Cleaning là gì?\",\"options\":[\"Xóa tất cả data\",\"Xử lý missing values, outliers, duplicates để làm sạch dữ liệu\",\"Tạo data mới\",\"Không cần thiết\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Data Cleaning là quá trình xử lý missing values, outliers, duplicates, format inconsistencies để có dữ liệu sạch.\",\"explanationWrong\":\"Sai! Data Cleaning là xử lý dữ liệu để làm sạch, không phải xóa tất cả hay tạo mới.\"}," +
                "{\"id\":14,\"question\":\"EDA (Exploratory Data Analysis) là gì?\",\"options\":[\"Tạo model\",\"Phân tích và khám phá dữ liệu để hiểu patterns, relationships trước khi modeling\",\"Xóa data\",\"Không cần thiết\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! EDA là quá trình phân tích và khám phá dữ liệu để hiểu patterns, distributions, relationships trước khi xây dựng model.\",\"explanationWrong\":\"Sai! EDA là phân tích và khám phá dữ liệu, không phải tạo model hay xóa data.\"}," +
                "{\"id\":15,\"question\":\"Cross-validation dùng để làm gì?\",\"options\":[\"Xóa data\",\"Đánh giá model performance một cách đáng tin cậy hơn bằng cách chia data thành nhiều folds\",\"Tạo data\",\"Không cần thiết\"],\"correctAnswer\":1,\"explanationCorrect\":\"Đúng! Cross-validation chia data thành nhiều folds, train trên một phần và test trên phần khác để đánh giá model đáng tin cậy hơn.\",\"explanationWrong\":\"Sai! Cross-validation dùng để đánh giá model, không phải xóa hay tạo data.\"}" +
                "]}";
    }
}
