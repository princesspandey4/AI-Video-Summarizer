import os
from dotenv import load_dotenv
from google import genai

# Load .env file
load_dotenv()

# Create Gemini client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def generate_summary(transcript, output_language="english"):
    prompt = f"""
You are an AI assistant.

The selected output language is: {output_language}

Write the summary and important points in this language.

Language rules:
- english = Use simple English.
- hindi = Use simple Hindi written in Devanagari script.
- hinglish = Use simple Hindi-English mixed language written in Roman script.

Read the following transcript and generate:

1. A short summary (5-6 lines).
2. 5 important points.

Important:
- Summary: ko 5-6 short lines me likho.
- Important points ko numbered list me likho.
- Har point ke start me 1., 2., 3., 4., 5. use karo.

Rules:
- Do not use Markdown symbols like **, *, # or -.
- Return plain text only.
- Make the language simple and easy to understand.

Transcript:
{transcript}
"""

    response = client.models.generate_content(
        model="gemini-3.1-flash-lite",
        contents=prompt
    )

    return response.text

def generate_video_chapters(transcript, timestamps):

    timestamp_text = ""

    for segment in timestamps:

        mins = int(segment["start"] // 60)
        secs = int(segment["start"] % 60)

        timestamp_text += f"{mins:02d}:{secs:02d} - {segment['text']}\n"

    prompt = f"""
You are an AI assistant.

Below is a transcript with timestamps.

Create Video Chapters.

Rules:

1. Identify only important topics.
2. Ignore unnecessary sentences.
3. Return only 5-10 chapters.
4. Each chapter should contain:

Timestamp - Topic Name

Example:

00:00 Introduction

02:15 Artificial Intelligence

05:48 Machine Learning

08:22 Deep Learning

12:10 Conclusion

Return plain text only.

Transcript with timestamps:

{timestamp_text}
"""

    response = client.models.generate_content(
        model="gemini-3.1-flash-lite",
        contents=prompt
    )

    chapters = []

    for line in response.text.splitlines():

        line = line.strip()

        if not line:
           continue

        if len(line) < 6:
            continue

        time = line[:5]
        title = line[6:].strip()

        mins, secs = map(int, time.split(":"))

        chapters.append({
            "time": time,
            "text": title,
            "seconds": mins * 60 + secs
        })

    return chapters

def translate_content(text, target_language):

    if target_language == "english":
        language_instruction = "Translate into simple English."

    elif target_language == "hindi":
        language_instruction = "Translate into simple Hindi using Devanagari script."

    elif target_language == "hinglish":
        language_instruction = "Translate into simple Hinglish using Roman script. Mix Hindi and English naturally."

    else:
        language_instruction = "Translate into simple English."

    prompt = f"""
You are a translation assistant.

{language_instruction}

Important rules:
- Keep the original meaning.
- Do not add new information.
- Do not remove important information.
- Keep the text easy to understand.
- Return only the translated text.

Text:
{text}
"""

    response = client.models.generate_content(
        model="gemini-3.1-flash-lite",
        contents=prompt
    )

    return response.text