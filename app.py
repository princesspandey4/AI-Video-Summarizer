from flask import Flask, render_template, request, send_file, flash, redirect, url_for
from utils.audio_extractor import extract_audio
from utils.transcriber import transcribe_audio
from utils.gemini_summarizer import generate_summary, translate_content
from utils.notes_generator import generate_notes
from utils.question_answer import answer_question
from utils.pdf_generator import create_pdf, create_qa_pdf
from utils.gemini_summarizer import generate_video_chapters
from flask import jsonify
import os
import yt_dlp

app = Flask(__name__)
app.secret_key = "your_secret_key_123"

# ---------- Global Variables ----------
latest_transcript = ""
latest_summary = ""
latest_notes = ""
latest_video = ""
latest_timestamps = []
latest_chapters = ""
question_history = []
# --------------------------------------

UPLOAD_FOLDER = "static/uploads"
AUDIO_FOLDER = "static/audio"
PDF_FOLDER = "static/pdfs"


app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["AUDIO_FOLDER"] = AUDIO_FOLDER
app.config["PDF_FOLDER"] = PDF_FOLDER

# Create folders if they don't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(AUDIO_FOLDER, exist_ok=True)
os.makedirs(PDF_FOLDER, exist_ok=True)


@app.route("/")
def home():
    return render_template(
        "dashboard.html",
        answer=""
    )


@app.route("/upload", methods=["POST"])
def upload():

    global latest_transcript
    global latest_summary
    global latest_notes
    global latest_video
    global latest_timestamps
    global latest_chapters
    global question_history

    output_language = request.form.get("output_language", "english")
    video_url = request.form.get("video_url", "").strip()

    # =========================
    # VIDEO LINK
    # =========================

    if video_url:
        try:

            ydl_opts = {
                    "format": "best[ext=mp4]/best",

                    "outtmpl": os.path.join(
                        app.config["UPLOAD_FOLDER"],
                        "%(title)s.%(ext)s"
                    ),

                    "merge_output_format": "mp4",

                    "extractor_args": {
                        "youtube": {
                            "player_client": ["web_embedded"]
                        }
                    },

                    "remote_components": ["ejs:github"]
                }

            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(video_url, download=True)
                filepath = ydl.prepare_filename(info)

                # If yt-dlp downloaded another extension and converted to mp4
                if not os.path.exists(filepath):
                    mp4_path = os.path.splitext(filepath)[0] + ".mp4"
                    if os.path.exists(mp4_path):
                        filepath = mp4_path

            print("Video downloaded:", filepath)

        except Exception as e:
            print("VIDEO LINK ERROR:", e)
            return f"Unable to download video: {str(e)}"

    # =========================
    # NORMAL FILE UPLOAD
    # =========================

    else:
        if "video" not in request.files:
            return "No file selected."
        video = request.files["video"]

        if video.filename == "":
            return "Please choose a video."

        filepath = os.path.join(
            app.config["UPLOAD_FOLDER"],
            video.filename
        )

        video.save(filepath)

        print("Video saved:", filepath)
    print("Video saved:", filepath)

    # Extract audio
    audio_path = extract_audio(filepath, app.config["AUDIO_FOLDER"])

    print("Audio extracted:", audio_path)

    # Speech to text
    transcript, timestamps = transcribe_audio(audio_path)
    print("Transcript generated")

   # AI Summary
    summary = generate_summary(transcript, output_language)

# AI Notes
    notes = generate_notes(transcript)

# AI Chapters
    chapters = generate_video_chapters(
        transcript,
        timestamps
)
    # Save globally
    latest_transcript = transcript
    latest_summary = summary
    latest_notes = notes
    latest_video = "/" + filepath
    latest_timestamps = timestamps
    latest_chapters = chapters
    question_history = []

    return render_template(
        "dashboard.html",
        video=latest_video,
        transcript=latest_transcript,
        summary=latest_summary,
        notes=latest_notes,
        chapters=latest_chapters,
        question_history=question_history,
        answer=""
    )

@app.route("/ask", methods=["POST"])
def ask():

    global question_history

    question = request.form.get("question", "").strip()

    # Video check
    if latest_transcript == "":
        return jsonify({
            "success": False,
            "message": "Please upload a video first."
        })

    # Question check
    if question == "":
        return jsonify({
            "success": False,
            "message": "Please enter a question."
        })

    try:

        # Ask AI using transcript
        answer = answer_question(
            question,
            latest_transcript
        )

        # Save question history
        question_history.append({
            "question": question,
            "answer": answer
        })

        return jsonify({
            "success": True,
            "answer": answer
        })

    except Exception as e:

        print("ASK AI ERROR:", e)

        return jsonify({
            "success": False,
            "message": "Unable to get AI answer."
        }), 500
    
@app.route("/change_language", methods=["POST"])
def change_language():

    language = request.form.get("language", "english")

    if latest_transcript == "":
        return {
            "success": False,
            "message": "Please upload a video first."
        }

    # ===============================
    # TRANSLATE ALL CONTENT
    # ===============================

    translated_transcript = translate_content(
        latest_transcript,
        language
    )

    translated_summary = translate_content(
        latest_summary,
        language
    )

    translated_notes = translate_content(
        latest_notes,
        language
    )

    # ===============================
    # TRANSLATE CHAPTERS
    # ===============================

    translated_chapters = []

    for chapter in latest_chapters:

        translated_title = translate_content(
            chapter["text"],
            language
        )

        translated_chapters.append({
            "time": chapter["time"],
            "text": translated_title,
            "seconds": chapter["seconds"]
        })

    return {
        "success": True,
        "language": language,
        "transcript": translated_transcript,
        "summary": translated_summary,
        "notes": translated_notes,
        "chapters": translated_chapters
    }

@app.route("/download_pdf")
def download_pdf():

    # No video uploaded
    if not latest_video or not latest_transcript:
        return jsonify({
            "success": False,
            "message": "Please upload a video first."
        }), 400

    video_name = os.path.basename(latest_video)

    pdf_path = os.path.join(
        app.config["PDF_FOLDER"],
        "AI_Video_Report.pdf"
    )

    create_pdf(
        video_name,
        latest_summary,
        latest_notes,
        pdf_path
    )

    return send_file(pdf_path, as_attachment=True)
@app.route("/download_qa_pdf")
def download_qa_pdf():

    if len(question_history) == 0:
        return {"success": False}

    pdf_path = os.path.join(
        app.config["PDF_FOLDER"],
        "AI_Questions_Report.pdf"
    )

    create_qa_pdf(
        question_history,
        pdf_path
    )

    return {
    "success": True,
    "url": "/download_qa_pdf_file"
}

@app.route("/download_qa_pdf_file")
def download_qa_pdf_file():

    pdf_path = os.path.join(
        app.config["PDF_FOLDER"],
        "AI_Questions_Report.pdf"
    )

    return send_file(pdf_path, as_attachment=True)

if __name__ == "__main__":
    app.run(debug=True)   
    