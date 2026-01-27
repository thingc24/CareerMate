import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function MockInterview() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('AI'); // AI or HUMAN
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);

    // AI State
    const [aiHistory, setAiHistory] = useState([]);

    // Recruiter State
    const [recruiters, setRecruiters] = useState([]);
    const [requests, setRequests] = useState([]);
    const [selectedRecruiter, setSelectedRecruiter] = useState('');
    const [bookingMessage, setBookingMessage] = useState('');
    const [searchRecruiter, setSearchRecruiter] = useState('');

    useEffect(() => {
        loadJobs();
        if (activeTab === 'AI') {
            loadAiHistory();
        } else {
            loadRecruiterData();
        }
    }, [activeTab]);

    const loadJobs = async () => {
        try {
            const data = await api.getJobs(0, 50); // Fetch top 50 jobs
            setJobs(data.content || []);
        } catch (e) {
            console.error(e);
        }
    };

    const loadAiHistory = async () => {
        try {
            // Need to get student ID from somewhere. 
            // Assuming we can get it from user profile or context if stored.
            // But api.getAIMockInterviewHistory requires studentID.
            // Let's first fetch user profile to get ID if user.id is not it (user.id is normally account id).
            // Actually, for now, let's try using user.id. If backend expects Student profile ID, we might need a lookup.
            // In User Service, User is the base.
            // For now, let's assume user.id works or we need to fetch profile.
            // Let's fetch profile first to be safe.
            const profile = await api.getStudentProfile();
            const data = await api.getAIMockInterviewHistory(profile.id); // Assuming profile object has ID
            setAiHistory(data);
        } catch (e) {
            console.error(e);
        }
    };

    const loadRecruiterData = async () => {
        try {
            // Fetch recruiters (search companies and get their recruiters?)
            // This is tricky as we don't have "getAllRecruiters" for students.
            // For prototype, let's fetch companies, and for each company get recruiter? Too slow.
            // Let's just list "Requests" first.
            const profile = await api.getStudentProfile();
            const myRequests = await api.getMyMockInterviewRequests(profile.id);
            setRequests(myRequests);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSearchRecruiter = async () => {
        try {
            // Get jobs to find companies
            const jobData = await api.getJobs(0, 20);
            const jobs = jobData.content || [];

            // Get unique company IDs
            const companyIds = [...new Set(jobs.map(j => j.companyId).filter(Boolean))];

            // Fetch recruiters for each company
            const recruiterPromises = companyIds.map(async (companyId) => {
                try {
                    const recruiterData = await api.getRecruiterByCompanyId(companyId);
                    if (recruiterData && recruiterData.id) {
                        // Backend returns single object, not array
                        // Need to fetch user and company info separately
                        const job = jobs.find(j => j.companyId === companyId);
                        return {
                            id: recruiterData.id,
                            name: recruiterData.fullName || recruiterData.position || 'Nhà tuyển dụng',
                            company: job?.companyName || 'Công ty'
                        };
                    }
                } catch (e) {
                    console.error(`Error fetching recruiter for company ${companyId}:`, e);
                }
                return null;
            });

            const recruitersData = await Promise.all(recruiterPromises);
            const validRecruiters = recruitersData.filter(r => r !== null);

            setRecruiters(validRecruiters);
        } catch (e) {
            console.error('Error loading recruiters:', e);
        }
    };

    const handleStartAI = (jobId) => {
        navigate(`/student/mock-interview/ai/${jobId}`);
    };

    const handleBookRecruiter = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            // using user.id for chat compatibility
            await api.requestMockInterview(selectedRecruiter, bookingMessage, user.id);
            alert('Đã gửi yêu cầu phỏng vấn!');
            setBookingMessage('');
            setSelectedRecruiter('');
            loadRecruiterData();
        } catch (e) {
            alert('Lỗi: ' + (e.response?.data?.error || e.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Phỏng vấn thử & Luyện tập</h1>

            <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800">
                <button
                    onClick={() => setActiveTab('AI')}
                    className={`pb-3 px-4 text-sm font-bold uppercase transition-all border-b-2 ${activeTab === 'AI' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                    <i className="fas fa-robot mr-2"></i> Phỏng vấn với AI
                </button>
                <button
                    onClick={() => setActiveTab('HUMAN')}
                    className={`pb-3 px-4 text-sm font-bold uppercase transition-all border-b-2 ${activeTab === 'HUMAN' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                    <i className="fas fa-user-tie mr-2"></i> Với chuyên gia
                </button>
            </div>

            {activeTab === 'AI' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 p-10 opacity-10">
                                <i className="fas fa-brain text-9xl"></i>
                            </div>
                            <h2 className="text-3xl font-black uppercase mb-4">Luyện phỏng vấn AI</h2>
                            <p className="text-white/80 mb-8 max-w-lg">
                                Chọn một vị trí công việc bạn quan tâm và để AI của CareerMate đóng vai nhà tuyển dụng phỏng vấn bạn. Nhận đánh giá chi tiết ngay lập tức.
                            </p>

                            <h3 className="font-bold uppercase tracking-widest text-xs mb-4 text-white/50">Chọn công việc để bắt đầu</h3>
                            <div className="grid gap-3 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                                {jobs.map(job => (
                                    <div key={job.id} className="bg-white/10 hover:bg-white/20 p-4 rounded-xl cursor-pointer transition-all border border-white/5 flex justify-between items-center group"
                                        onClick={() => handleStartAI(job.id)}
                                    >
                                        <div>
                                            <h4 className="font-bold text-sm">{job.title}</h4>
                                            <p className="text-xs opacity-70 mt-1">{job.companyName}</p>
                                        </div>
                                        <button className="w-10 h-10 rounded-full bg-white text-indigo-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:scale-110">
                                            <i className="fas fa-play"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                            <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight mb-4">Lịch sử luyện tập</h3>
                            <div className="space-y-4">
                                {aiHistory.length === 0 ? (
                                    <p className="text-center text-slate-400 text-xs py-10">Chưa có lịch sử phỏng vấn.</p>
                                ) : (
                                    aiHistory.map((h, i) => (
                                        <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded">
                                                    {h.jobTitle || 'Phỏng vấn'}
                                                </span>
                                                <span className="text-[10px] text-slate-400">
                                                    {new Date(h.startedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center mt-3">
                                                <div className="text-xs">
                                                    <span className="font-bold text-slate-500">Điểm số:</span>
                                                    <span className={`ml-2 font-black text-lg ${h.overallScore >= 80 ? 'text-emerald-500' : h.overallScore >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                                                        {h.overallScore || '--'}
                                                    </span>
                                                </div>
                                                <button className="text-xs font-bold text-indigo-600 hover:underline">Chi tiết</button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* HUMAN TAB */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                            <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight mb-6">Đặt lịch phỏng vấn</h3>

                            <form onSubmit={handleBookRecruiter} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Chọn Nhà Tuyển Dụng</label>
                                    {recruiters.length === 0 && <p className="text-xs text-slate-400 mb-2">Đang tải danh sách từ việc làm...</p>}
                                    <select
                                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm border-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                        value={selectedRecruiter}
                                        onChange={e => setSelectedRecruiter(e.target.value)}
                                        onClick={recruiters.length === 0 ? handleSearchRecruiter : undefined}
                                        required
                                    >
                                        <option value="">-- Chọn chuyên gia --</option>
                                        {recruiters.map(r => (
                                            <option key={r.id} value={r.id}>{r.name} ({r.company})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Lời nhắn / Mong muốn</label>
                                    <textarea
                                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm border-none focus:ring-2 focus:ring-blue-500 dark:text-white h-32 resize-none"
                                        placeholder="Tôi muốn phỏng vấn thử vị trí Java Backend..."
                                        value={bookingMessage}
                                        onChange={e => setBookingMessage(e.target.value)}
                                        required
                                    ></textarea>
                                </div>
                                <button disabled={loading} type="submit" className="w-full py-4 bg-blue-600 text-white font-black uppercase rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30">
                                    {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Gửi yêu cầu'}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                            <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight mb-6">Yêu cầu của bạn</h3>

                            <div className="space-y-4">
                                {requests.length === 0 ? (
                                    <p className="text-center text-slate-400 py-10">Chưa có yêu cầu nào.</p>
                                ) : (
                                    requests.map(req => (
                                        <div key={req.id} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${req.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-600' :
                                                        req.status === 'REJECTED' ? 'bg-red-100 text-red-600' :
                                                            'bg-yellow-100 text-yellow-600'
                                                        }`}>
                                                        {req.status}
                                                    </span>
                                                    <span className="text-xs text-slate-400">{new Date(req.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <p className="font-bold text-slate-700 dark:text-slate-300">Gửi tới: {req.recruiterName || 'Chuyên gia'}</p>
                                                <p className="text-xs text-slate-500 mt-1 italic">"{req.message}"</p>
                                            </div>
                                            {req.status === 'ACCEPTED' && (
                                                <button onClick={() => navigate('/student/messages')} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">
                                                    <i className="fas fa-comment-dots mr-2"></i> Nhắn tin
                                                </button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
