import time
import uuid
from flask import render_template, request, session, jsonify, redirect, url_for, flash
from app import app

@app.route('/')
def index():
    """Main landing page with ad gate"""
    # Reset session state when user visits main page
    session.pop('ad_viewed', None)
    session.pop('ad_token', None)
    return render_template('index.html')

@app.route('/verify-ad', methods=['POST'])
def verify_ad():
    """Verify that user has interacted with the ad"""
    try:
        # Generate a unique token for this ad viewing session
        ad_token = str(uuid.uuid4())
        session['ad_viewed'] = True
        session['ad_token'] = ad_token
        session['ad_timestamp'] = time.time()
        
        app.logger.info(f"Ad verification successful for session: {session.get('session_id', 'unknown')}")
        
        return jsonify({
            'success': True, 
            'message': 'Ad verification successful',
            'token': ad_token
        })
    except Exception as e:
        app.logger.error(f"Ad verification error: {str(e)}")
        return jsonify({
            'success': False, 
            'message': 'Ad verification failed'
        }), 500

@app.route('/get-content876kjhse96fskhef98')
def get_content():
    """Protected content page - requires ad viewing"""
    # Check if user has viewed an ad recently (within 10 minutes)
    if not session.get('ad_viewed', False):
        flash('Please watch an ad to access the content.', 'warning')
        return redirect(url_for('index'))
    
    # Check if ad viewing is not too old (10 minutes)
    ad_timestamp = session.get('ad_timestamp', 0)
    current_time = time.time()
    if current_time - ad_timestamp > 600:  # 10 minutes
        flash('Your ad viewing session has expired. Please watch another ad.', 'warning')
        session.pop('ad_viewed', None)
        session.pop('ad_token', None)
        return redirect(url_for('index'))
    
    # Load links from links.txt file
    links = []
    try:
        with open('links.txt', 'r') as f:
            links = [line.strip() for line in f.readlines() if line.strip()]
    except FileNotFoundError:
        app.logger.warning("links.txt file not found")
        links = []
    
    return render_template('content.html', links=links)

# New route for the About Us page
@app.route('/about')
def about():
    """About Us page"""
    return render_template('about.html')

# New route for the Contact Us page
@app.route('/contact')
def contact():
    """Contact Us page"""
    return render_template('contact.html')

@app.route('/reset-session')
def reset_session():
    """Reset the current session (for testing purposes)"""
    session.clear()
    flash('Session reset successfully.', 'info')
    return redirect(url_for('index'))

@app.errorhandler(404)
def not_found_error(error):
    return render_template('index.html'), 404

@app.errorhandler(500)
def internal_error(error):
    return render_template('index.html'), 500