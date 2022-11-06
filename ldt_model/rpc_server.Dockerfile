FROM python:3.8 as deps
COPY requirements.txt ./
RUN ["pip", "install", "-r", "requirements.txt"]


FROM deps as prepare 
WORKDIR /app/
COPY ./ ./
RUN ["python", "-m", "grpc_tools.protoc", "-I/app/", "--python_out=.", "--grpc_python_out=.", "/app/rpc/model/model.proto"]
RUN ["python", "-m", "grpc_tools.protoc", "-I/app/", "--python_out=.", "--grpc_python_out=.", "/app/rpc/util/util.proto"]
RUN ["python", "-m", "grpc_tools.protoc", "-I/app/", "--python_out=.", "--grpc_python_out=.", "/app/rpc/common.proto"]
CMD ["python", "rpc_server.py"]

