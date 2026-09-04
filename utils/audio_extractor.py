from moviepy import VideoFileClip
import os

def extract_audio(video_path, output_folder):

    video = VideoFileClip(video_path)

    filename = os.path.splitext(os.path.basename(video_path))[0]

    audio_path = os.path.join(output_folder, filename + ".wav")

    video.audio.write_audiofile(audio_path)

    video.close()

    return audio_path
