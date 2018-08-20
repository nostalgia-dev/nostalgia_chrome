from nostalgia.server.app import run_server
from nostalgia.store_backup import backup_history
from nostalgia import print_version


def _main():
    import fire as _fire

    _fire.Fire()
