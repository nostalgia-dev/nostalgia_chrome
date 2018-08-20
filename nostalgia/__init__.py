import sys
from nostalgia.server.app import run_server

__project__ = "nostalgia"
__version__ = "0.0.1"
__repo__ = "https://github.com/kootenpv/nostalgia"


def print_version():
    """ Prints the current version of nostalgia, and more """
    sv = sys.version_info
    py_version = "{}.{}.{}".format(sv.major, sv.minor, sv.micro)
    version_parts = __version__.split(".")
    s = "{} version: [{}], Python {}".format(__project__, __version__, py_version)
    s += "\nMajor version: {}  (breaking changes)".format(version_parts[0])
    s += "\nMinor version: {}  (extra feature)".format(version_parts[1])
    s += "\nMicro version: {} (commit count)".format(version_parts[2])
    s += "\nFind out the most recent version at {}".format(__repo__)
    return s
