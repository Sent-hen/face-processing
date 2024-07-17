from flask import Flask, request, render_template, redirect, url_for, session, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import os
import json

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SECRET_KEY'] = '6b8b4567327b23c664c16be0002f55f620fbd554c8f5f8f78c7dfd3e4a73ba65'
db = SQLAlchemy(app)

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password, password):
            session['user_id'] = user.id
            session['is_admin'] = user.is_admin
            if user.is_admin:
                return redirect(url_for('admin'))
            else:
                return redirect(url_for('user'))
        else:
            return 'Invalid credentials'
    return render_template('login.html')

@app.route('/admin')
def admin():
    if 'is_admin' in session and session['is_admin']:
        return render_template('admin.html')
    return redirect(url_for('login'))

@app.route('/user')
def user():
    if 'user_id' in session:
        return render_template('user.html')
    return redirect(url_for('login'))

@app.route('/upload', methods=['POST'])
def upload():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    files = request.files.getlist('files[]')
    file_names = []
    for file in files:
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], file.filename))
        file_names.append(file.filename)
    return jsonify({'message': 'Files uploaded successfully', 'files': file_names})

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/save_locations', methods=['POST'])
def save_locations():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    data = request.get_json()
    with open('locations.json', 'w') as f:
        json.dump(data, f)
    return jsonify({'message': 'Locations saved successfully'})

if __name__ == '__main__':
    app.run(debug=True)
