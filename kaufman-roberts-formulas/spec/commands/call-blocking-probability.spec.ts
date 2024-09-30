import { callBlockingProbability } from '../../src/commands/call-blocking-probability';
describe('Call Blocking probability - complete sharing policy', () => {
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

  it('should calculate the CBP for the system', () => {
    const result = callBlockingProbability(capacity, serviceClasses);
    expect(result).toEqual({
      B_class_1: '17.21854%',
      B_class_2: '38.18984%'
    });
  });

  describe('Call Blocking probability - bandwidth reservation policy', () => {
    const capacity = 5;
    const serviceClasses = [
      {
        serviceClass: 1,
        bu: 1,
        incomingLoad_a: 2,
        tk: 1
      },
      {
        serviceClass: 2,
        bu: 2,
        incomingLoad_a: 1,
        tk: 0
      }
    ];

    it('should calculate the CBP for the system', () => {
      const result = callBlockingProbability(capacity, serviceClasses);
      expect(result).toEqual({
        B_class_1: '38.18984%',
        B_class_2: '38.18984%'
      });
    });
  });
});
