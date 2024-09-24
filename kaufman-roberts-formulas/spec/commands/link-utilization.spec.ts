import { linkUtilization_U } from '../../src/commands/link-utilization';
describe('link-utilization', () => {
  const capacity = 5;
  const serviceClasses = [
    {
      serviceClass: 1,
      bu: 1,
      incomingLoad_a: 2
    },
    {
      serviceClass: 2,
      bu: 2,
      incomingLoad_a: 1
    }
  ];

  it('should calculate the link utilization U for the system', () => {
    const result = linkUtilization_U(capacity, serviceClasses);
    expect(result).toEqual('2.8918318 b.u');
  });
});
