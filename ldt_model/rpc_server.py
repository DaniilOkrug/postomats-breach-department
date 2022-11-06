import sys
from rpc.model import model_pb2_grpc, server as model_server
from rpc.util import util_pb2_grpc, server as util_server
import grpc

if __name__ == '__main__':
    from concurrent import futures
    import multiprocessing as mp

    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    else:
        port = 3110

    server = grpc.server(futures.ThreadPoolExecutor(max_workers=mp.cpu_count()))
    model_pb2_grpc.add_ModelServicer_to_server(model_server.ModelHandler(), server)
    util_pb2_grpc.add_TransformLocationServicer_to_server(util_server.UtilHandler(), server)

    server.add_insecure_port(f"0.0.0.0:{port}")
    server.start()
    try:
        server.wait_for_termination()
    except KeyboardInterrupt:
        server.stop(True)