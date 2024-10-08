export interface ServiceClass {
  serviceClass: number;
  bu: number;
  incomingLoad_a: number;
}

export interface ServiceClassWithBR extends ServiceClass {
  tk: number; // reserved bandwidth
}

export interface ServiceClassWithRoute  {
  serviceClass: number;
  bu: number;
  incomingLoad_a: number;
  route: number[];
  tk?: number;
}

export interface networkTopology {
 [link: string]: number;
}