export type pointResponse = {
  id: number;
  point: {
    lat: number;
    long: number;
  };
  regionId: number | null;
  type: string;
  score: number;
};
