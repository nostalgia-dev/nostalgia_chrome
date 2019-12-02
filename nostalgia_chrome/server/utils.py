import lxml.html
from bs4 import UnicodeDammit


def make_tree(html, domain=None):

    ud = UnicodeDammit(html, is_html=True)

    tree = lxml.html.fromstring(ud.unicode_markup)

    if domain is not None:
        tree.make_links_absolute(domain)

    for el in tree.iter():

        # remove comments
        if isinstance(el, lxml.html.HtmlComment):
            el.getparent().remove(el)
            continue

        if el.tag == 'script' and el.attrib.get("type") != "application/ld+json":
            el.getparent().remove(el)
            continue

    return tree
