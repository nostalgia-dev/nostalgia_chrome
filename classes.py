from datetime import datetime
from dateutil.relativedelta import relativedelta
from metadate import parse_date as _parse_date


class Time:
    def __init__(self, start, end=None, **rd_args):
        self._start = start
        self._end = end or start
        self.rd_args = rd_args

    @property
    def rd(self):
        return relativedelta(**self.rd_args)

    @property
    def start(self):
        return self._start - self.rd

    @property
    def end(self):
        return self._end + self.rd

    @classmethod
    def from_md(cls, text, **rd_args):
        md = _parse_date(text)
        if md is None:
            return None
        return cls(md.start_date, md.end_date, **rd_args)

    @classmethod
    def from_epoch(cls, integer, **rd_args):
        tmp = datetime.fromtimestamp(integer)
        return cls(tmp, **rd_args)

    @classmethod
    def from_dt(cls, dt, **rd_args):
        return cls(dt, **rd_args)
