# Teletraffic Loss Models

This repository contains implementations of mathematical formulas related to teletraffic loss models, as described in the book <a href="https://www.amazon.co.uk/Efficient-Multirate-Teletraffic-Models-Beyond/dp/111942688X" target="_blank"> Efficient Multirate Teletraffic Loss Models Beyond Erlang.</a>

These models are commonly used in the field of telecommunications and beyond to analyse and optimise performance, particularly in scenarios involving multirate traffic and varying levels of service demand.

It also includes the implementation of the proposed analytic model, which calculates blocking probabilities in a cloud system offering IaaS, as described in the paper <a href="https://ieeexplore.ieee.org/document/9483923" target="_blank">A Multiparameter Analytical Model of the Physical Infrastructure of a Cloud-Based System<a>

## Installation

1. Clone the repository: `git clone https://https://github.com/mariakourtesi/Teletraffic-models.git`
2. Navigate to the project directory: `cd multi-service-models`
3. Install the required dependencies: `npm ci`

Please note: you need Node v20

## Running the formulas

Please note that this is work in progress and more formulas will be added in the CLI.
At the moment it only returns the blocking states in the Kaufman-Roberts (complete-sharing policy) model

1. Build the app: `npm run build`
2. Install it locally: `npm install -g .`

#### Running the Kaufman-Roberts Formula

Run the command: `emlm kaufman-roberts -c 5 -s`

You can run the command in either of the following ways:

**In Bash**:
You can create a json file and add the array of service classes there.
`emlm kaufman-roberts --capacity 5 --serviceClasses "$(cat src/serviceClasses.json)"`

Or, by directly providing the JSON string:
`emlm kaufman-roberts --capacity 5 --serviceClasses '[{"serviceClass": 1, "bu": 1, "incomingLoad_a": 2}, {"serviceClass": 2, "bu": 2, "incomingLoad_a": 1}]'`

**In Command Prompt** (for windows users):
`emlm kaufman-roberts --capacity 5 --serviceClasses '[{"serviceClass": 1, "bu": 1, "incomingLoad_a": 2}, {"serviceClass": 2, "bu": 2, "incomingLoad_a": 1}]'`

##### Validation Instructions

To verify that this implementation works, follow these steps:
Navigate to Teletraffic Models https://teletraffic-models.appspot.com/

Select the `Kaufman - Roberts Formula option`.

- Set the following parameters:
  - Link Capacity (C): 4
  - Number of Service Classes: 2

Configure the service classes:

- Service Class 1:
  - Traffic Load (a): 2
  - Bandwidth Demand: 1
- Service Class 2:
  - Traffic Load (a): 1
  - Bandwidth Demand: 2

The expected output is:

The output is:
| J | q(j) | Q(j) Normalised values |
| ---- | ------- | --------------------- |
| 0 | 1 | 0.08 |
| 1 | 2 | 0.16 |
| 2 | 3 | 0.24 |
| 3 | 3.3333 | 0.26667 |
| 4 | 3.1667 | 0.25333 |

#### Running the IEEE Blockings in a Cloud IaaS Formula

Run the command: `emlm ieee-model -r 3 -ram 12 -cpu 12 -disk 12 -bps 12 -t 0.9  -s "$(cat src/serviceClasses.json)"`

where:
`-r` is the number of Physical Machines
`-ram` RAM capacity
`-cpu` CPU Capacity
`-disk` DISK Capacity
`-bps` Network Capacity
`-t` Initial Traffic Load
`-s` Service classes or Virtual Machines with capacities they require from each resource (RAM, CPU, Disk, Network).

#### Running the RLA Formula

Run the command: `emlm rla -l "$(cat src/links.json)"   -s "$(cat src/serviceClassesRla.json)"`

You need two json files
Network topology example:

````[
   { "link": 1, "bu": 4 },
   { "link": 2, "bu": 5 }
]```

Service Classes example:
```[
  {
    "serviceClass": 1,
    "incomingLoad_a": 1,
    "route": [
      { "link": 1, "bu": 1 },
      { "link": 2, "bu": 1 }
    ]
  },
  {
    "serviceClass": 2,
    "incomingLoad_a": 1,
    "route": [{ "link": 2, "bu": 2 }]
  }
]```
````
