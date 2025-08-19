# TinyTroupe Core Library

This is the core TinyTroupe library containing all the persona simulation, market research, and AI agent functionality.

## Structure

- `tinytroupe/` - Main library code (symbolic link to ../../tinytroupe)
- `pyproject.toml` - Python package configuration
- `project.json` - Nx project configuration

## Development

To install in development mode:

```bash
nx run tinytroupe-core:install
```

To run tests:

```bash
nx run tinytroupe-core:test
```

## Usage

```python
from tinytroupe.agent import TinyPerson
from tinytroupe.environment import TinyWorld
from tinytroupe.factory import TinyPersonFactory

# Load existing agent
lisa = TinyPerson.load_specification("./agents/Lisa.agent.json")

# Create world and run simulation
world = TinyWorld("Test World", [lisa])
world.broadcast("Hello, what do you think about this product?")
world.run(1)
```