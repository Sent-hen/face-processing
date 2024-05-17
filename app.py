from flask import Flask, request, render_template, send_from_directory, jsonify
import os
import json

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
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
    data = request.get_json()
    with open('locations.json', 'w') as f:
        json.dump(data, f)
    return jsonify({'message': 'Locations saved successfully'})

if __name__ == '__main__':
    app.run(debug=True)
