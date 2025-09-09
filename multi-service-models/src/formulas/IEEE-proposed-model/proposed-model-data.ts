import {
  calculateBlockingLAR,
  calculateBlockingRatios,
  calculateEi,
  calculateSubsystemBlockingKaufmanRoberts,
  processResultInRLA
} from './proposed-model';
import { calculateTrafficLoad, TrafficLoad } from './traffic-load';
import { Capacities, ServiceClassConfigs } from './types';

//   ram: [
//     {
//       serviceClass: 1,
//       incomingLoad_a: 0,
//       bu: 1
//     },
//     {
//       serviceClass: 2,
//       incomingLoad_a: 0,
//       bu: 2
//     },
//     {
//       serviceClass: 3,
//       incomingLoad_a: 0,
//       bu: 3
//     }
//   ],
//   processor: [
//     {
//       serviceClass: 1,
//       incomingLoad_a: 0,
//       bu: 1
//     },
//     {
//       serviceClass: 2,
//       incomingLoad_a: 0,
//       bu: 2
//     },
//     {
//       serviceClass: 3,
//       incomingLoad_a: 0,
//       bu: 3
//     }
//   ],
//   disk: [
//     {
//       serviceClass: 1,
//       incomingLoad_a: 0,
//       bu: 1
//     },
//     {
//       serviceClass: 2,
//       incomingLoad_a: 0,
//       bu: 2
//     },
//     {
//       serviceClass: 3,
//       incomingLoad_a: 0,
//       bu: 3
//     }
//   ],
//   bitrate: [
//     {
//       serviceClass: 1,
//       incomingLoad_a: 0,
//       bu: 2
//     },
//     {
//       serviceClass: 2,
//       incomingLoad_a: 0,
//       bu: 2
//     },
//     {
//       serviceClass: 3,
//       incomingLoad_a: 0,
//       bu: 2
//     }
//   ]
// };
const calculateSeviceClassesForRLA = (serviceClassConfigs: ServiceClassConfigs) => {
  return Object.values(serviceClassConfigs.ram).map((ramEntry) => {
    const serviceClass = ramEntry.serviceClass;

    const route = Object.keys(serviceClassConfigs).map((key, index) => ({
      link: index + 1,
      bu:
        serviceClassConfigs[key as keyof ServiceClassConfigs].find(
          (config) => config.serviceClass === serviceClass
        )?.bu || 0
    }));

    return {
      serviceClass,
      incomingLoad_a: ramEntry.incomingLoad_a,
      route
    };
  });
};

export const proposedModel = (
  resourceCount: number,
  capacities: Capacities,
  initialLoad: number,
  serviceClasses: ServiceClassConfigs
) => {
  const startTime = performance.now();

  const trafficLoad = calculateTrafficLoad(
    initialLoad,
    capacities.ramCapacity.bu,
    serviceClasses.ram
  );

  Object.keys(serviceClasses).forEach((category) => {
    const key = category as keyof ServiceClassConfigs;
    serviceClasses[key].forEach((item) => {
      if (trafficLoad[item.serviceClass] !== undefined) {
        item.incomingLoad_a = trafficLoad[item.serviceClass];
      }
    });
  });

  const kaufmanRoberts = calculateSubsystemBlockingKaufmanRoberts(capacities, serviceClasses);

  console.log('kaufman', kaufmanRoberts);

  const serviceClassConfigsLAR = {
    ram: serviceClasses.ram.map((item) => ({
      ...item,
      incomingLoad_a: item.incomingLoad_a * 3
    })),
    processor: serviceClasses.processor.map((item) => ({
      ...item,
      incomingLoad_a: item.incomingLoad_a * 3
    })),
    disk: serviceClasses.disk.map((item) => ({
      ...item,
      incomingLoad_a: item.incomingLoad_a * 3
    })),
    bitrate: (serviceClasses.bitrate ?? []).map((item) => ({
      ...item,
      incomingLoad_a: item.incomingLoad_a * 3
    }))
  };

  const lar = calculateBlockingLAR(resourceCount, capacities, serviceClassConfigsLAR);

  const relationR = calculateBlockingRatios(kaufmanRoberts, lar);

  const serviceClassesinRLA = calculateSeviceClassesForRLA(serviceClasses);

  const reducedLoadApproximation = processResultInRLA(capacities, serviceClassesinRLA);

  const Ei = calculateEi(relationR, reducedLoadApproximation);

  // console.log(
  //   `Time taken to execute proposed model: ${performance.now() - startTime} milliseconds`
  // );
  return Ei;
};

//1.11, 1.12, 1.13, 1.2, 1.3
//0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.11, 1.12, 1.13, 1.2, 1.3
//, 6, 7, 8, 9, 10, 11, 12, 13
// [0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3].forEach((initialLoad) => {
//   console.log('initialLoad', initialLoad);
// console.log(
//   //     `model Results=${initialLoad}`,
//   proposedModel(resourceCount, capacities, 0.9, serviceClassConfigs)
// );

// });
