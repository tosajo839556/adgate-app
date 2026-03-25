// AdGate JavaScript functionality
class AdGateManager {
    constructor() {
        this.adViewed = false;
        this.countdown = 15;
        this.countdownInterval = null;
        this.adLoadTimeout = null;
        
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupAdGate());
        } else {
            this.setupAdGate();
        }
    }
    
    setupAdGate() {
        // Only run on index page
        const getButton = document.getElementById('get-link-btn');
        if (!getButton) return;
        
        this.simulateAdLoading();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        const getButton = document.getElementById('get-link-btn');
        if (getButton) {
            getButton.addEventListener('click', () => this.handleGetLink());
        }
        
        // Simulate ad interaction detection
        document.addEventListener('click', (e) => {
            if (e.target.closest('.ad-unit, .ad-placeholder')) {
                this.handleAdInteraction();
            }
        });
    }
    
    simulateAdLoading() {
        const placeholder = document.getElementById('ad-placeholder');
        const adUnit = document.querySelector('.ad-unit');
        
        // Simulate ad loading delay
        this.adLoadTimeout = setTimeout(() => {
            if (placeholder && adUnit) {
                placeholder.style.display = 'none';
                adUnit.classList.add('loaded');
                adUnit.style.display = 'block';
                
                // Auto-start ad interaction after a short delay
                setTimeout(() => {
                    this.handleAdInteraction();
                }, 2000);
            }
        }, 3000);
    }
    
    handleAdInteraction() {
        if (this.adViewed) return;
        
        console.log('Ad interaction detected');
        this.showAdTimer();
        this.startCountdown();
    }
    
    showAdTimer() {
        const timerElement = document.getElementById('ad-timer');
        const adContainer = document.getElementById('ad-container');
        
        if (timerElement && adContainer) {
            // Hide ad container and show timer
            adContainer.style.opacity = '0.5';
            adContainer.style.pointerEvents = 'none';
            timerElement.style.display = 'block';
        }
    }
    
    startCountdown() {
        const countdownElement = document.getElementById('countdown');
        const progressBar = document.getElementById('progress-bar');
        const getButton = document.getElementById('get-link-btn');
        
        if (!countdownElement || !progressBar) return;
        
        this.countdownInterval = setInterval(() => {
            this.countdown--;
            countdownElement.textContent = this.countdown;
            
            // Update progress bar
            const progress = ((15 - this.countdown) / 15) * 100;
            progressBar.style.width = `${progress}%`;
            
            if (this.countdown <= 0) {
                this.completeAdViewing();
            }
        }, 1000);
    }
    
    completeAdViewing() {
        clearInterval(this.countdownInterval);
        this.adViewed = true;
        
        // Hide timer and enable button
        const timerElement = document.getElementById('ad-timer');
        const getButton = document.getElementById('get-link-btn');
        const adContainer = document.getElementById('ad-container');
        
        if (timerElement) {
            timerElement.style.display = 'none';
        }
        
        if (adContainer) {
            adContainer.style.opacity = '1';
            adContainer.style.pointerEvents = 'auto';
        }
        
        if (getButton) {
            getButton.disabled = false;
            getButton.innerHTML = '<i class="fas fa-download me-2"></i>Get Your Link';
            getButton.classList.add('pulse');
        }
        
        // Show success message
        this.showNotification('Ad completed! You can now access the content.', 'success');
        
        // Verify with server
        this.verifyAdWithServer();
    }
    
    async verifyAdWithServer() {
        try {
            const response = await fetch('/verify-ad', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    timestamp: Date.now(),
                    userAgent: navigator.userAgent
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                console.log('Server verification successful');
            } else {
                throw new Error(data.message || 'Server verification failed');
            }
        } catch (error) {
            console.error('Ad verification error:', error);
            this.showNotification('Verification failed. Please try again.', 'danger');
            this.resetAdGate();
        }
    }
    
    async handleGetLink() {
        const getButton = document.getElementById('get-link-btn');
        const spinner = document.getElementById('btn-spinner');
        
        if (!this.adViewed || getButton.disabled) {
            this.showNotification('Please wait for the ad to complete.', 'warning');
            return;
        }
        
        // Show loading state
        getButton.disabled = true;
        if (spinner) {
            spinner.classList.remove('d-none');
        }
        
        try {
            // Redirect to content page
            window.location.href = '/get-content876kjhse96fskhef98';
        } catch (error) {
            console.error('Navigation error:', error);
            this.showNotification('Something went wrong. Please try again.', 'danger');
            
            // Reset button state
            getButton.disabled = false;
            if (spinner) {
                spinner.classList.add('d-none');
            }
        }
    }
    
    resetAdGate() {
        this.adViewed = false;
        this.countdown = 15;
        
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
        
        if (this.adLoadTimeout) {
            clearTimeout(this.adLoadTimeout);
        }
        
        // Reset UI elements
        const getButton = document.getElementById('get-link-btn');
        const timerElement = document.getElementById('ad-timer');
        const adContainer = document.getElementById('ad-container');
        
        if (getButton) {
            getButton.disabled = true;
            getButton.innerHTML = '<i class="fas fa-download me-2"></i>Get Your Link';
        }
        
        if (timerElement) {
            timerElement.style.display = 'none';
        }
        
        if (adContainer) {
            adContainer.style.opacity = '1';
            adContainer.style.pointerEvents = 'auto';
        }
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            <i class="fas fa-${this.getIconForType(type)} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
    
    getIconForType(type) {
        const icons = {
            'success': 'check-circle',
            'danger': 'exclamation-triangle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
}

// Initialize AdGate when script loads
const adGateManager = new AdGateManager();

// Add some CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
    .pulse {
        animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
        100% {
            transform: scale(1);
        }
    }
`;
document.head.appendChild(style);

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        console.log('Page hidden - pausing timers');
        // Pause any running timers when page is not visible
    } else {
        console.log('Page visible - resuming operation');
        // Resume operation when page becomes visible again
    }
});

// Handle beforeunload to warn users
window.addEventListener('beforeunload', (e) => {
    if (adGateManager.countdownInterval && !adGateManager.adViewed) {
        e.preventDefault();
        e.returnValue = 'You will lose your ad progress if you leave now. Are you sure?';
        return e.returnValue;
    }
});
