import { calculateTrafficLoad } from '../../../src/formulas/IEEE-proposed-model/traffic-load';
describe('Traffic Load', () => {
  const initialTrafficLoad = 0.7;
  const ramCapacity = 32;
  const serviceClassses = [
    { serviceClass: 1, ramCapacity: 1 },
    { serviceClass: 2, ramCapacity: 2 },
    { serviceClass: 3, ramCapacity: 4 }
  ];
  it('should calculate the correct values', () => {
    const trafficLoad = calculateTrafficLoad(initialTrafficLoad, ramCapacity, serviceClassses);
    expect(trafficLoad).toEqual({
      traffic_load_a_1: 7.4666667,
      traffic_load_a_2: 3.7333333,
      traffic_load_a_3: 1.8666667
    });
  });
});
