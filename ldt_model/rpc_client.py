import sys

import numpy as np

from rpc.util import util_pb2_grpc
from rpc.model import model_pb2_grpc, model_pb2
from rpc import common_pb2 as pb2
import grpc

if __name__ == "__main__":
    addr = "127.0.0.1:3110"

    if len(sys.argv) > 1:
        addr = sys.argv[1]

    model_stub = model_pb2_grpc.ModelStub(grpc.insecure_channel(addr))
    util_stub = util_pb2_grpc.TransformLocationStub(grpc.insecure_channel(addr))
    
    minx, miny = (4178288.14265238, 7507968.063278431)
    maxx, maxy = (4186593.912499447, 7513727.767554827)


    mesh = np.meshgrid(np.linspace(minx, maxx, 5), np.linspace(miny, miny, 5))
    grid = np.dstack(mesh).reshape(-1, 2)
    
    model_stub.NewModel(model_pb2.ModelInitialization(
        model=model_pb2.Models.DENY_IF_POSTOFFICE_NEARBY,
        R=400,
        B=200,
        C=10,
        R2=100,
        already_deployed=[pb2.XY(x=minx, y=miny)],
    ))

    model_response_1 = model_stub.Assess(model_pb2.AssessRequest(points=list(map(lambda t: pb2.XY(x=t[0], y=t[1]), grid))))

    for x in model_response_1.score:
        assert isinstance(x, float)

    x, y = 4153053.461242925, 7468800.405925884
  
    model_response_2 = model_stub.AssessInBounds(model_pb2.InBounds(
        bounds=model_pb2.BBox(
                upper_left=pb2.XY(x=minx, y=miny), 
                bottom_right=pb2.XY(x=maxx, y=maxy)),
        points=list(map(lambda t: pb2.XY(x=t[0], y=t[1]), grid))
    ))

    for x in model_response_2.score:
        assert isinstance(x, float)

    
    lat_long_response = util_stub.ToLatitudeLongitude(
        pb2.XY(x=x, y=y)
    )

    assert isinstance(lat_long_response.lat, float)
    assert isinstance(lat_long_response.lon, float)

    xy_response = util_stub.ToXY(pb2.LatitudeLongitude(
        lat=lat_long_response.lat,
        lon=lat_long_response.lon
    ))

    assert isinstance(xy_response.x, float)
    assert abs(xy_response.x - x) < 1
    assert isinstance(xy_response.y, float)
    assert abs(xy_response.y - y) < 1

    print("test passed.")

