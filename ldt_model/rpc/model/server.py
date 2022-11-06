import rpc.model.model_pb2_grpc as pb2_grpc
import rpc.model.model_pb2 as pb2
import core.model.model as mdl
import pandas as pd

class ModelHandler(pb2_grpc.ModelServicer):
    def __init__(self):
        super(ModelHandler, self).__init__()
        self._model = None

    def NewModel(self, request, context):
        if request.model == pb2.Models.ONLY_DISTANCES_MODEL:
            self._model = mdl.OnlyDistanceModel(R=request.R, B=request.B)
        elif request.model == pb2.Models.POSTOFFICES_AS_COEFFS:
            self._model = mdl.CompetitorsPostOfficesModel(R=request.R, B=request.B, C=request.C)
        elif request.model == pb2.Models.DENY_IF_POSTOFFICE_NEARBY:
            self._model = mdl.DenyPostOfficesModel(
                pd.DataFrame({
                    'x': list(map(lambda x: x.x, request.already_deployed)),
                    'y': list(map(lambda x: x.y, request.already_deployed)),
                }),
                R=request.R, 
                B=request.B, 
                C=request.C, 
                r=request.R2
            )
        else:
            return pb2.NewModelResponse(status=False)
        return pb2.NewModelResponse(status=True)

    def Assess(self, request, context):
        self._model.bound(None)
        points = list(map(lambda t: (t.x, t.y,), request.points))
        answers = self._model.impacts(points)
        print(answers)
        return pb2.Assessment(score=answers)
    
    def AssessInBounds(self, request, context):
        ul, br = request.bounds.upper_left, request.bounds.bottom_right,
        self._model.bound(((ul.x, ul.y,), (br.x, br.y,),))
        points = list(map(lambda t: (t.x, t.y,), request.points))
        answers = self._model.impacts(points)
        return pb2.Assessment(score=answers)