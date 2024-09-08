# Kaufman-Roberts

## Description
This project includes implementations of Kaufman-Roberts mathematical formula.

### Kaufman-Roberts recursive unnormalised formula.

![Kaufman-Roberts Formula](../images/kaufman.png)


### Kaufman-Roberts recursive normalised formula.

![Kaufman-Roberts Formula](../images/normalised.png)


## Installation
1. Clone the repository: `git clone https://https://github.com/mariakourtesi/Teletraffic-models.git`
2. Navigate to the project directory: `cd kaufman-roberts-formulas`
3. Install the required dependencies: `npm ci`

Please note: you need Node v20

## Running the formulas
To run this project, type `npm run kaufman`. 

## Kaufman-Roberts formula
The Kaufman-Roberts formula is a multi-dimensional Erlang method that calculates the blocking probability when multiple services share a common resource pool. It's used to evaluate the blocking probability in a multirate system with circuit traffic.

 <a href="[https://readme.com/](https://www.ibm.com/docs/en/tnpm/1.4.4?topic=functions-kaufman-roberts-based)" target="_blank">Kaufman-Roberts based functions<a>

To validate this implementation works, please navigate to 
Select Kaufman - Roberts Formula
Link Capacity C = 4
Number of Service Classes = 2
Service Class 1:
  Traffic load (a) = 2
  Bandwidth demand = 1

Service Class 2:
  Traffic load (a) = 1
  Bandwidth demand = 2


## Validation Instructions
To verify that this implementation works, follow these steps:
Navigate to Teletraffic Models https://teletraffic-models.appspot.com/ 

Select the `Kaufman - Roberts Formula option`.

Set the following parameters:
Link Capacity (C): 4
Number of Service Classes: 2

Configure the service classes:

Service Class 1:
  Traffic Load (a): 2
  Bandwidth Demand: 1
Service Class 2:
  Traffic Load (a): 1
  Bandwidth Demand: 2

The expected output is:

The output is:
| J    | q(j)    | Q(j) Normalised values |
| ---- | ------- | ---------------------  |
|   0  |    1    |       0.08             |
|   1  |    2    |       0.16             |
|   2  |    3    |       0.24             |
|   3  | 3.3333  |       0.26667          |
|   4  | 3.1667  |       0.25333          |

