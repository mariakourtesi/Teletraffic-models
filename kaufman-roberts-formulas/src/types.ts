export interface ServiceClass {
  serviceClass: number;
  bu: number;
  incomingLoad_a: number;
}

export interface ServiceClassWithBR extends ServiceClass {
  tk: number; // reserved bandwidth
}
