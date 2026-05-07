import logging
import sys
from app.core.config import settings

#Este archivo se encarga de centralizar en un solo lugar toda la lógica relacionada con los log
#Los logs son los mensajes que vemos en la términal, en lugar de usar print usamos logs
#Establece un formato único para los logs de la applicación


LOG_LEVEL = logging.DEBUG if settings.DEBUG else logging.INFO

logging.basicConfig(
    level=LOG_LEVEL,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[logging.StreamHandler(sys.stdout)],
)

logger = logging.getLogger(settings.APP_NAME)