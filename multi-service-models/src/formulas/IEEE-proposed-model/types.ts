export interface ServiceClass {
  serviceClass: number;
  incomingLoad_a: number;
  bu: number;
}

export interface Capacities {
  ramCapacity: number;
  processorCapacity: number;
  diskCapacity: number;
  bpsCapacity: number;
}

export interface ServiceClassConfigs {
  serviceClasses: ServiceClass[];
  serviceClassesBitrate?: ServiceClass[];
}

export interface BlockingProbability { [key: string]: number };
export interface BlockingRatios { 
  RAM:  BlockingProbability,
  Processor:  BlockingProbability,
  Disk:  BlockingProbability,
  Bps:  BlockingProbability };

