import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def answer_question(question, transcript):

    prompt = f"""
You are an AI tutor.

Answer ONLY using the transcript below.

If the answer is not present in the transcript, reply:

"The answer is not available in the uploaded video."

Transcript:
{transcript}

Question:
{question}
"""

    response = client.models.generate_content(
        model="gemini-3.1-flash-lite",
        contents=prompt
    )

    return response.text