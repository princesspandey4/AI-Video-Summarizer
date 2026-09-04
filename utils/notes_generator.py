import os
from dotenv import load_dotenv
from google import genai

# Load .env
load_dotenv()

# Create Gemini client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def generate_notes(transcript):

    prompt = f"""
You are an expert teacher.

Read the following transcript and prepare well-structured study notes.

Format:

Topic:

Definition:

Important Points:

Examples:

Use simple English.
Do not use Markdown symbols like ** or #.

Important:
- Notes ko clear bullet points me likho.
- Har important point ke start me • use karo.
- Points short aur easy to revise hone chahiye.

Transcript:
{transcript}
"""

    response = client.models.generate_content(
        model="gemini-3.1-flash-lite",
        contents=prompt
    )

    return response.text