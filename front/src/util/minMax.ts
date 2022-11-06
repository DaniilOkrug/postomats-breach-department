export function minmax(data: any[]) {
  data.sort((a, b) => a.score - b.score);
  
  const min = data[0].score;
  const max = data[data.length - 1].score;

  return data.map((item) => {
    return {
      ...item,
      score: (item.score - min) / (max - min),
      realScore: item.score
    };
  });
}
