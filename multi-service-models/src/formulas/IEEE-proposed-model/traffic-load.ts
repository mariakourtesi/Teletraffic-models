import { numberOfDigitsAfterDecimal } from '../../constants';

interface serviceClasssesRamCapacity {
  serviceClass: number;
  ramCapacity: number;
}

interface TrafficLoad {
  [key: string]: number;
}

export const calculateTrafficLoad = (
  initialTrafficLoad: number,
  ramCapacity: number,
  serviceClassses: serviceClasssesRamCapacity[]
): TrafficLoad => {
  const result: TrafficLoad = {};
  const totalServiceClasses = serviceClassses.length;

  console.log('totalServiceClasses', totalServiceClasses);
  const adjustedTrafficLoad = (initialTrafficLoad * ramCapacity) / totalServiceClasses;

  serviceClassses.forEach((serviceClass) => {
    result[`traffic_load_a_${serviceClass.serviceClass}`] = parseFloat(
      (adjustedTrafficLoad / serviceClass.ramCapacity).toFixed(numberOfDigitsAfterDecimal)
    );
  });

  return result;
};
