from typing import List, Tuple
from core.model.defs import Feature, Model
from core.model.permanent import *
import pandas as pd
import numpy as np
import multiprocessing as mp


def distance(a, b, B, R):
    d = np.sqrt((b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2)
    _ = 1 - 1 / (1 + np.exp(1 / B * (R - d)))
    return _

class DistanceFeature(Feature):
    def __init__(self, radius=400, beta=200):
        super().__init__()
        self._R = radius
        self._B = beta

    def _metric(self, a: Tuple[float, float], b: Tuple[float, float]):
        return distance(a, b, self._B, self._R)



class HousesFeature(DistanceFeature):
    def __init__(self, data: pd.DataFrame, radius=400, beta=200):
        super().__init__(radius=radius, beta=beta)
        self._data = data
        self._dataview = data
        self._max = max(1, self._dataview.total_cnt.sum())

    def _calc(self, point: Tuple[float, float], sum=True):
        if len(self._dataview.index) == 0:
            return 0
        _ = self._dataview.apply(lambda x: x['total_cnt'] * self._metric(point, (x['x'], x['y'],)), axis=1)
        return _.sum() if sum else _

    def bound(self, bbox):
        if bbox is not None:
            ul, lb = bbox
            mnx, mny = ul
            mxx, mxy = lb
            self._dataview = self._data[(mnx <= self._data.x) & (self._data.x <= mxx)][(mny <= self._data.y) & (self._data.y <= mxy)]
            self._max = max(1, self._dataview.total_cnt.sum())
        else:
            self._dataview = self._data
            self._max = max(1, self._dataview.total_cnt.sum())


    def impacts(self, points: List[Tuple[float, float]], prev_points: List[Tuple[float, float]] = None):
        with mp.Pool(mp.cpu_count()) as pool:
            p = []
            for point in points:
                p.append(pool.apply_async(self._calc, args=(point,)))
            p = np.array(list(map(lambda x: x.get(), p)))
        return (p / self._max).tolist()

class SimpleDistanceFeature(DistanceFeature):
    def __init__(self, data: pd.DataFrame, radius=400, beta=200):
        super().__init__(radius=radius, beta=beta)
        self._data = data
        self._dataview = data
        self._max = len(self._dataview.index)

    def _calc(self, point: Tuple[float, float], sum=True):
        if len(self._dataview.index) == 0:
            return 0
        _ = self._dataview.apply(lambda x: self._metric(point, (x['x'], x['y'],)), axis=1)
        return _.sum() if sum else _

    def bound(self, bbox):
        if bbox is not None:
            ul, lb = bbox
            mnx, mny = ul
            mxx, mxy = lb
            self._dataview = self._data[(mnx <= self._data.x) & (self._data.x <= mxx)][(mny <= self._data.y) & (self._data.y <= mxy)]
            self._max = len(self._dataview.index)
        else:
            self._dataview = self._data
            self._max = len(self._dataview.index)

    def impacts(self, points: List[Tuple[float, float]], prev_points: List[Tuple[float, float]] = None):
        with mp.Pool(mp.cpu_count()) as pool:
            p = []
            for point in points:
                p.append(pool.apply_async(self._calc, args=(point,)))
            p = np.array(list(map(lambda x: x.get(), p)))
        return ( p / max(self._max, 1) ).tolist()


class PostOfficeFeature(DistanceFeature):
    def __init__(self, data: pd.DataFrame, radius=400, beta=200, C=10):
        super().__init__(radius=radius, beta=beta)
        self._data = data
        self._dataview = data
        self._max = len(self._dataview.index)
        self._C = C
    
    def _calc(self, point: Tuple[float, float], sum=True):
        if len(self._dataview.index) == 0:
            return 0
        _ = self._dataview.apply(lambda x: self._metric(point, (x['x'], x['y'],)), axis=1)
        return _.sum() + self._C if sum else _

    def impacts(self, points: List[Tuple[float, float]], prev_points: List[Tuple[float, float]] = None):
        with mp.Pool(mp.cpu_count()) as pool:
            p = []
            for point in points:
                p.append(pool.apply_async(self._calc, args=(point,)))
            p = np.array(list(map(lambda x: x.get(), p)))
        return (p * np.array(prev_points)).tolist()

class StrictPostOfficeFeature(PostOfficeFeature):
    def __init__(self, data: pd.DataFrame, radius=400, beta=200, C=10, disable_radius=400):
        super().__init__(data=data, C=C, radius=radius, beta=beta)
        self._r = disable_radius

    def _calc(self, point: Tuple[float, float], value: float):
        x, y = point
        in_range = self._dataview.apply(lambda s: np.sqrt((x - s['x']) ** 2 + (y - s['y']) ** 2), axis=1)
        if len(in_range[in_range <= self._r].index) == 0:
            return value
        else: 
            return 0

    def impacts(self, points: List[Tuple[float, float]], prev_points: List[Tuple[float, float]] = None):
        return [self._calc(a, b) for a, b in zip(points, prev_points)]


class CompetitorsPostOfficesModel(Model):
    def __init__(self, R=400, B=200, C=10, W=np.array([1])):
        super().__init__()
        self._features = [
            HousesFeature(pd.read_csv(houses), R, B),
            PostOfficeFeature(pd.read_csv(pickpoint), R, B, C),
            SimpleDistanceFeature(pd.read_csv(metro), R, B),
            SimpleDistanceFeature(pd.read_csv(domestic_services), R, B),
            SimpleDistanceFeature(pd.read_csv(kiosks), R, B),
            SimpleDistanceFeature(pd.read_csv(libs), R, B),
            SimpleDistanceFeature(pd.read_csv(paper_kiosks), R, B),
            SimpleDistanceFeature(pd.read_csv(sport), R, B),
            SimpleDistanceFeature(pd.read_csv(stationary), R, B),
            SimpleDistanceFeature(pd.read_csv(technoparks), R, B),
            SimpleDistanceFeature(pd.read_csv(cultural_houses), R, B),
            SimpleDistanceFeature(pd.read_csv(markets), R, B),
            SimpleDistanceFeature(pd.read_csv(mfc), R, B),
        ] 
        self.W = np.array([1 / len(self._features)])

    
    def impacts(self, points: List[Tuple[float, float]], prev_points: List[Tuple[float, float]] = None): 
         return np.sum(self.W * np.array(super().impacts(points)[1:]), axis=0)

class DenyPostOfficesModel(Model):
    def __init__(self, po: pd.DataFrame, R=400, B=200, C=10, r=400, W=np.array([1])):
        super().__init__()
        post_offices = pd.concat([po, pd.read_csv(pickpoint)[['x', 'y']]])
        self._features = [
            HousesFeature(pd.read_csv(houses), R, B),
            SimpleDistanceFeature(pd.read_csv(metro), R, B),
            SimpleDistanceFeature(pd.read_csv(domestic_services), R, B),
            SimpleDistanceFeature(pd.read_csv(kiosks), R, B),
            SimpleDistanceFeature(pd.read_csv(libs), R, B),
            SimpleDistanceFeature(pd.read_csv(paper_kiosks), R, B),
            SimpleDistanceFeature(pd.read_csv(sport), R, B),
            SimpleDistanceFeature(pd.read_csv(stationary), R, B),
            SimpleDistanceFeature(pd.read_csv(technoparks), R, B),
            SimpleDistanceFeature(pd.read_csv(cultural_houses), R, B),
            SimpleDistanceFeature(pd.read_csv(markets), R, B),
            SimpleDistanceFeature(pd.read_csv(mfc), R, B),
            PostOfficeFeature(post_offices, R, B, C),
            StrictPostOfficeFeature(post_offices, R, B, C, r),
        ] 
        self.W = np.array([1 / len(self._features)])

    
    def impacts(self, points: List[Tuple[float, float]], prev_points: List[Tuple[float, float]] = None): 
         impacts = np.sum(self.W * np.array(super().impacts(points)[:-2]), axis=0)
         impacts = self._features[-2].impacts(points, prev_points=impacts)  # apply offices
         impacts = self._features[-1].impacts(points, prev_points=impacts)  # 0 if office is close enough
         return impacts



class OnlyDistanceModel(Model):
    def __init__(self, R=400, B=200, W=np.array([1])):
        super().__init__()
        self._features = [
            HousesFeature(pd.read_csv(houses), R, B),
            SimpleDistanceFeature(pd.read_csv(metro), R, B),
            SimpleDistanceFeature(pd.read_csv(domestic_services), R, B),
            SimpleDistanceFeature(pd.read_csv(kiosks), R, B),
            SimpleDistanceFeature(pd.read_csv(libs), R, B),
            SimpleDistanceFeature(pd.read_csv(paper_kiosks), R, B),
            SimpleDistanceFeature(pd.read_csv(sport), R, B),
            SimpleDistanceFeature(pd.read_csv(stationary), R, B),
            SimpleDistanceFeature(pd.read_csv(technoparks), R, B),
            SimpleDistanceFeature(pd.read_csv(cultural_houses), R, B),
            SimpleDistanceFeature(pd.read_csv(markets), R, B),
            SimpleDistanceFeature(pd.read_csv(mfc), R, B),
        ] 
        self.W = np.array([1 / len(self._features)])

    def impacts(self, points: List[Tuple[float, float]], prev_points: List[Tuple[float, float]] = None): 
         return np.sum(self.W * np.array(super().impacts(points)), axis=0)