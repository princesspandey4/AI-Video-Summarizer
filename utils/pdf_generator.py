from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
import os


def create_pdf(video_name, summary, notes, output_path):

    doc = SimpleDocTemplate(output_path)

    styles = getSampleStyleSheet()

    story = []

    # Title
    story.append(Paragraph("<b>AI VIDEO KNOWLEDGE EXTRACTOR</b>", styles["Title"]))

    # Video Name
    story.append(Paragraph(f"<b>Video Name:</b> {video_name}", styles["Heading2"]))

    # Summary
    story.append(Paragraph("<b>AI Summary</b>", styles["Heading2"]))
    story.append(Paragraph(summary.replace("\n", "<br/>"), styles["BodyText"]))

    # Notes
    story.append(Paragraph("<b>Smart Notes</b>", styles["Heading2"]))
    story.append(Paragraph(notes.replace("\n", "<br/>"), styles["BodyText"]))

    doc.build(story)

    return output_path
def create_qa_pdf(question_history, output_path):

    doc = SimpleDocTemplate(output_path)

    styles = getSampleStyleSheet()

    story = []

    # Title
    story.append(
        Paragraph("<b>AI VIDEO QUESTION & ANSWER REPORT</b>", styles["Title"])
    )

    if len(question_history) == 0:

        story.append(
            Paragraph("No questions asked.", styles["BodyText"])
        )

    else:

        for i, item in enumerate(question_history, start=1):

            story.append(
                Paragraph(
                    f"<b>Question {i}</b>",
                    styles["Heading2"]
                )
            )

            story.append(
                Paragraph(
                    item["question"],
                    styles["BodyText"]
                )
            )

            story.append(
                Paragraph(
                    "<b>Answer</b>",
                    styles["Heading3"]
                )
            )

            story.append(
                Paragraph(
                    item["answer"].replace("\n", "<br/>"),
                    styles["BodyText"]
                )
            )

    doc.build(story)

    return output_path