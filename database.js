// Database Management
class Database {
    constructor() {
        this.init();
    }

    init() {
        // Initialize default data if not exists
        if (!localStorage.getItem('jobsDatabase')) {
            this.resetToDefaultJobs();
        }

        if (!localStorage.getItem('analyticsData')) {
            localStorage.setItem('analyticsData', JSON.stringify({
                totalCVs: 0,
                totalJobs: 0,
                skillsFrequency: {},
                matchRates: []
            }));
        }

        if (!localStorage.getItem('hrSettings')) {
            localStorage.setItem('hrSettings', JSON.stringify({
                password: 'admin123', // Default password
                minMatchThreshold: 50 // Minimum match percentage to show jobs
            }));
        }
    }

    resetToDefaultJobs() {
        const defaultJobs = [
            {
                id: 1,
                title: "Senior Frontend Developer",
                department: "Engineering",
                skills: ["JavaScript", "React", "TypeScript", "CSS", "HTML", "Redux"],
                keywords: ["web development", "frontend", "UI/UX", "responsive design"],
                experience: 5,
                salary: "$90,000 - $120,000",
                education: "Bachelor in Computer Science or related field",
                description: "We're looking for an experienced frontend developer to join our team and help build amazing user experiences.",
                createdAt: new Date().toISOString(),
                isActive: true
            },
            {
                id: 2,
                title: "Full Stack Developer",
                department: "Technology",
                skills: ["JavaScript", "Node.js", "React", "MongoDB", "Express", "SQL"],
                keywords: ["full stack", "web development", "API", "database"],
                experience: 3,
                salary: "$75,000 - $100,000",
                education: "Computer Science degree or equivalent experience",
                description: "Join our dynamic team as a full stack developer working on cutting-edge web applications.",
                createdAt: new Date().toISOString(),
                isActive: true
            },
            {
                id: 3,
                title: "Backend Developer",
                department: "Engineering",
                skills: ["Python", "Django", "SQL", "API", "AWS"],
                keywords: ["backend", "server", "database", "cloud"],
                experience: 4,
                salary: "$85,000 - $110,000",
                education: "Computer Science degree preferred",
                description: "Looking for a backend developer with strong Python skills to build scalable APIs.",
                createdAt: new Date().toISOString(),
                isActive: true
            },
            {
                id: 4,
                title: "Junior Web Developer",
                department: "Development",
                skills: ["HTML", "CSS", "JavaScript", "React"],
                keywords: ["web development", "frontend", "junior"],
                experience: 1,
                salary: "$50,000 - $70,000",
                education: "Bootcamp or degree in related field",
                description: "Great opportunity for a junior developer to grow their skills in a supportive environment.",
                createdAt: new Date().toISOString(),
                isActive: true
            }
        ];
        localStorage.setItem('jobsDatabase', JSON.stringify(defaultJobs));
    }

    // Jobs Management
    getJobs() {
        return JSON.parse(localStorage.getItem('jobsDatabase') || '[]');
    }

    getActiveJobs() {
        const jobs = this.getJobs();
        return jobs.filter(job => job.isActive !== false);
    }

    addJob(job) {
        const jobs = this.getJobs();
        const newJob = {
            ...job,
            id: Date.now(),
            createdAt: new Date().toISOString(),
            isActive: true
        };
        jobs.push(newJob);
        localStorage.setItem('jobsDatabase', JSON.stringify(jobs));
        this.updateAnalytics();
        return newJob;
    }

    updateJob(updatedJob) {
        const jobs = this.getJobs();
        const index = jobs.findIndex(job => job.id === updatedJob.id);
        if (index !== -1) {
            jobs[index] = { ...jobs[index], ...updatedJob };
            localStorage.setItem('jobsDatabase', JSON.stringify(jobs));
            return true;
        }
        return false;
    }

    deleteJob(jobId) {
        const jobs = this.getJobs();
        const updatedJobs = jobs.filter(job => job.id !== jobId);
        localStorage.setItem('jobsDatabase', JSON.stringify(updatedJobs));
        this.updateAnalytics();
        return true;
    }

    // Analytics Management
    getAnalytics() {
        return JSON.parse(localStorage.getItem('analyticsData') || '{}');
    }

    updateAnalytics() {
        const jobs = this.getActiveJobs();
        const analytics = this.getAnalytics();
        
        analytics.totalJobs = jobs.length;
        
        // Update skills frequency
        const skillsFrequency = {};
        jobs.forEach(job => {
            job.skills.forEach(skill => {
                skillsFrequency[skill] = (skillsFrequency[skill] || 0) + 1;
            });
        });
        analytics.skillsFrequency = skillsFrequency;
        
        localStorage.setItem('analyticsData', JSON.stringify(analytics));
        return analytics;
    }

    recordCVAnalysis(matchRate) {
        const analytics = this.getAnalytics();
        analytics.totalCVs = (analytics.totalCVs || 0) + 1;
        analytics.matchRates = analytics.matchRates || [];
        analytics.matchRates.push({
            rate: matchRate,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 100 records
        if (analytics.matchRates.length > 100) {
            analytics.matchRates = analytics.matchRates.slice(-100);
        }
        
        localStorage.setItem('analyticsData', JSON.stringify(analytics));
    }

    // HR Settings Management
    getHRSettings() {
        return JSON.parse(localStorage.getItem('hrSettings') || '{}');
    }

    updateHRSettings(newSettings) {
        const currentSettings = this.getHRSettings();
        const updatedSettings = { ...currentSettings, ...newSettings };
        localStorage.setItem('hrSettings', JSON.stringify(updatedSettings));
        return updatedSettings;
    }

    // Export/Import Data
    exportData() {
        const data = {
            jobs: this.getJobs(),
            analytics: this.getAnalytics(),
            settings: this.getHRSettings(),
            exportDate: new Date().toISOString()
        };
        return JSON.stringify(data, null, 2);
    }

    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (data.jobs) localStorage.setItem('jobsDatabase', JSON.stringify(data.jobs));
            if (data.analytics) localStorage.setItem('analyticsData', JSON.stringify(data.analytics));
            if (data.settings) localStorage.setItem('hrSettings', JSON.stringify(data.settings));
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }
}

// Initialize global database instance
const db = new Database();