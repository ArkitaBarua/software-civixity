import sys
from PIL import Image
from transformers import AutoModelForImageClassification, AutoImageProcessor
import torch

model_name = "prithivMLmods/open-deepfake-detection"
try:
    model = AutoModelForImageClassification.from_pretrained(model_name)
    processor = AutoImageProcessor.from_pretrained(model_name)
    id2label = model.config.id2label
except Exception as e:
    print("ERROR: Model load failed", e)
    sys.exit(1)

def classify_image(image_path):
    try:
        image = Image.open(image_path).convert("RGB")
        inputs = processor(images=image, return_tensors="pt")
        with torch.no_grad():
            outputs = model(**inputs)
            logits = outputs.logits
            probs = torch.nn.functional.softmax(logits, dim=1).squeeze().tolist()
        pred_idx = int(torch.argmax(torch.tensor(probs)))
        pred_label = id2label[pred_idx] if pred_idx in id2label else id2label[str(pred_idx)]
        if pred_label == "Fake":
            print("AI")
        else:
            print("Natural")
        return 0
    except Exception as e:
        print("ERROR: Image classify failed", e)
        return 1

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("ERROR: Usage python trial.py <image_path>")
        sys.exit(1)
    image_path = sys.argv[1]
    exit_code = classify_image(image_path)
    sys.exit(exit_code)
