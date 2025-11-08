
from .mod import Mod
c = Mod() 
def run( *args, **kwargs):
    """
    Main function to run the mod
    """
    c.mod('cli')().forward()