describe('Reduced Load Approximation', () => {

  const links = [
    {link: 1, capacity: 4},
    {link: 2, capacity: 5}
  ]

  const serviceClasses = [
    {
      serviceClass: 1,
      bu: 1,
      arrivalRate: 1,
      processingTime: 1,
      route: [1, 2]
    },
    {
      serviceClass: 2,
      bu: 2,
      arrivalRate: 1,
      processingTime: 1,
      route: [2]
    }
  ];

  it('should calculate the CBP for each service class that traverses the link network topology', () => {
    const result = reducedLoadApproximation(links, serviceClasses);
    expect(result).toEqual({
      'B1': 0.114803966,
      'B2': 0.267779732
  });
});

});