export const recurrentErlangformula = (capacity: number, trafficLoad: number): number => {
  if (capacity === 0) {
    return 1;
  }

  return (
    (trafficLoad * recurrentErlangformula(capacity - 1, trafficLoad)) /
    (capacity + trafficLoad * recurrentErlangformula(capacity - 1, trafficLoad))
  );
};

