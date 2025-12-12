import eventlet
eventlet.monkey_patch()
from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit
import cohere
from datetime import datetime
from cohere_utils import generate_poetic_reflection
from flask_sqlalchemy import SQLAlchemy
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Validate environment configuration
COHERE_API_KEY = os.getenv("COHERE_API_KEY")
if not COHERE_API_KEY or COHERE_API_KEY == "your-cohere-api-key-here":
    print("⚠️  WARNING: COHERE_API_KEY not configured properly!")
    print("Please set your API key in the .env file")
    print("Get your free API key from: https://dashboard.cohere.com/api-keys")
    print("The app will run, but AI affirmations won't work.\n")


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///patches.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
socketio = SocketIO(app, cors_allowed_origins="*")
quilt = []

class Patch(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    color = db.Column(db.String(20))
    message = db.Column(db.String(300))
    ai_line = db.Column(db.String(500))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'color': self.color,
            'message': self.message,
            'timestamp': self.timestamp.strftime('%Y-%m-%d %H:%M:%S') if self.timestamp else ""
        }

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/ai-line', methods=['POST'])
def ai_line():
    data = request.json
    user_input = data.get("text", "")
    try:
        line = generate_poetic_reflection(user_input)
        return jsonify({'line': line})
    except Exception as e:
        print("Error generating poetic line:", e)
        return jsonify({'line': "Oops! AI is on break."}), 500

@app.route('/get-patches')
def get_patches():
    patches = Patch.query.order_by(Patch.timestamp.asc()).all()
    return jsonify([p.to_dict() for p in patches])
    # return jsonify([
        # {
        #     'color': p.color,
        #     'message': p.message,
        #     'ai_line': p.ai_line,
        #     'timestamp': p.timestamp.strftime("%Y-%m-%d %H:%M:%S")
        # } 
        # for p in patches])

@socketio.on('new_patch')
def handle_new_patch(patch_data):
    print("Received new patch ~", patch_data)
    
    # Store to DB
    new_patch = Patch(
        color=patch_data['color'],
        message=patch_data['message'],
        ai_line=patch_data.get('ai_line', "")
    )
    db.session.add(new_patch)
    db.session.commit()

    # Add timestamp for frontend
    response_patch = {
        'color': new_patch.color,
        'message': new_patch.message,
        'ai_line': new_patch.ai_line,
        'timestamp': new_patch.timestamp.strftime("%Y-%m-%d %H:%M:%S")
    }
    emit('update_quilt', response_patch, broadcast=True)

if __name__ == '__main__':
    import os
    with app.app_context():
        db.create_all()
    port = int(os.environ.get("PORT", 5000))
    socketio.run(app, host='0.0.0.0', port=port)
