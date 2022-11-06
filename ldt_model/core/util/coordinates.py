from pyproj import Transformer


def to_xy(lat, lon):
    return Transformer.from_crs("epsg:4326", "epsg:3857").transform(lat, lon)


def to_lat_log(x, y):
    return Transformer.from_crs("epsg:3857", "epsg:4326").transform(x, y)