import gzip
import os
import just
from auto_extract import parse_article
import tqdm
from urllib.parse import urlparse
import tldextract
from utils import KEYS_TO_KEEP

for x in tqdm.tqdm(just.glob("/home/pascal/nostalgia_data_chrome/meta/v1/*.json")):
    print("processing", x)
    meta = just.read(x)
    if "extruct" in meta:
        print("skipping", x)
        continue

    html_path = (
        "/home/pascal/nostalgia_data_chrome/html/" + x.split("/")[-1].rstrip(".json") + ".html.gz"
    )
    if os.path.exists(html_path):
        with gzip.GzipFile(html_path, "r") as f:
            html = f.read()
        article = parse_article(html, meta["url"])
        meta = article.to_dict(keys=KEYS_TO_KEEP, skip_if_empty=True)
        just.write(meta, x)
        os.system("touch '{}' -r '{}'".format(x, html_path))
        print("done", x)
