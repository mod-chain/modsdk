from .core.mod import Mod
_mod = Mod()
for fn in dir(Mod()):
    globals()[fn] = getattr(_mod, fn)