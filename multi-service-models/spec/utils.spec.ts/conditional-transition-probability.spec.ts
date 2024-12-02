import { conditionalTransitionProbability } from '../../src/utils/conditional-transition-probability';
import { possibleArrangements } from '../../src/utils/possible-arrangements';

describe('conditionalTransitionProbability', () => {
  describe.each([
    {
      description: 'nominator equals denominator',
      inputs: { currentState: 5, classCapacity: 3, groupCount: 2, totalCapacity: 10 },
      expected: 1
    },
    {
      description: 'denominator is greater than nominator',
      inputs: { currentState: 5, classCapacity: 3, groupCount: 2, totalCapacity: 10 },
      expected: 1
    },
    {
      description: 'nominator is 0',
      inputs: { currentState: 20, classCapacity: 5, groupCount: 2, totalCapacity: 10 },
      expected: 0
    },
    {
      description: 'denominator is 0',
      inputs: { currentState: 5, classCapacity: 3, groupCount: 2, totalCapacity: 10 },
      expected: 1
    }
  ])('When $description', ({ inputs, expected }) => {
    const { currentState, classCapacity, groupCount, totalCapacity } = inputs;

    it(`should return ${expected}`, () => {
      const response = conditionalTransitionProbability(
        currentState,
        classCapacity,
        groupCount,
        totalCapacity
      );
      expect(response).toEqual(expected);
    });
  });
});
