import {
  linkUtilization_U,
  meanNumberOfCallsInSystemInState_J
} from '../../src/commands/link-utilization';
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

describe('mean-number-of-calls-in-system-in-state-J', () => {
  const state_j = 5;
  const capacity = 5;
  const serviceClasses = [
    {
      serviceClass: 1,
      bu: 1,
      incomingLoad_a: 1
    },
    {
      serviceClass: 2,
      bu: 2,
      incomingLoad_a: 1
    }
  ];
  it('should calculate the mean number of calls in the system in specified state J', () => {
    const result = meanNumberOfCallsInSystemInState_J(capacity, serviceClasses, 5);
    expect(result).toEqual({
      'y_1(5)': 1.54,
      'y_2(5)': 1.73
    });
  });
});
