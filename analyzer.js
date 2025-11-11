// CV Analyzer Functionality
class CVAnalyzer {
    constructor() {
        this.mockCV = {
            skills: ['JavaScript', 'HTML', 'CSS', 'React'],
            experience: 2,
            education: 'Bachelor in Computer Science',
            certifications: [],
            projects: 3,
            languages: ['English'],
            achievements: []
        };

        this.skillVariations = {
            'react': ['react.js', 'reactjs', 'react'],
            'html': ['html5', 'html'],
            'css': ['css3', 'css'],
            'javascript': ['js', 'es6', 'javascript', 'ecmascript'],
            'typescript': ['ts', 'typescript'],
            'node': ['node.js', 'nodejs', 'node'],
            'python': ['python', 'py'],
            'java': ['java'],
            'sql': ['sql', 'mysql', 'postgresql'],
            'mongodb': ['mongodb', 'mongo'],
            'express': ['express', 'express.js'],
            'vue': ['vue', 'vue.js'],
            'angular': ['angular', 'angular.js']
        };

        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        const cvUpload = document.getElementById('cvUpload');
        if (cvUpload) {
            cvUpload.addEventListener('change', (e) => {
                this.handleFileUpload(e);
            });
        }

        const uploadArea = document.getElementById('uploadArea');
        if (uploadArea) {
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = 'var(--primary)';
                uploadArea.style.background = 'rgba(37, 99, 235, 0.05)';
            });

            uploadArea.addEventListener('dragleave', () => {
                uploadArea.style.borderColor = '#cbd5e1';
                uploadArea.style.background = '';
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = '#cbd5e1';
                uploadArea.style.background = '';
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.analyzeCVWithJobMatching(files[0]);
                }
            });
        }
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            this.analyzeCVWithJobMatching(file);
        }
    }

    analyzeCVWithJobMatching(file) {
        const progressFill = document.getElementById('progressFill');
        const scoreDisplay = document.getElementById('scoreDisplay');
        const jobMatchesContainer = document.getElementById('jobMatchesContainer');
        const overallBreakdown = document.getElementById('overallBreakdown');

        // Reset UI
        progressFill.style.width = '0%';
        scoreDisplay.textContent = '0%';
        jobMatchesContainer.style.display = 'none';
        overallBreakdown.style.display = 'none';
        
        const jobMatches = document.getElementById('jobMatches');
        if (jobMatches) jobMatches.innerHTML = '';

        // Simulate analysis progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                this.showCVResultsWithJobMatches();
            }
            progressFill.style.width = progress + '%';
            scoreDisplay.textContent = Math.floor(progress) + '%';
        }, 200);
    }

    showCVResultsWithJobMatches() {
        const jobMatchesContainer = document.getElementById('jobMatchesContainer');
        const jobMatches = document.getElementById('jobMatches');
        const overallBreakdown = document.getElementById('overallBreakdown');

        jobMatchesContainer.style.display = 'block';
        overallBreakdown.style.display = 'block';

        // Get active jobs and calculate matches
        const jobs = db.getActiveJobs();
        const matches = jobs.map(job => {
            const matchResult = this.calculateJobMatch(job);
            return { job, ...matchResult };
        }).filter(match => {
            // Filter by minimum match threshold (50%+)
            const settings = db.getHRSettings();
            const minThreshold = settings.minMatchThreshold || 50;
            return match.matchScore >= minThreshold;
        }).sort((a, b) => b.matchScore - a.matchScore);

        if (matches.length === 0) {
            jobMatches.innerHTML = `
                <div class="text-center">
                    <i class="fas fa-search fa-3x" style="color: var(--secondary); margin-bottom: 1rem;"></i>
                    <h4>No Suitable Job Matches Found</h4>
                    <p>No jobs found with match rate above 50%. Try improving your CV skills or check back later for new positions.</p>
                </div>
            `;
            return;
        }

        // Calculate overall average breakdown
        const overallBreakdownData = this.calculateOverallBreakdown(matches);
        this.showOverallBreakdown(overallBreakdownData);

        // Display job matches with individual analysis
        matches.forEach(match => {
            const jobCard = this.createJobCard(match);
            jobMatches.appendChild(jobCard);
        });

        // Record analysis in database
        const bestMatchScore = matches.length > 0 ? matches[0].matchScore : 0;
        db.recordCVAnalysis(bestMatchScore);
    }

    createJobCard(match) {
        const jobCard = document.createElement('div');
        jobCard.className = 'job-card';
        jobCard.innerHTML = `
            <div class="job-header" onclick="cvAnalyzer.toggleAnalysis('analysis-${match.job.id}')">
                <div>
                    <h4>${match.job.title}</h4>
                    <p class="job-meta">${match.job.department} • ${match.job.experience}+ years • ${match.job.salary || 'Salary not specified'}</p>
                </div>
                <div class="match-score">${match.matchScore}%</div>
            </div>
            <div class="job-details">
                <div style="margin-bottom: 1rem;">
                    <strong>Required Skills:</strong> ${match.job.skills.join(', ')}
                </div>
                <div style="margin-bottom: 1rem;">
                    <strong>Education:</strong> ${match.job.education}
                </div>
                <button class="toggle-analysis" onclick="event.stopPropagation(); cvAnalyzer.toggleAnalysis('analysis-${match.job.id}')">
                    <i class="fas fa-chart-bar"></i> Show Detailed Analysis
                </button>
                <div id="analysis-${match.job.id}" class="hidden">
                    <div class="score-breakdown" style="margin: 1rem 0;">
                        ${Object.keys(match.breakdown).map(category => `
                            <div class="breakdown-item">
                                <div class="breakdown-score">${match.breakdown[category].score}%</div>
                                <div class="breakdown-label">${match.breakdown[category].label}</div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="reasons-section">
                        <h4>Analysis for ${match.job.title}</h4>
                        <div>
                            ${match.reasons.map(reason => `
                                <div class="reason-item ${reason.positive ? 'positive' : 'negative'}">
                                    <div class="reason-icon">
                                        <i class="fas ${reason.icon || (reason.positive ? 'fa-check-circle' : 'fa-exclamation-circle')}"></i>
                                    </div>
                                    <div class="reason-content">
                                        <div class="reason-title">${reason.title}</div>
                                        <div class="reason-description">${reason.description}</div>
                                        <div class="reason-suggestion">
                                            <strong>${reason.positive ? 'Tip:' : 'Suggestion:'}</strong> ${reason.suggestion}
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        return jobCard;
    }

    calculateOverallBreakdown(matches) {
        const categories = ['skills', 'experience', 'education', 'projects'];
        const overall = {};
        
        categories.forEach(category => {
            const scores = matches.map(match => match.breakdown[category]?.score || 0);
            const avgScore = scores.length > 0 ? 
                Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
            
            overall[category] = {
                score: avgScore,
                label: matches[0]?.breakdown[category]?.label || category
            };
        });
        
        return overall;
    }

    showOverallBreakdown(breakdown) {
        const overallBreakdownContainer = document.getElementById('overallBreakdownContainer');
        overallBreakdownContainer.innerHTML = '';
        
        Object.keys(breakdown).forEach(category => {
            const item = document.createElement('div');
            item.className = 'breakdown-item';
            item.innerHTML = `
                <div class="breakdown-score">${breakdown[category].score}%</div>
                <div class="breakdown-label">${breakdown[category].label}</div>
            `;
            overallBreakdownContainer.appendChild(item);
        });
    }

    toggleAnalysis(analysisId) {
        const analysisElement = document.getElementById(analysisId);
        if (!analysisElement) return;
        
        analysisElement.classList.toggle('hidden');
        
        const button = analysisElement.previousElementSibling;
        if (analysisElement.classList.contains('hidden')) {
            button.innerHTML = '<i class="fas fa-chart-bar"></i> Show Detailed Analysis';
        } else {
            button.innerHTML = '<i class="fas fa-chart-bar"></i> Hide Detailed Analysis';
        }
    }

    normalizeSkill(skill) {
        const lowerSkill = skill.toLowerCase().trim();
        
        for (const [base, variations] of Object.entries(this.skillVariations)) {
            if (variations.includes(lowerSkill)) {
                return base;
            }
        }
        
        return lowerSkill;
    }

    calculateJobMatch(job) {
        let matchScore = 0;
        const reasons = [];
        const breakdown = {};
        
        // Skills Analysis (40% of score)
        const userSkills = this.mockCV.skills.map(skill => this.normalizeSkill(skill));
        const jobSkills = job.skills.map(skill => this.normalizeSkill(skill));
        
        const missingSkills = jobSkills.filter(jobSkill => 
            !userSkills.includes(jobSkill)
        );

        const skillsScore = Math.max(0, 40 - (missingSkills.length * 5));
        matchScore += skillsScore;
        breakdown.skills = { score: skillsScore, label: 'Skills Match' };
        
        if (missingSkills.length > 0) {
            reasons.push({
                icon: 'fa-code',
                title: `Missing ${missingSkills.length} key skills`,
                description: `The job requires: ${job.skills.filter(skill => missingSkills.includes(this.normalizeSkill(skill))).join(', ')}`,
                suggestion: `Consider learning ${missingSkills.slice(0, 2).join(' and ')} through online courses or projects`,
                positive: false
            });
        } else {
            reasons.push({
                icon: 'fa-check-circle',
                title: 'All required skills present!',
                description: 'Your CV contains all the technical skills needed for this position',
                suggestion: 'Consider highlighting these skills more prominently in your CV',
                positive: true
            });
        }
        
        // Experience Analysis (30% of score)
        const expDifference = job.experience - this.mockCV.experience;
        const experienceScore = expDifference <= 0 ? 30 : Math.max(0, 30 - (expDifference * 5));
        matchScore += experienceScore;
        breakdown.experience = { score: experienceScore, label: 'Experience' };
        
        if (expDifference > 0) {
            reasons.push({
                icon: 'fa-briefcase',
                title: 'Insufficient experience',
                description: `The job requires ${job.experience} years, you have ${this.mockCV.experience}`,
                suggestion: `Highlight your ${this.mockCV.experience} years of relevant experience and focus on achievements`,
                positive: false
            });
        } else {
            reasons.push({
                icon: 'fa-check-circle',
                title: 'Experience requirements met!',
                description: `You meet or exceed the ${job.experience} years experience requirement`,
                suggestion: 'Quantify your achievements to make your experience stand out',
                positive: true
            });
        }
        
        // Education Analysis (15% of score)
        const educationKeywords = ['bachelor', 'master', 'phd', 'degree', 'diploma'];
        const hasHigherEducation = educationKeywords.some(keyword => 
            this.mockCV.education.toLowerCase().includes(keyword)
        );
        const educationScore = hasHigherEducation ? 15 : 8;
        matchScore += educationScore;
        breakdown.education = { score: educationScore, label: 'Education' };
        
        if (!hasHigherEducation) {
            reasons.push({
                icon: 'fa-graduation-cap',
                title: 'Education requirements',
                description: 'The position may prefer candidates with formal degrees',
                suggestion: 'Highlight any certifications, online courses, or practical experience that demonstrates your knowledge',
                positive: false
            });
        } else {
            reasons.push({
                icon: 'fa-check-circle',
                title: 'Education requirements met!',
                description: 'Your educational background matches the job requirements',
                suggestion: 'Consider adding relevant coursework or academic projects',
                positive: true
            });
        }
        
        // Projects & Achievements (15% of score)
        const projectsScore = this.mockCV.projects >= 2 ? 15 : 10;
        matchScore += projectsScore;
        breakdown.projects = { score: projectsScore, label: 'Projects & Achievements' };
        
        if (this.mockCV.projects < 2) {
            reasons.push({
                icon: 'fa-tasks',
                title: 'Limited project portfolio',
                description: `You have ${this.mockCV.projects} projects listed`,
                suggestion: 'Add more personal or professional projects to demonstrate practical experience',
                positive: false
            });
        } else {
            reasons.push({
                icon: 'fa-check-circle',
                title: 'Good project portfolio!',
                description: `You have ${this.mockCV.projects} quality projects listed`,
                suggestion: 'Add metrics and outcomes to your project descriptions',
                positive: true
            });
        }
        
        // Ensure score is between 0-100
        matchScore = Math.min(100, Math.max(0, Math.round(matchScore)));
        
        return {
            matchScore,
            reasons,
            breakdown
        };
    }
}

// Initialize CV Analyzer
const cvAnalyzer = new CVAnalyzer();