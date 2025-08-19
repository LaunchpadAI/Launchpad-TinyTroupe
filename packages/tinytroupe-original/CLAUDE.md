# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TinyTroupe is a Python library for LLM-powered multiagent persona simulation. It simulates people with specific personalities using Large Language Models (GPT-4) to generate realistic behavior patterns for business insights, testing, and research.

## Development Commands

### Testing
```bash
# Run all tests with cache refresh
pytest -s --refresh_cache

# Run tests without examples (faster)
pytest -s --refresh_cache -m "not examples"

# Run with coverage
pytest -s --refresh_cache --cov=tinytroupe --cov-report=html

# Run a specific test file
pytest -s tests/unit/test_tiny_person.py

# Run a specific test
pytest -s tests/unit/test_tiny_person.py::test_person_creation
```

### Build & Install
```bash
# Build package
python -m build

# Install for development (editable)
pip install -e .

# Install from local repo
pip install . --no-cache-dir
```

### Documentation
```bash
# Generate API documentation
pdoc --html --output-dir docs/api tinytroupe
```

## Architecture Overview

### Core Abstractions
- **TinyPerson** (`tinytroupe/agent/tiny_person.py`): The main agent class representing simulated individuals with personality, memory, and action capabilities
- **TinyWorld** (`tinytroupe/environment/tiny_world.py`): Environment where agents interact
- **TinyPersonFactory** (`tinytroupe/factory/tiny_person_factory.py`): LLM-powered system for generating new agents
- **Control** (`tinytroupe/control.py`): Manages simulation state, caching, and checkpoints

### Key Modules Structure
```
tinytroupe/
├── agent/           # Agent implementation (TinyPerson, memory, actions)
├── environment/     # Simulation environments (TinyWorld, social networks)
├── factory/         # Agent generation system
├── extraction/      # Result extraction from simulations
├── tools/          # Simulated tools agents can use
├── utils/          # Utilities (config, LLM helpers, validation)
└── prompts/        # LLM prompt templates
```

### Configuration System
- Main config: `tinytroupe/config.ini` (default model: gpt-4.1-mini)
- Runtime configuration via `tinytroupe.config_manager`
- Environment variables: `AZURE_OPENAI_KEY`, `AZURE_OPENAI_ENDPOINT`, or `OPENAI_API_KEY`

### Testing Architecture
- Unit tests in `tests/unit/` - test individual components
- Scenario tests in `tests/scenarios/` - integration tests
- Use pytest markers: `@pytest.mark.examples` for example tests
- API calls are cached during testing (use `--refresh_cache` to update)

### Memory & State Management
- Agents have episodic memory (experiences) and semantic memory (knowledge)
- Simulation state can be saved/loaded via `control.checkpoint()` and `control.load_checkpoint()`
- LLM calls can be cached for cost reduction using `control.begin()` with `cache=True`

### Prompt System
- Templates use Mustache syntax (chevron library)
- Located in `*/prompts/` directories
- Key prompts: agent actions, memory consolidation, factory generation

### Agent Specifications
- JSON format in `examples/agents/` directory
- Can be loaded via `TinyPerson.load_spec()`
- Includes personality traits, demographics, preferences, and goals

## Important Development Notes

### When Adding New Features
- Follow existing patterns in the codebase (check similar components first)
- Add appropriate unit tests in `tests/unit/`
- Update docstrings for API documentation generation
- Consider caching implications for LLM calls

### When Working with Agents
- Agent actions are generated via LLM and validated for quality
- Memory consolidation happens periodically to manage context
- Use `grounding.py` for connecting agents to real data

### When Running Simulations
- Always set up proper configuration first
- Use checkpointing for long simulations
- Monitor API costs (token usage logged)
- Consider using parallel execution for multiple agents

### Security & Responsible AI
- Content filters are strongly recommended for Azure OpenAI
- Never commit API keys or sensitive data
- The library includes RAI (Responsible AI) protections
- See `tests/non_functional/test_security.py` for security validations