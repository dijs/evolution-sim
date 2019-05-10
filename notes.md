# Evolution Simulation

## Rules

- Creatures try to find food each day
- At the end of the day, they "go back home" ~ or rest
- If the creature found food, they survive
- If they did not find food, they die
- If they found more than 1 food, they generate another creature (populate)

## Traits

- Mutate new creatures (generated offspring) randomly after they eat food
- Speed (less time, more energy)
- Size
  - eat nearby creature if you are at least 20% bigger
  - energy cost per step = size^3 \* speed^2
    - similar to mv^2 / 2 (kinetic energy)
  - smaller creatures should run away from larger creatures
    - use that negative boid algorithm idea
- Sense
  - use distance
  - can sense food and bigger creatures
  - cost = size^3 \* speed^2 + sense
