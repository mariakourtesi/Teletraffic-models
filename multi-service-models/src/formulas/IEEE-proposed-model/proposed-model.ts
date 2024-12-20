import { networkTopology, ServiceClassWithRoute } from '../types';
import { numberOfDigitsAfterDecimal } from '../normalise-probabilities';
import { callBlockingProbability } from '../kaufman-roberts/call-blocking-probability';
import {blockingProbabilityLAR} from '../limited-available-resources-model/blocking-probability';
import {  callBlockingProbabilityinRLAForProposedModel } from '../reduced-load-approximation/reduced-load-approximation';


interface ServiceClass {
  serviceClass: number;
  incomingLoad_a: number;
  bu: number;
}

interface Capacities {
  ramCapacity: number;
  processorCapacity: number;
  diskCapacity: number;
  bpsCapacity: number;
}

interface ServiceClassConfigs {
  serviceClasses: ServiceClass[];
  serviceClassesBitrate: ServiceClass[];
}

// Step 1: Calculate the blocking probabilities for each subsystem using the Kaufman-Roberts model
export const calculateSubsystemBlockingKaufmanRoberts = (
  capacities: Capacities,
  serviceClassConfigs: ServiceClassConfigs
)  => {
  const { ramCapacity, processorCapacity, diskCapacity, bpsCapacity } = capacities;

  const { serviceClasses, serviceClassesBitrate } = serviceClassConfigs;

  const ramSubsystem = callBlockingProbability(ramCapacity, serviceClasses);
  const processorSubsystem = callBlockingProbability(processorCapacity, serviceClasses);
  const diskSubsystem = callBlockingProbability(diskCapacity, serviceClasses);
  const bitrateSubsystem = callBlockingProbability(bpsCapacity, serviceClassesBitrate);

  return {
    RAM: ramSubsystem,
    Processor: processorSubsystem, 
    Disk: diskSubsystem,
    Bps: bitrateSubsystem
  };
};

// Step 2: Calculate the blocking probabilities using the Limited Available Resources modelb(LAR)
export const calculateBlockingLAR = (
  resourcesCount: number,
  capacities: Capacities,
  serviceClassConfigs: ServiceClassConfigs) => {

  const { ramCapacity, processorCapacity, diskCapacity, bpsCapacity } = capacities;
  const { serviceClasses, serviceClassesBitrate } = serviceClassConfigs;

  const ramSubsystem = blockingProbabilityLAR(resourcesCount, ramCapacity, serviceClasses);
  const processorSubsystem = blockingProbabilityLAR(resourcesCount, processorCapacity, serviceClasses);
  const diskSubsystem = blockingProbabilityLAR(resourcesCount, diskCapacity, serviceClasses);
  const bitrateSubsystem = blockingProbabilityLAR(resourcesCount, bpsCapacity, serviceClassesBitrate);

  return {
    RAM: ramSubsystem,
    Processor: processorSubsystem,
    Disk: diskSubsystem,
    Bps: bitrateSubsystem
  };
};



// Step 3: Calculate the relation R between the blocking probabilities of the Kaufman-Roberts model and the LAR model
type BlockingRatios = { [key: string]: { [key: string]: string } };

export const calculateBlockingRatios = (
  kaufmanRoberts: BlockingRatios,
  lar: BlockingRatios
): BlockingRatios => {
  const result: BlockingRatios = {};

  for (const subsystem in kaufmanRoberts) {
    if (kaufmanRoberts.hasOwnProperty(subsystem) && lar.hasOwnProperty(subsystem)) {
      const krValues = kaufmanRoberts[subsystem];
      const larValues = lar[subsystem];

      result[subsystem] = {};

      // Iterate through classes (B_class_1)
      for (const className in krValues) {
        if (krValues.hasOwnProperty(className)) {
          const krValue = parseFloat(krValues[className]); 
          const larKey = className.replace('B_class_', 'E_class_'); 
          const larValue = parseFloat(larValues[larKey]);

          
          if (!isNaN(krValue) && !isNaN(larValue)) {
            result[subsystem][className] = larValue !== 0 
              ? ( larValue/ krValue ).toFixed(numberOfDigitsAfterDecimal) 
              : 'Infinity';
          } else {
            result[subsystem][className] = 'NaN';
          }
        }
      }
    }
  }

  return result;
};

// Step 4: Apply the RLA model to calculate the blocking probability

const enum Subsystem {
  'link1' = 'RAM',
  'link2' = 'Processor',
  'link3' = 'Disk',
  'link4' = 'Bps'
}

export const processResultInRLA = (
  links: networkTopology[],
  serviceClasses: ServiceClassWithRoute[]
): BlockingRatios => {
  const rla = callBlockingProbabilityinRLAForProposedModel(links, serviceClasses);
  const result = {
    RAM: {} as { [key: string]: string },
    Processor: {} as { [key: string]: string },
    Disk: {} as { [key: string]: string },
    Bps: {} as { [key: string]: string },
  };

  rla.forEach((entry) => {
    const [key, value] = entry.split(':').map((str) => str.trim());

    // Determine the subsystem and class
    let subsystem: keyof typeof result;
    if (key.startsWith('V_link1')) {
      subsystem = 'RAM';
    } else if (key.startsWith('V_link2')) {
      subsystem = 'Processor';
    } else if (key.startsWith('V_link3')) {
      subsystem = 'Disk';
    } else if (key.startsWith('V_link4')) {
      subsystem = 'Bps';
    } else {
      return; 
    }

  
    const classMatch = key.match(/class_(\d+)/);
    if (classMatch) {
      const classKey = `B_class_${classMatch[1]}`; // Format as "B_class_X"
      result[subsystem][classKey] = value; // Assign the value as a string
    }
  });

  return result;
};

// Step 5: Determine the blocking probabilities in the cloud for each service class

export const calculateEi = (
  relationR: BlockingRatios,
  reducedLoadApproximation: BlockingRatios
): { [key: string]: number } => {
  const subsystems = ['RAM', 'Processor', 'Disk', 'Bps'] as const;
  const result: { [key: string]: number } = {};

  // Assume all classes are the same across subsystems
  const classes = Object.keys(relationR.RAM);

  classes.forEach((classKey) => {
    // Multiply values for each subsystem and class
    const multiplications = subsystems.map((subsystem) => {
      const relRValue = parseFloat(relationR[subsystem][classKey]);
      const rlaValue = parseFloat(reducedLoadApproximation[subsystem][classKey]);
      return relRValue * rlaValue; 
    });

    // Calculate Ei for this class
    const Ei = 1 - multiplications.reduce((product, value) => product * (1 - value), 1);
    result[classKey] = +Ei.toFixed(numberOfDigitsAfterDecimal); 
  });

  return result;
};


// data for testing
const capacities: Capacities = {
  ramCapacity: 10,
  processorCapacity: 12,
  diskCapacity: 11,
  bpsCapacity: 10
};

const serviceClassConfigsKaufmanRoberts: ServiceClassConfigs = {
  serviceClasses: [
    {
      serviceClass: 1,
      incomingLoad_a: 3,
      bu: 1
    },
    {
      serviceClass: 2,
      incomingLoad_a: 1.5,
      bu: 2
    },
    {
      serviceClass: 3,
      incomingLoad_a: 1,
      bu: 3
    }
  ],
  serviceClassesBitrate: [
    {
      serviceClass: 1,
      incomingLoad_a: 3,
      bu: 2
    },
    {
      serviceClass: 2,
      incomingLoad_a: 1.5,
      bu: 2
    },
    {
      serviceClass: 3,
      incomingLoad_a: 1,
      bu: 2
    }
  ]
};

const serviceClassConfigsLAR: ServiceClassConfigs = {
  serviceClasses: [
    {
      serviceClass: 1,
      incomingLoad_a: 9,
      bu: 1
    },
    {
      serviceClass: 2,
      incomingLoad_a: 4.5,
      bu: 2
    },
    {
      serviceClass: 3,
      incomingLoad_a: 3,
      bu: 3
    }
  ],
  serviceClassesBitrate: [
    {
      serviceClass: 1,
      incomingLoad_a: 9,
      bu: 2
    },
    {
      serviceClass: 2,
      incomingLoad_a: 4.5,
      bu: 2
    },
    {
      serviceClass: 3,
      incomingLoad_a: 3,
      bu: 2
    }
  ]
};


const links = [
  { link: 1, capacity: 10 },
  { link: 2, capacity: 12 },
  { link: 3, capacity: 11 },
  { link: 4, capacity: 10 }
];

const serviceClasses = [
  {
    serviceClass: 1,
    incomingLoad_a: 3,
    route: [
      { link: 1, bu: 1 },
      { link: 2, bu: 1 },
      { link: 3, bu: 1 },
      { link: 4, bu: 2 }
    ]
  },
  {
    serviceClass: 2,
    incomingLoad_a: 1.5,
    route: [
      { link: 1, bu: 2 },
      { link: 2, bu: 2 },
      { link: 3, bu: 2 },
      { link: 4, bu: 2 }
    ]
  },
  {
    serviceClass: 3,
    incomingLoad_a: 1,
    route: [
      { link: 1, bu: 3 },
      { link: 2, bu: 3 },
      { link: 3, bu: 3 },
      { link: 4, bu: 2 }
    ]
  }
];



const kaufmanRoberts = calculateSubsystemBlockingKaufmanRoberts(capacities, serviceClassConfigsKaufmanRoberts);
const lar = calculateBlockingLAR(3, capacities, serviceClassConfigsLAR);
const relationR = calculateBlockingRatios(kaufmanRoberts, lar);
const reducedLoadApproximation = processResultInRLA(links, serviceClasses);

console.log('Ei:', calculateEi(relationR, reducedLoadApproximation));


