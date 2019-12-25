from datetime import datetime
import shutil
import os
import platform


def chrome_history_path(beta=False):
    if platform.system() == "Windows":
        beta = " Beta" if beta else ""
        if platform.release() == "XP":
            user_path = (
                "~/Local Settings/Application Data/Google/Chrome{}/User Data/Default/history"
            )
        else:
            user_path = "~/AppData/Local/Google{}/Chrome{}/User Data/Default/history"
    elif platform.system() == "Linux":
        beta = "-beta" if beta else ""
        user_path = "~/.config/google-chrome{}/Default/History".format(beta)
    elif platform.system() == "Darwin":
        beta = " Beta" if beta else ""
        user_path = "~/Library/Application Support/Google/Chrome{}/Default/history"
    else:
        raise OSError("Not sure of a path for your system")
    user_path = user_path.format(beta)
    # The Chrome default profile folder default locations are:

    # WinXP: [userdir]\Local Settings\Application Data\Google\Chrome\User Data\Default
    # Vista/7/8: [userdir]\AppData\Local\Google\Chrome\User Data\Default
    # Linux: [userdir]/.config/google-chrome/Default
    # OS X: [userdir]/Library/Application Support/Google/Chrome/Default
    # iOS: \Applications\com.google.chrome.ios\Library\Application Support\Google\Chrome\Default
    # Android: /userdata/data/com.android.chrome/app_chrome/Default

    return os.path.expanduser(user_path)


def backup_history(base="~/nostalgia_data_chrome", beta=False):
    """ Copies the Chrome History sqlite to a safe location """
    chp = chrome_history_path(beta)
    target = os.path.expanduser(
        os.path.join(base, "sqlite/{}_history".format(datetime.now().date()))
    )
    shutil._ensure_directory(target)
    shutil.copy2(chp, target)
    latest = os.path.expanduser(os.path.join(base, "sqlite/latest"))
    os.symlink(target, latest)
