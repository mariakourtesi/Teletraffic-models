import { numberOfDigitsAfterDecimal } from '../../constants';

interface serviceClasssesRamCapacity {
  serviceClass: number;
  bu: number;
}

export interface TrafficLoad {
  [key: string]: number;
}

export const calculateTrafficLoad = (
  initialTrafficLoad: number,
  ramCapacity: number,
  serviceClassses: serviceClasssesRamCapacity[]
): TrafficLoad => {
  const result: TrafficLoad = {};
  const totalServiceClasses = serviceClassses.length;

  const adjustedTrafficLoad = (initialTrafficLoad * ramCapacity) / totalServiceClasses;

  serviceClassses.forEach((serviceClass) => {
    result[`${serviceClass.serviceClass}`] = parseFloat(
      (adjustedTrafficLoad / serviceClass.bu).toFixed(numberOfDigitsAfterDecimal)
    );
  });

  return result;
};
