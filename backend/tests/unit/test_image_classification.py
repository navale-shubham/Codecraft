from pathlib import Path
from io import BytesIO

from app.core import classify_image, classify_images


def test_image_classification():
    categories = ['Garbage', 'Pothole', 'Water Leakage']
    images_category = [
        (Path(__file__).parent / 'assets' / 'garbage.jpg', 'Garbage'),
        (Path(__file__).parent / 'assets' / 'pothole-1.jpg', 'Pothole'),
        (Path(__file__).parent / 'assets' / 'water_leakage.jpg', 'Water Leakage'),
    ]

    for image_path, category in images_category:
        with open(image_path, "rb") as f:
            image_data = f.read()
        
        result = classify_image(BytesIO(image_data), "image/jpeg", categories)

        assert result.category == category


def test_images_classification():
    categories = ['Garbage', 'Pothole', 'Water Leakage']
    images = [
        (Path(__file__).parent / 'assets' / 'garbage.jpg', 'image/jpeg'),
        (Path(__file__).parent / 'assets' / 'pothole-1.jpg', 'image/jpeg'),
        (Path(__file__).parent / 'assets' / 'pothole-2.jpg', 'image/jpeg'),
        (Path(__file__).parent / 'assets' / 'pothole-3.jpg', 'image/jpeg'),
        (Path(__file__).parent / 'assets' / 'pothole-4.jpg', 'image/jpeg'),
    ]

    images_with_data = []
    for image_path, image_type in images:
        with open(image_path, "rb") as f:
            image_data = f.read()
        images_with_data.append((BytesIO(image_data), image_type))

    result = classify_images(images_with_data, categories)

    assert result == 'Pothole'
