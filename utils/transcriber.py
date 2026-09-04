import whisper

# Load Whisper model only once
model = whisper.load_model("base")


def transcribe_audio(audio_path):

    result = model.transcribe(audio_path)

    transcript = result["text"]

    timestamps = []

    for segment in result["segments"]:

        timestamps.append({
            "start": segment["start"],
            "end": segment["end"],
            "text": segment["text"]
        })

    return transcript, timestamps