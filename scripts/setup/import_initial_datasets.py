"""
Import verified real datasets from research project archive into GeoSentinel data directory.
"""
import zipfile
import os
import shutil

SOURCE_ZIP = r"D:\Programing\Research Project\GeoSentinel_Dataset_v2_VERIFIED_REAL.zip"
TARGET_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data"))

def main():
    print(f"Extracting verified dataset from: {SOURCE_ZIP}")
    os.makedirs(os.path.join(TARGET_DIR, "reference"), exist_ok=True)
    os.makedirs(os.path.join(TARGET_DIR, "raw"), exist_ok=True)
    os.makedirs(os.path.join(TARGET_DIR, "processed"), exist_ok=True)
    os.makedirs(os.path.join(TARGET_DIR, "synthetic_demo"), exist_ok=True)

    if os.path.exists(SOURCE_ZIP):
        with zipfile.ZipFile(SOURCE_ZIP, 'r') as z:
            for member in z.namelist():
                filename = os.path.basename(member)
                if not filename:
                    continue
                # Extract to reference directory
                target_path = os.path.join(TARGET_DIR, "reference", filename)
                with z.open(member) as source, open(target_path, "wb") as target:
                    shutil.copyfileobj(source, target)
                print(f"Extracted: {filename} -> data/reference/{filename}")
    else:
        print(f"Warning: Source zip {SOURCE_ZIP} not found.")

if __name__ == "__main__":
    main()
