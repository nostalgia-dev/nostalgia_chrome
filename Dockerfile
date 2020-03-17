FROM python

RUN mkdir /nostalgia_chrome

WORKDIR /nostalgia_chrome

COPY . /nostalgia_chrome

RUN pip install /nostalgia_chrome

ENTRYPOINT ["nostalgia_chrome", "run_server" ]
