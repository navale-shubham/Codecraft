from io import BytesIO

from app.core import classify_image, classify_images


def test_image_classification():
    categories = ['garbage', 'pothole', 'water leakage']
    images_category = [
        ('backend/tests/assets/garbage.jpg', 'garbage'),
        ('backend/tests/assets/pothole-1.jpg', 'pothole'),
        ('backend/tests/assets/water_leakage.jpg', 'water leakage'),
    ]

    for image_path, category in images_category:
        with open(image_path, "rb") as f:
            image_data = f.read()
        
        result = classify_image(BytesIO(image_data), "image/jpeg", categories)

        assert result.category == category


def test_images_classification():
    categories = ['garbage', 'pothole', 'water leakage']
    images = [
        ('backend/tests/assets/garbage.jpg', 'image/jpeg'),
        ('backend/tests/assets/pothole-1.jpg', 'image/jpeg'),
        ('backend/tests/assets/pothole-2.jpg', 'image/jpeg'),
        ('backend/tests/assets/pothole-3.jpg', 'image/jpeg'),
        ('backend/tests/assets/pothole-4.jpg', 'image/jpeg'),
    ]

    images_with_data = []
    for image_path, image_type in images:
        with open(image_path, "rb") as f:
            image_data = f.read()
        images_with_data.append((BytesIO(image_data), image_type))

    result = classify_images(images_with_data, categories)

    assert result == 'pothole'
