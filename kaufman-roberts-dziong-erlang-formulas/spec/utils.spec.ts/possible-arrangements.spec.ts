import { possibleArrangements } from '../../src/utils/possible-arrangements';

describe('possible-arrangements', () => {
  describe.each([
    {
      description: 'allocationUnits exceeds kGroups * capacity, invalid case',
      allocationUnits: 7,
      kGroups: 3,
      capacity: 2,
      expected: 0
    },
    {
      description: 'allocationUnits = kGroups * capacity',
      allocationUnits: 6,
      kGroups: 3,
      capacity: 2,
      expected: 1
    },
    {
      description: 'allocationUnits < kGroups * capacity',
      allocationUnits: 6,
      kGroups: 4,
      capacity: 2,
      expected: 10
    }
  ])(`When $description`, ({ allocationUnits, kGroups, capacity, expected }) => {
    it(`returns ${expected}`, () => {
      expect(possibleArrangements(allocationUnits, kGroups, capacity)).toEqual(expected);
    });
  });
});
