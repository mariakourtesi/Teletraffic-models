import { callBlockingProbability } from '../../src/formulas/call-blocking-probability';


describe('Call Blocking probability with 1 service class - complete sharing policy', () => {
  const capacity = 10;
  const serviceClasses = [
    {
      serviceClass: 1,
      bu: 1,
      incomingLoad_a: 1
    }
  ];

  it('should calculate the CBP for the system', () => {
    const result = callBlockingProbability(capacity, serviceClasses);
    expect(result).toEqual({
      B_class_1: '0.0000001'
    });
  });
});

describe('Call Blocking probability with 2 service classes - complete sharing policy', () => {
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
      B_class_1: '0.1721854',
      B_class_2: '0.3818984'
    });
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
      B_class_1: '0.3253012',
      B_class_2: '0.3253012'
    });
  });
});
