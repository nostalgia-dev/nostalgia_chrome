from multiprocessing import Pool

import just
from auto_extract import parse_article

pool = Pool(4)

# extracts = pool.map(extruct.extract, file_contents)


data = just.multi_read("~/.nostalgia_chrome/html/*.json")
file_names, file_contents = data.keys(), data.values()


def extract_and_save(args):
    file_name, file_content = args
    url = file_content["url"]
    html = file_content["html"]
    parsed = parse_article(html, url)
    just.write(parsed, "~/.nostalgia_chrome/metadata/" + file_name.split("/")[-1])


zz = [extract_and_save(x) for x in zip(file_names, file_contents)]

z = pool.map(extract_and_save, zip(file_names, file_contents))


def recurser(obj, contain_str, container, parent=None):
    if isinstance(obj, dict):
        for k, v in obj.items():
            if contain_str in k:
                container.append(((k, v), parent))
                print(k, v)
            recurser(v, contain_str, container, obj)
    if isinstance(obj, list):
        for x in obj:
            recurser(x, contain_str, container, obj)
    if isinstance(obj, str):
        if contain_str in obj and len(obj) < 100:
            container.append((obj, parent))
            print(obj)
