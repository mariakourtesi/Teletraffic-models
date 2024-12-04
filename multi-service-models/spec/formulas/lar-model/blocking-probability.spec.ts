import { blockingProbabilityLAR } from '../../../src/formulas/lar-model/blocking-probability';
describe('blocking probability', () => {
  describe('LAR model blocking propability', () => {
    it('should calculate the blocking probability for the system', () => {
      const result = blockingProbabilityLAR(2, 5, [{ serviceClass: 1, bu: 1, incomingLoad_a: 1 }]);
      expect(result).toEqual({
        E_class_1: '0.0000001%'
      });
    });
  });
});
