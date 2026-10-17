from io import BytesIO

from google import genai
from google.genai import types
from pydantic import BaseModel

from app.core import settings


client = genai.Client(api_key=settings.GEMINI_API_KEY)


class ImageClassificationResponse(BaseModel):
    category: str


class InvalidResponseError(Exception):
    pass


class ImageClassificationError(Exception):
    pass


def classify_image(image_data: BytesIO, image_type: str, categories: list[str]) -> ImageClassificationResponse:
    file_part = types.Part.from_bytes(
        data=image_data.read(),
        mime_type=image_type
    )

    response = client.models.generate_content(
        model=settings.GEMINI_MODEL,
        contents=[
            file_part,
            (
                "Classify this image into exactly one category:\n"
                f"{', '.join(categories)}\n"
                "- Only reply with the category name.\n"
                "- If none of the categories match, reply with 'OTHER'."
            )
        ],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_json_schema=ImageClassificationResponse.model_json_schema(),
            temperature=0,
        ),
    )

    if not response.text or not response.text.strip():
        raise InvalidResponseError("Gemini returned an empty response.")
    
    try:
        image_classification_response = ImageClassificationResponse.model_validate_json(response.text)
    except Exception:
        raise InvalidResponseError("Invalid response from Gemini.")
    
    if image_classification_response.category == "OTHER":
        raise ImageClassificationError("Could not classify image.")
    
    if image_classification_response.category not in categories:
        raise ImageClassificationError(
            f"Invalid category {image_classification_response.category} for image."
        )

    return image_classification_response


def classify_images(images: list[tuple[BytesIO, str]], categories: list[str]) -> str:
    classified_images_categories = []

    try:
        for image_data, image_type in images:
            classified_images_categories.append(classify_image(image_data, image_type, categories).category)
    except Exception as exc:
        raise exc

    return max(set(classified_images_categories), key=lambda category: classified_images_categories.count(category))
