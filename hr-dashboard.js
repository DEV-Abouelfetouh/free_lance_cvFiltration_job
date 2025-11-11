// HR Dashboard Functionality
class HRDashboard {
    constructor() {
        this.currentTab = 'add-job';
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadJobsList();
        this.updateAnalytics();
    }

    bindEvents() {
        // Job form submission
        const jobForm = document.getElementById('jobForm');
        if (jobForm) {
            jobForm.addEventListener('submit', (e) => this.handleJobFormSubmit(e));
        }

        // Settings form submission
        const settingsForm = document.getElementById('settingsForm');
        if (settingsForm) {
            settingsForm.addEventListener('submit', (e) => this.handleSettingsFormSubmit(e));
        }
    }

    showHRTab(tabId) {
        // Update sidebar buttons
        document.querySelectorAll('.btn-sidebar').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');

        // Show selected tab
        document.querySelectorAll('.hr-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.getElementById(tabId + '-tab').classList.add('active');

        this.currentTab = tabId;

        // Refresh data if needed
        if (tabId === 'manage-jobs') {
            this.loadJobsList();
        } else if (tabId === 'analytics') {
            this.updateAnalytics();
        }
    }

    handleJobFormSubmit(e) {
        e.preventDefault();
        
        const formData = {
            title: document.getElementById('jobTitle').value,
            department: document.getElementById('jobDepartment').value,
            skills: document.getElementById('jobSkills').value.split(',').map(skill => skill.trim()),
            keywords: document.getElementById('jobKeywords').value.split(',').map(keyword => keyword.trim()),
            experience: parseInt(document.getElementById('jobExperience').value),
            salary: document.getElementById('jobSalary').value,
            education: document.getElementById('jobEducation').value,
            description: document.getElementById('jobDescription').value
        };

        // Validate required fields
        if (!formData.title || !formData.department || formData.skills.length === 0) {
            alert('Please fill in all required fields.');
            return;
        }

        try {
            const newJob = db.addJob(formData);
            this.showNotification('Job position added successfully!', 'success');
            e.target.reset();
            this.loadJobsList();
            this.updateAnalytics();
        } catch (error) {
            this.showNotification('Error adding job position: ' + error.message, 'error');
        }
    }

    handleSettingsFormSubmit(e) {
        e.preventDefault();
        
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword && newPassword !== confirmPassword) {
            this.showNotification('Passwords do not match!', 'error');
            return;
        }

        if (newPassword) {
            if (newPassword.length < 6) {
                this.showNotification('Password must be at least 6 characters long!', 'error');
                return;
            }

            const success = authManager.changePassword(newPassword);
            if (success) {
                this.showNotification('Password updated successfully!', 'success');
                e.target.reset();
            } else {
                this.showNotification('Error updating password!', 'error');
            }
        }
    }

    loadJobsList() {
        const container = document.getElementById('jobsListContainer');
        if (!container) return;

        const jobs = db.getJobs();
        
        if (jobs.length === 0) {
            container.innerHTML = `
                <div class="text-center">
                    <i class="fas fa-briefcase fa-3x" style="color: var(--secondary); margin-bottom: 1rem;"></i>
                    <h4>No Job Positions</h4>
                    <p>Get started by adding your first job position.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = jobs.map(job => `
            <div class="job-item">
                <div class="job-info">
                    <h4>${job.title}</h4>
                    <div class="job-meta">
                        ${job.department} • ${job.experience}+ years • 
                        ${job.skills.length} skills • 
                        <span style="color: ${job.isActive ? 'var(--success)' : 'var(--secondary)'}">
                            ${job.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>
                <div class="job-actions">
                    <button class="btn-icon edit" onclick="hrDashboard.editJob(${job.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete" onclick="hrDashboard.deleteJob(${job.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    editJob(jobId) {
        const jobs = db.getJobs();
        const job = jobs.find(j => j.id === jobId);
        
        if (job) {
            // Populate form with job data
            document.getElementById('jobTitle').value = job.title;
            document.getElementById('jobDepartment').value = job.department;
            document.getElementById('jobSkills').value = job.skills.join(', ');
            document.getElementById('jobKeywords').value = job.keywords.join(', ');
            document.getElementById('jobExperience').value = job.experience;
            document.getElementById('jobSalary').value = job.salary || '';
            document.getElementById('jobEducation').value = job.education;
            document.getElementById('jobDescription').value = job.description;

            // Change form to update mode
            const form = document.getElementById('jobForm');
            const submitBtn = form.querySelector('button[type="submit"]');
            
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Job Position';
            submitBtn.onclick = (e) => {
                e.preventDefault();
                this.updateJob(jobId);
            };

            // Scroll to form
            this.showHRTab('add-job');
        }
    }

    updateJob(jobId) {
        const formData = {
            title: document.getElementById('jobTitle').value,
            department: document.getElementById('jobDepartment').value,
            skills: document.getElementById('jobSkills').value.split(',').map(skill => skill.trim()),
            keywords: document.getElementById('jobKeywords').value.split(',').map(keyword => keyword.trim()),
            experience: parseInt(document.getElementById('jobExperience').value),
            salary: document.getElementById('jobSalary').value,
            education: document.getElementById('jobEducation').value,
            description: document.getElementById('jobDescription').value
        };

        const success = db.updateJob({ id: jobId, ...formData });
        
        if (success) {
            this.showNotification('Job position updated successfully!', 'success');
            this.resetJobForm();
            this.loadJobsList();
            this.updateAnalytics();
        } else {
            this.showNotification('Error updating job position!', 'error');
        }
    }

    deleteJob(jobId) {
        if (confirm('Are you sure you want to delete this job position? This action cannot be undone.')) {
            const success = db.deleteJob(jobId);
            
            if (success) {
                this.showNotification('Job position deleted successfully!', 'success');
                this.loadJobsList();
                this.updateAnalytics();
            } else {
                this.showNotification('Error deleting job position!', 'error');
            }
        }
    }

    resetJobForm() {
        const form = document.getElementById('jobForm');
        form.reset();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Job Position';
        submitBtn.onclick = null;
    }

    updateAnalytics() {
        const analytics = db.getAnalytics();
        
        document.getElementById('totalJobs').textContent = analytics.totalJobs || 0;
        document.getElementById('cvProcessed').textContent = analytics.totalCVs || 0;
        
        // Calculate average match rate
        const matchRates = analytics.matchRates || [];
        const avgRate = matchRates.length > 0 ? 
            Math.round(matchRates.reduce((sum, record) => sum + record.rate, 0) / matchRates.length) : 0;
        document.getElementById('avgMatchRate').textContent = avgRate + '%';
        
        // Find most required skill
        const skillsFrequency = analytics.skillsFrequency || {};
        const topSkill = Object.keys(skillsFrequency).length > 0 ?
            Object.keys(skillsFrequency).reduce((a, b) => 
                skillsFrequency[a] > skillsFrequency[b] ? a : b
            ) : '-';
        document.getElementById('topSkill').textContent = topSkill;
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}-circle"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--primary)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 0.5rem;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // Export/Import functionality
    exportData() {
        const data = db.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cv-analyzer-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const success = db.importData(e.target.result);
            if (success) {
                this.showNotification('Data imported successfully!', 'success');
                this.loadJobsList();
                this.updateAnalytics();
            } else {
                this.showNotification('Error importing data!', 'error');
            }
        };
        reader.readAsText(file);
    }
}

// Initialize HR Dashboard
const hrDashboard = new HRDashboard();