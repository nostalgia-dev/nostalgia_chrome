from nostalgia_chrome.server.app import run_server
from nostalgia_chrome.store_backup import backup_history
from nostalgia_chrome import print_version


def _main():
    import fire as _fire

    _fire.Fire()
