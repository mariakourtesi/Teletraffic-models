export interface ServiceClass {
  serviceClass: number;
  bu: number;
  incomingLoad_a: number;
};

export const kaufmanRobertsFormula = (capacity: number, serviceClasses: ServiceClass[]): number[] | number | undefined => {
const probabilities: number[] = [];
// if q(j) = 0, then q(0) = 1
if (capacity === 0) {
  return 1;
}
// if q(j) = -1, then q(-1) = 0
if (capacity === -1) {
  return 0;
};

}