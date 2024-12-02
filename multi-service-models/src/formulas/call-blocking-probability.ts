import { ServiceClass, ServiceClassWithBR } from '../types';
import { kaufmanRoberts } from './kaufman-roberts-formula';
import { robertsFormulaBRPolicy } from './roberts-formula-br-policy';

function isServiceClassWithBR(obj: ServiceClass | ServiceClassWithBR): obj is ServiceClassWithBR {
  return (obj as ServiceClassWithBR).tk !== undefined;
}

export const callBlockingProbability = (
  capacity: number,
  serviceClasses: ServiceClass[] | ServiceClassWithBR[]
) => {
  let probabilityValues;
  const BRpolicy = isServiceClassWithBR(serviceClasses[0]);

  if (!BRpolicy) {
    probabilityValues = kaufmanRoberts(capacity, serviceClasses);
  }

  probabilityValues = robertsFormulaBRPolicy(capacity, serviceClasses as ServiceClassWithBR[]);

  const result: { [key: string]: string } = {};

  serviceClasses.forEach((serviceClass, index) => {
    const requested_bu = serviceClass.bu;
    const tk = (serviceClass as ServiceClassWithBR).tk || 0;
    let cbp = 0;

    for (let j = capacity - requested_bu - tk + 1; j <= capacity; j++) {
      const q_j = probabilityValues[`q(${j})`] || 0;
      cbp += q_j;
    }

    result[`B_class_${index + 1}`] = `${(cbp * 100).toFixed(5)}%`;
  });

  return result;
};
