import just
import time
from datetime import datetime
import gzip
import os
import re
from collections import deque

import lxml.html

from flask import Flask, jsonify, request, make_response, current_app


from nostalgia_chrome.server.cors import crossdomain
from nostalgia_chrome.server.utils import make_tree

BASE_PATH = "~/nostalgia_data/"
META_PATH = BASE_PATH + "meta.jsonl"

VIDEO_PATH = BASE_PATH + "videos_watched.jsonl"
app = Flask(__name__, static_folder=BASE_PATH + "html")

#  html = just.read("index.html")

last = []
last_urls = deque(maxlen=5)


@app.route("/", methods=["GET", "POST", "OPTIONS"])
def root():
    if not last:
        return ""
    return last[-1]


# @app.route("/diff", methods=["GET", "POST", "OPTIONS"])
# def view_diff():
#     return view_diff_html(last[-2], last[-1])


blocklist = ["/localhost", "file:/", "/127.0.0.1", "chrome:", "localhost:", "/tmp/"]


def slug_url(url):
    pre_slug = re.sub(r"[-\s]+", "-", url)
    slugged_url = re.sub(r"[^\w\s-]", "", pre_slug).strip().lower()[-150:]
    return slugged_url


@app.route("/post_json", methods=["GET", "POST", "OPTIONS"])
@crossdomain(origin="*", headers="Content-Type")
def add_text():
    url = request.json["url"]
    print("url", url)

    if any([y in url for y in blocklist]):
        print("blocked", [y for y in blocklist if y in url])
        return jsonify({})
    html = request.json["html"]
    html = lxml.html.tostring(lxml.html.fromstring(html.encode("utf8")))

    tree = make_tree(html, url)

    html = lxml.html.tostring(tree).decode("utf8")

    slugged_url = slug_url(url)

    t1 = time.time()
    # meta_path = BASE_PATH / "meta/v1/{}_{}.json".format(t1, slugged_url)
    # try:
    #     article = parse_article(html, url)
    #     metadata = article.to_dict(keys=ARTICLE_KEYS_TO_KEEP, skip_if_empty=True)
    # except Exception as e:
    #     metadata = {"error": str(e)}
    # metadata["creation_time"] = t1
    # metadata["slugged_url"] = slugged_url
    # with open(meta_path, "w") as f:
    #     json.dump(metadata, f, indent=4)
    # just.write(metadata, meta_path)

    html_path = BASE_PATH + "html/{}_{}.html.gz".format(t1, slugged_url)
    print("html_path", html_path)
    just.write(html, html_path)

    obj = {"path": str(html_path), "url": url, "time": str(time.time())}
    print("META_PATH", META_PATH)
    just.append(obj, META_PATH)

    last.append(html)
    last_urls.append(url)
    return jsonify({"urls": list(last_urls)})


@app.route("/video_watched", methods=["GET", "POST", "OPTIONS"])
@crossdomain(origin="*", headers="Content-Type")
def add_video_watch():
    just.append(request.json, VIDEO_PATH)
    print("video watched")
    return ""


@app.route("/view_cache", methods=["GET", "POST", "OPTIONS"])
@crossdomain(origin="*", headers="Content-Type")
def view_cache():
    filename = request.args.get("filename")
    resp = make_response(current_app.send_static_file(filename))
    resp.headers["Content-Type"] = "text/html"
    resp.headers["Content-Encoding"] = "gzip"
    return resp


@app.route("/list", methods=["GET", "POST", "OPTIONS"])
@crossdomain(origin="*", headers="Content-Type")
def ls():
    keyword = request.args.get("keyword")
    files = os.listdir(BASE_PATH / "html")
    if keyword is not None:
        files = [x for x in files if keyword in x]
    files = files[:500]
    body = "\n".join([f"<a href='/view_cache?filename={x}'>{x}</a></br>" for x in files])
    return "<html><body>{}</body></html>".format(body)


def run_server(host="127.0.0.1", port=21487):
    """ Run nostalgia_chrome which receives pages when visiting a page in Chrome. """
    app.run(host, port)


if __name__ == "__main__":
    run_server()
