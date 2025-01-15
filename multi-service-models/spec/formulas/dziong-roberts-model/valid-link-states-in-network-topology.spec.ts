import { networkTopology, ServiceClassWithRoute } from '../../../src/formulas/types';
import { calculateValidLinkStates } from '../../../src/formulas/dziong-roberts-model/valid-link-states-in-network-topology';

describe('Valid link states in network topology', () => {
  describe.each([
    {
      description: 'two service classes with two links',
      topology: [
        { link: 1, bu: 4 },
        { link: 2, bu: 5 }
      ],
      serviceClasses: [
        {
          serviceClass: 1,
          incomingLoad_a: 1,
          route: [
            { link: 1, bu: 1 },
            { link: 2, bu: 1 }
          ]
        },
        {
          serviceClass: 2,
          incomingLoad_a: 1,
          route: [{ link: 2, bu: 2 }]
        }
      ],
      expectedStates: [
        [0, 0],
        [0, 2],
        [0, 4],
        [1, 1],
        [1, 3],
        [1, 5],
        [2, 2],
        [2, 4],
        [3, 3],
        [3, 5],
        [4, 4]
      ]
    }
  ])(`When $description`, ({ topology, serviceClasses, expectedStates }) => {
    it('should return valid link states', () => {
      const validLinkStates = calculateValidLinkStates(topology, serviceClasses);
      console.log('Valid Link States:', validLinkStates);
      expect(validLinkStates).toEqual(expectedStates);
    });
  });
});
