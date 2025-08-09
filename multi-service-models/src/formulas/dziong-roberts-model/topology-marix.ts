
import { networkTopology } from '../types';

export const  topologyMatrix = (topology: readonly networkTopology[]) => {
  const links = topology.map(item => item.bu);
  const indices: number[] = Array(links.length).fill(0);
  const groupedStates: Record<number, number[][]> = {};

  function getGroupKey(indexArr: number[]): number {
    for (let i = 0; i < indexArr.length; i++) {
      if (indexArr[i] !== 0) return i;
    }
    return 0;
  }

  let current: number[] = [...indices];
  let key: number = getGroupKey(current);
  groupedStates[key] = groupedStates[key] || [];
  groupedStates[key].push([...current]);

  while (true) {
    let level = links.length - 1;

    while (level >= 0) {
      indices[level]++;
      if (indices[level] <= links[level]) break;

      indices[level] = 0;
      level--;
    }

    if (level < 0) break;

    current = [...indices];
    key = getGroupKey(current);
    groupedStates[key] = groupedStates[key] || [];
    groupedStates[key].push([...current]);
  }

  return groupedStates;
}
