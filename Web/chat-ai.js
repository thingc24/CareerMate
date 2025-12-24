/**
 * CareerMate AI Chat - Module chung cho tất cả các trang
 * Sử dụng Gemini API để cung cấp tính năng chat AI
 */

class CareerMateAI {
    constructor(config) {
        // Cấu hình
        this.apiKey = config.apiKey || '';
        this.systemPrompt = config.systemPrompt || '';
        this.proxyUrl = config.proxyUrl || 'gemini-proxy.php';
        this.role = config.role || 'student'; // 'student' hoặc 'recruiter'
        
        // DOM elements
        this.chatToggle = document.getElementById('chatToggle');
        this.chatWindow = document.getElementById('chatWindow');
        this.chatClose = document.getElementById('chatClose');
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.cvUpload = document.getElementById('cvUpload');
        
        // State
        this.chatHistory = [];
        
        // Initialize
        this.init();
    }

    init() {
        // Đảm bảo DOM đã sẵn sàng
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
        } else {
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        // Event listeners
        if (this.chatToggle) {
            this.chatToggle.addEventListener('click', () => {
                this.chatWindow.classList.toggle('active');
            });
        }

        if (this.chatClose) {
            this.chatClose.addEventListener('click', () => {
                this.chatWindow.classList.remove('active');
            });
        }

        if (this.chatInput) {
            this.chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }

        if (this.cvUpload) {
            this.cvUpload.addEventListener('change', (e) => {
                this.handleCVUpload(e);
            });
        }
    }

    // Format message - xử lý markdown
    formatMessage(text) {
        if (!text) return '';
        
        // Escape HTML để tránh XSS (nhưng giữ lại \n để xử lý sau)
        let formatted = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        
        // Xử lý code inline trước (`code`) để tránh format các ký tự bên trong
        const codeBlocks = [];
        formatted = formatted.replace(/`([^`]+?)`/g, function(match, code) {
            const id = 'CODE_' + codeBlocks.length;
            codeBlocks.push(code);
            return id;
        });
        
        // Xử lý markdown bold (**text** hoặc __text__) - xử lý trước italic
        formatted = formatted.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/__(.+?)__/g, '<strong>$1</strong>');
        
        // Khôi phục code blocks
        codeBlocks.forEach((code, index) => {
            formatted = formatted.replace('CODE_' + index, '<code style="background: rgba(0,0,0,0.1); padding: 2px 4px; border-radius: 3px; font-family: monospace;">' + code + '</code>');
        });
        
        // Xử lý line breaks (\n)
        formatted = formatted.replace(/\n/g, '<br>');
        
        // Xử lý list items đơn giản (dòng bắt đầu bằng - hoặc số)
        const lines = formatted.split('<br>');
        let inList = false;
        let result = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            const listMatch = line.match(/^[-•]\s+(.+)$/) || line.match(/^\d+\.\s+(.+)$/);
            
            if (listMatch) {
                if (!inList) {
                    result.push('<ul style="margin: 5px 0; padding-left: 20px;">');
                    inList = true;
                }
                result.push('<li>' + listMatch[1] + '</li>');
            } else {
                if (inList) {
                    result.push('</ul>');
                    inList = false;
                }
                result.push(line);
            }
        }
        if (inList) {
            result.push('</ul>');
        }
        
        return result.join('<br>');
    }

    // Thêm message vào chat
    addMessage(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = role === 'ai' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        // Sử dụng formatMessage để xử lý markdown
        if (role === 'ai') {
            messageContent.innerHTML = this.formatMessage(content);
        } else {
            // User message không cần format markdown, chỉ cần escape HTML
            messageContent.textContent = content;
        }
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    // Hiển thị typing indicator
    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        this.chatMessages.appendChild(typingDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        return 'typing-indicator';
    }

    // Xóa typing indicator
    removeTypingIndicator(id) {
        const typing = document.getElementById(id);
        if (typing) {
            typing.remove();
        }
    }

    // Gọi Gemini API
    async callGeminiAPI(userMessage) {
        // Thêm tin nhắn người dùng vào lịch sử
        this.chatHistory.push({
            role: 'user',
            parts: [{ text: userMessage }]
        });

        try {
            const response = await fetch(this.proxyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage,
                    apiKey: this.apiKey,
                    systemPrompt: this.systemPrompt,
                    history: this.chatHistory.slice(0, -1) // Gửi tất cả trừ tin nhắn vừa thêm
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                let errorMsg = errorData.error || `HTTP ${response.status}`;
                
                if (errorData.suggestion) {
                    errorMsg += '\n\n💡 ' + errorData.suggestion;
                }
                if (errorData.details) {
                    console.error('API Error Details:', errorData.details);
                }
                throw new Error(errorMsg);
            }

            const data = await response.json();
            
            if (!data.response) {
                throw new Error('Invalid response from proxy server');
            }
            
            const aiResponse = data.response;

            // Thêm vào lịch sử
            this.chatHistory.push({
                role: 'model',
                parts: [{ text: aiResponse }]
            });

            // Giới hạn lịch sử (giữ lại 10 tin nhắn gần nhất)
            if (this.chatHistory.length > 10) {
                this.chatHistory = this.chatHistory.slice(-10);
            }

            return aiResponse;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }


    // Gửi message
    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;

        // Thêm tin nhắn người dùng vào UI
        this.addMessage('user', message);
        this.chatInput.value = '';

        // Hiển thị typing indicator
        const typingId = this.showTypingIndicator();

        try {
            // Gọi Gemini API
            const response = await this.callGeminiAPI(message);
            
            // Xóa typing indicator
            this.removeTypingIndicator(typingId);
            
            // Thêm phản hồi AI
            this.addMessage('ai', response);
        } catch (error) {
            this.removeTypingIndicator(typingId);
            const errorMsg = error.message || 'Unknown error';
            
            let userMessage = 'Xin lỗi, đã có lỗi xảy ra.';
            
            // Xử lý rate limit error - chỉ khi chắc chắn là rate limit
            const lowerErrorMsg = errorMsg.toLowerCase();
            const isDefinitelyRateLimit = lowerErrorMsg.includes('quota') && 
                                         lowerErrorMsg.includes('exceeded') && 
                                         (lowerErrorMsg.includes('limit') || lowerErrorMsg.includes('rate'));
            
            if (isDefinitelyRateLimit) {
                userMessage = '⚠️ Đã vượt quá giới hạn sử dụng API (rate limit).\n\n';
                userMessage += '💡 Để khắc phục:\n';
                userMessage += '1. Chờ vài phút rồi thử lại (giới hạn: 20 requests/phút cho free tier)\n';
                userMessage += '2. Hoặc nâng cấp gói API tại: https://aistudio.google.com/\n';
                userMessage += '3. Sử dụng ít request hơn trong thời gian ngắn';
            } else {
                userMessage = `Xin lỗi, đã có lỗi xảy ra.\n\nChi tiết: ${errorMsg}\n\n💡 Để khắc phục:\n1. Lấy API key mới tại: https://aistudio.google.com/apikey\n2. Cập nhật API key trong file\n3. Xem file HUONG_DAN_API_KEY.md để biết chi tiết`;
            }
            
            this.addMessage('ai', userMessage);
            console.error('Error:', error);
        }
    }

    // Gửi quick message
    sendQuickMessage(message) {
        this.chatInput.value = message;
        this.sendMessage();
    }

    // Xử lý upload CV
    handleCVUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Kiểm tra loại file
        const allowedTypes = ['text/plain', 'application/pdf', 'application/msword', 
                              'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        const fileExtension = file.name.split('.').pop().toLowerCase();
        
        if (!allowedTypes.includes(file.type) && !['txt', 'pdf', 'doc', 'docx'].includes(fileExtension)) {
            alert('Vui lòng chọn file CV định dạng: .txt, .pdf, .doc, hoặc .docx');
            event.target.value = '';
            return;
        }

        // Kiểm tra kích thước file (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File quá lớn! Vui lòng chọn file nhỏ hơn 5MB');
            event.target.value = '';
            return;
        }

        // Hiển thị thông báo đang xử lý
        this.addMessage('user', `📄 Đã upload CV: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
        
        const typingId = this.showTypingIndicator();

        // Xử lý theo loại file
        if (file.type === 'text/plain' || fileExtension === 'txt') {
            // Đọc file text
            const reader = new FileReader();
            reader.onload = (e) => {
                const fileContent = e.target.result;
                // analyzeCV sẽ tự tạo typing indicator riêng
                this.removeTypingIndicator(typingId);
                this.analyzeCV(fileContent, file.name);
            };
            reader.onerror = () => {
                this.removeTypingIndicator(typingId);
                this.addMessage('ai', 'Có lỗi xảy ra khi đọc file. Vui lòng thử lại.');
            };
            reader.readAsText(file, 'UTF-8');
        } else if (file.type === 'application/pdf' || fileExtension === 'pdf') {
            // Đọc file PDF (extractTextFromPDF sẽ xử lý typing indicator)
            this.extractTextFromPDF(file, typingId);
        } else {
            // Với DOC/DOCX, yêu cầu file .txt hoặc .pdf
            this.removeTypingIndicator(typingId);
            this.addMessage('ai', 'Hiện tại hệ thống hỗ trợ file .txt và .pdf. Với file DOC/DOCX, vui lòng chuyển đổi sang PDF hoặc .txt, hoặc copy nội dung CV và dán vào chat.');
        }

        // Reset input
        event.target.value = '';
    }

    // Trích xuất text từ PDF sử dụng PDF.js
    async extractTextFromPDF(file, typingId) {
        try {
            // Kiểm tra xem PDF.js đã được load chưa
            if (typeof pdfjsLib === 'undefined') {
                this.removeTypingIndicator(typingId);
                this.addMessage('ai', 'Đang tải thư viện PDF... Vui lòng thử lại sau vài giây.');
                console.error('PDF.js chưa được load');
                return;
            }

            const arrayBuffer = await file.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;
            
            let fullText = '';
            const numPages = pdf.numPages;

            // Đọc text từ tất cả các trang
            for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += pageText + '\n';
            }

            if (fullText.trim().length === 0) {
                this.removeTypingIndicator(typingId);
                this.addMessage('ai', 'Không thể đọc được text từ file PDF. File có thể là file PDF dạng hình ảnh (scanned PDF). Vui lòng thử file PDF khác hoặc upload file .txt.');
                return;
            }

            // analyzeCV sẽ tự tạo typing indicator riêng
            this.removeTypingIndicator(typingId);
            // Phân tích CV
            this.analyzeCV(fullText, file.name);
        } catch (error) {
            this.removeTypingIndicator(typingId);
            this.addMessage('ai', 'Có lỗi xảy ra khi đọc file PDF. Vui lòng thử lại hoặc chuyển đổi sang file .txt.');
            console.error('Error extracting text from PDF:', error);
        }
    }

    // Phân tích CV bằng AI
    async analyzeCV(cvContent, fileName) {
        const typingId = this.showTypingIndicator();
        
        try {
            // Kiểm tra và làm sạch nội dung CV
            if (!cvContent || typeof cvContent !== 'string') {
                throw new Error('Nội dung CV không hợp lệ');
            }

            // Loại bỏ các ký tự đặc biệt và làm sạch text
            let cleanedContent = cvContent.trim();
            
            // Giới hạn độ dài để tránh vượt quá token limit (khoảng 50000 ký tự)
            const maxLength = 50000;
            if (cleanedContent.length > maxLength) {
                cleanedContent = cleanedContent.substring(0, maxLength) + '\n\n[... nội dung đã được rút gọn do quá dài ...]';
            }

            // Prompt khác nhau cho sinh viên và nhà tuyển dụng
            let prompt = '';
            
            if (this.role === 'student') {
                // Prompt cho sinh viên - tập trung vào cải thiện CV
                prompt = `Bạn là một chuyên gia tư vấn nghề nghiệp và tuyển dụng. Hãy phân tích CV sau đây một cách chi tiết và đưa ra các nhận xét, gợi ý cải thiện.

Nội dung CV:
${cleanedContent}

Hãy phân tích CV này và cung cấp:
1. Điểm mạnh của CV
2. Điểm cần cải thiện
3. Gợi ý cụ thể để tối ưu hóa CV
4. Đánh giá về cấu trúc, nội dung, và format

Hãy trả lời bằng tiếng Việt, rõ ràng và chi tiết.`;
            } else {
                // Prompt cho nhà tuyển dụng - đánh giá ứng viên
                prompt = `Bạn là một chuyên gia tuyển dụng. Hãy phân tích CV sau đây để đánh giá ứng viên một cách khách quan và chuyên nghiệp.

Nội dung CV:
${cleanedContent}

Hãy phân tích CV này và cung cấp:
1. Tổng quan về ứng viên (kinh nghiệm, kỹ năng, trình độ)
2. Điểm mạnh nổi bật
3. Điểm cần lưu ý hoặc thiếu sót
4. Đánh giá phù hợp với các vị trí nào
5. Gợi ý câu hỏi phỏng vấn dựa trên CV này

Hãy trả lời bằng tiếng Việt, rõ ràng và chuyên nghiệp.`;
            }

            console.log('CV Content length:', cleanedContent.length);
            console.log('Prompt length:', prompt.length);

            const response = await this.callGeminiAPI(prompt);
            this.removeTypingIndicator(typingId);
            this.addMessage('ai', response);
        } catch (error) {
            this.removeTypingIndicator(typingId);
            const errorMsg = error.message || 'Unknown error';
            console.error('Error analyzing CV:', error);
            console.error('Error details:', {
                message: errorMsg,
                stack: error.stack,
                cvLength: cvContent ? cvContent.length : 0
            });
            
            // Hiển thị lỗi chi tiết hơn cho user
            let userMessage = 'Có lỗi xảy ra khi phân tích CV. ';
            const lowerErrorMsg = errorMsg.toLowerCase();
            const isDefinitelyRateLimit = lowerErrorMsg.includes('quota') && 
                                         lowerErrorMsg.includes('exceeded') && 
                                         (lowerErrorMsg.includes('limit') || lowerErrorMsg.includes('rate'));
            
            if (isDefinitelyRateLimit) {
                userMessage = '⚠️ Đã vượt quá giới hạn sử dụng API (rate limit).\n\n';
                userMessage += '💡 Để khắc phục:\n';
                userMessage += '1. Chờ vài phút rồi thử lại (giới hạn: 20 requests/phút cho free tier)\n';
                userMessage += '2. Hoặc nâng cấp gói API tại: https://aistudio.google.com/\n';
                userMessage += '3. Sử dụng ít request hơn trong thời gian ngắn';
            } else if (errorMsg.includes('token') || errorMsg.includes('length') || errorMsg.includes('too long')) {
                userMessage += 'CV của bạn có thể quá dài. Vui lòng thử với CV ngắn gọn hơn.';
            } else if (errorMsg.includes('API') || errorMsg.includes('network')) {
                userMessage += 'Lỗi kết nối với AI. Vui lòng kiểm tra kết nối mạng và thử lại.';
            } else {
                userMessage += 'Vui lòng thử lại sau.';
                if (errorMsg && errorMsg.length < 200) {
                    userMessage += '\n\nChi tiết: ' + errorMsg;
                }
            }
            this.addMessage('ai', userMessage);
        }
    }
}

// Export để sử dụng trong HTML
if (typeof window !== 'undefined') {
    window.CareerMateAI = CareerMateAI;
}

