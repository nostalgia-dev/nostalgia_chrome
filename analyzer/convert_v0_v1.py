import os
import re
import just
import json
import gzip
from auto_extract import parse_article
import tqdm
from utils import KEYS_TO_KEEP


def slug_url(url):
    pre_slug = re.sub(r"[-\s]+", "-", url)
    slugged_url = re.sub(r"[^\w\s-]", "", pre_slug).strip().lower()[-150:]
    return slugged_url


for x in tqdm.tqdm(just.glob("/home/pascal/nostalgia_data_chrome/old/html/*.json")):
    ctime = os.path.getctime(x)
    with open(x) as f:
        print("processing", x)
        data = json.load(f)
        html = data["html"]
        url = data["url"]
        slugged_url = slug_url(url)
        article = parse_article(html, url)
        meta = article.to_dict(keys=KEYS_TO_KEEP, skip_if_empty=True)
        meta["creation_time"] = ctime
        meta["slugged_url"] = slugged_url
        html_path = "/home/pascal/nostalgia_data_chrome/html/{}_{}.html.gz".format(
            ctime, slugged_url
        )
        with gzip.GzipFile(html_path, "w") as f:
            f.write(html.encode("utf8"))
        meta_path = "/home/pascal/nostalgia_data_chrome/meta/v1/{}_{}.json".format(
            ctime, slugged_url
        )
        just.write(meta, meta_path)
        os.system("touch '{}' -r '{}'".format(html_path, x))
        os.system("touch '{}' -r '{}'".format(meta_path, x))
        just.remove(x)
