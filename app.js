// Main Application Controller
class App {
    constructor() {
        this.init();
    }

    init() {
        this.bindGlobalEvents();
        this.checkURLParams();
    }

    bindGlobalEvents() {
        // Global section navigation
        window.showSection = (sectionId) => {
            document.querySelectorAll('.content-area').forEach(section => {
                section.classList.remove('active');
            });
            document.querySelectorAll('.nav-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            document.getElementById(sectionId).classList.add('active');
            
            // Update active tab
            const activeTab = document.querySelector(`.nav-tab[onclick="showSection('${sectionId}')"]`);
            if (activeTab) {
                activeTab.classList.add('active');
            }
        };

        // Global HR tab navigation
        window.showHRTab = (tabId) => {
            hrDashboard.showHRTab(tabId);
        };

        // Global logout
        window.logout = () => {
            authManager.logout();
        };

        // Global analysis toggle
        window.toggleAnalysis = (analysisId) => {
            cvAnalyzer.toggleAnalysis(analysisId);
        };

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case '1':
                        e.preventDefault();
                        showSection('analyzer');
                        break;
                    case '2':
                        e.preventDefault();
                        requestHRAccess();
                        break;
                    case 'l':
                        if (authManager.isAuthenticated) {
                            e.preventDefault();
                            logout();
                        }
                        break;
                }
            }
        });
    }

    checkURLParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const section = urlParams.get('section');
        
        if (section === 'hr' && authManager.isAuthenticated) {
            showSection('hr-dashboard');
        }
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new App();
    
    // Show initial section
    showSection('analyzer');
    
    // Update UI based on auth status
    authManager.updateUI();
});

// Global utility functions
function downloadSampleCV() {
    // Create a sample CV template
    const cvContent = `
CV Analyzer Pro - Sample CV
============================

Personal Information:
Name: John Doe
Email: john.doe@example.com
Phone: (555) 123-4567

Education:
Bachelor of Science in Computer Science
University of Technology, 2018-2022

Skills:
- JavaScript, HTML5, CSS3
- React, Node.js
- Python, SQL
- Git, Docker

Experience:
Frontend Developer at Tech Solutions Inc. (2022-Present)
- Developed responsive web applications using React
- Collaborated with backend team on API integration
- Improved application performance by 30%

Projects:
1. E-commerce Website - Full-stack application with React and Node.js
2. Task Management App - React application with local storage
3. Portfolio Website - Responsive design with CSS Grid

Certifications:
- AWS Certified Cloud Practitioner
- React Developer Certification

Languages:
- English (Fluent)
- Spanish (Intermediate)
    `.trim();

    const blob = new Blob([cvContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-cv-template.txt';
    a.click();
    URL.revokeObjectURL(url);
}