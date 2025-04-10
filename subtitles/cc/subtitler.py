from moviepy.editor import VideoFileClip, TextClip, CompositeVideoClip
from moviepy.video.tools.subtitles import SubtitlesClip
import moviepy.config as mpy_conf
import sys

mpy_conf.change_settings({"IMAGEMAGICK_BINARY": r"C:\Program Files\ImageMagick-7.1.1-Q16-HDRI\magick.exe"})
#
#
# MAKE SURE TO UPDATE THIS PATH TO YOUR IMAGE MAGICK INSTALLATION
#
#

# Load the video file
video = VideoFileClip(sys.argv[1])
script = sys.argv[2]

# Define subtitle style
def subtitle_generator(txt):
    return TextClip(
        txt,
        font="fonts/Montserrat-Black.otf",
        #
        # MAKE SURE YOU HAVE THIS OTF VERSION OF MONTSERRAT AT THE CORRECT LOCATION
        #

        fontsize=80,
        color="#ffe88c",
        stroke_color="black",
        stroke_width=3,
        method="caption",
        size=(980, None),
        align="center"
    )


# Load subtitles from an .srt file
subtitles = SubtitlesClip(script, subtitle_generator)

# Use this to see how the subtitles look without having to render the entire clip.
#subtitle_generator("Test Subtitle").save_frame("preview.png")

# Raise subtitles by setting position above the bottom
final_video = CompositeVideoClip([
    video,
    subtitles.set_position(('center', video.h - 580))  # Raise up by ~180 pixels
])

# Overlay subtitles on the video
#final_video = CompositeVideoClip([video, subtitles.set_position(('center', 'bottom'))])

# Write the final video to a file
final_video.write_videofile("video_with_subtitles.mp4", codec='libx264', audio_codec='aac')
