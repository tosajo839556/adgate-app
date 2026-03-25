import os
import time
import uuid
import logging
from flask import Flask, render_template, request, session, jsonify, redirect, url_for, flash
from flask_session import Session
from werkzeug.middleware.proxy_fix import ProxyFix

# Set up logging for debugging
logging.basicConfig(level=logging.DEBUG)

# Create the app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key-change-in-production")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

# Configure session
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = False
app.config['SESSION_USE_SIGNER'] = True
Session(app)

# Google AdSense Publisher ID
app.config['ADSENSE_CLIENT_ID'] = os.environ.get("ADSENSE_CLIENT_ID", "ca-pub-2622644934500510")

# Routes
@app.route('/')
def index():
    """Main landing page with ad gate"""
    session.pop('ad_viewed', None)
    session.pop('ad_token', None)
    return render_template('index.html')

@app.route('/verify-ad', methods=['POST'])
def verify_ad():
    """Verify that user has interacted with the ad"""
    try:
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
    if not session.get('ad_viewed', False):
        flash('Please watch an ad to access the content.', 'warning')
        return redirect(url_for('index'))
    
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

@app.route('/reset-session')
def reset_session():
    """Reset the current session"""
    session.clear()
    flash('Session reset successfully.', 'info')
    return redirect(url_for('index'))

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 80))
    app.run(host='0.0.0.0', port=port, debug=True)