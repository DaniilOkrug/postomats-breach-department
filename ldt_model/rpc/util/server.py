from core.util.coordinates import to_xy, to_lat_log

# import rpc.util.util_pb2 as pb2
import rpc.common_pb2 as pb2
import rpc.util.util_pb2_grpc as pb2_grpc


class UtilHandler(pb2_grpc.TransformLocationServicer):
    def __init__(self):
        super(UtilHandler, self).__init__()

    def ToXY(self, request, context):
        x, y = to_xy(request.lat, request.lon)
        return pb2.XY(x=x, y=y)

    def ToLatitudeLongitude(self, request, context):
        lat, lon = to_lat_log(request.x, request.y)
        return pb2.LatitudeLongitude(lat=lat, lon=lon)

