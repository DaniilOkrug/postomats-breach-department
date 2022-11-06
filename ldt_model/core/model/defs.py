from typing import List, Tuple
import multiprocessing as mp

import numpy as np


class Feature:
    name = "Feature"
    verbose_name = ""
    feature_description = ""

    def __init__(self): ...

    def impacts(self, points: List[Tuple[float, float]], prev_points: List[Tuple[float, float]] = None):
        return []

    def bound(self, bbox: Tuple[Tuple[float, float], Tuple[float, float]] = None): ...


class LogFeature(Feature):
    _feature: Feature = None

    def __init__(self, feature):
        super().__init__()
        self._feature = feature

    def impacts(self, points: List[Tuple[float, float]], prev_points: List[Tuple[float, float]] = None):
        return np.log(self._feature.impacts(points))

    def bound(self, bbox: Tuple[Tuple[float, float], Tuple[float, float]] = None):
        return self._feature.bound(bbox)


class SqrtFeature(Feature):
    _feature: Feature = None

    def __init__(self, feature):
        super().__init__()
        self._feature = feature

    def impacts(self, points: List[Tuple[float, float]], prev_points: List[Tuple[float, float]] = None):
        return np.sqrt(self._feature.impacts(points))

    def bound(self, bbox: Tuple[Tuple[float, float], Tuple[float, float]] = None):
        return self._feature.bound(bbox)



class Model(Feature):
    def __init__(self):
        super().__init__()
        self._features: List[Feature] = []
    
    def impacts(self, points: List[Tuple[float, float]], prev_points: List[Tuple[float, float]] = None):
        predictions = []
        for feature in self._features:
            impact = feature.impacts(points, predictions[-1] if len(predictions) > 0 else None)
            predictions.append(impact)
        return predictions


    def bound(self, bbox: Tuple[Tuple[float, float], Tuple[float, float]] = None):
        for feature in self._features:
            feature.bound(bbox)
