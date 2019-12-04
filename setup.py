from setuptools import setup
from setuptools import find_packages

with open("README.md") as f:
    LONG_DESCRIPTION = f.read()
MAJOR_VERSION = "0"
MINOR_VERSION = "0"
MICRO_VERSION = "7"
VERSION = "{}.{}.{}".format(MAJOR_VERSION, MINOR_VERSION, MICRO_VERSION)

install_requires = ["lxml", "flask", "fire"]

setup(
    name="nostalgia_chrome",
    version=VERSION,
    description="Self tracking your online life!",
    long_description=LONG_DESCRIPTION,
    long_description_content_type="text/markdown",
    url="https://github.com/nostalgia-dev/nostalgia_chrome",
    author="Pascal van Kooten",
    author_email="kootenpv@gmail.com",
    license="MIT",
    entry_points={"console_scripts": ["nostalgia_chrome = nostalgia_chrome.__main__:_main"]},
    classifiers=[
        "Environment :: Console",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Operating System :: Microsoft",
        "Operating System :: MacOS :: MacOS X",
        "Operating System :: Unix",
        "Operating System :: POSIX",
        "Programming Language :: Python",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.4",
        "Programming Language :: Python :: 3.5",
        "Programming Language :: Python :: 3.6",
        "Programming Language :: Python :: 3.7",
        "Topic :: Software Development",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Topic :: Utilities",
    ],
    packages=find_packages(),
    requires_python=">=3.4.0",
    zip_safe=False,
    platforms="any",
)
