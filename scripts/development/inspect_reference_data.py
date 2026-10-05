import os
import glob
import pandas as pd

ref_dir = r"d:\Geosentinal\GeoSentinel\data\reference"

for fpath in glob.glob(os.path.join(ref_dir, "*")):
    fname = os.path.basename(fpath)
    if fname.endswith(".csv"):
        df = pd.read_csv(fpath, nrows=3)
        print(f"=== {fname} ({len(pd.read_csv(fpath))} rows) ===")
        print(list(df.columns))
    elif fname.endswith(".xlsx"):
        df = pd.read_excel(fpath, nrows=3)
        print(f"=== {fname} ({len(pd.read_excel(fpath))} rows) ===")
        print(list(df.columns))
