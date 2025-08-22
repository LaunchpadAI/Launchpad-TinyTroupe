# Persona Debugging Test Scripts

This directory contains test scripts developed during the persona authenticity debugging session.

## Test Scripts

### Core Persona Tests
- `test_wayne_gretzky.py` - Test Wayne Gretzky's authentic speech patterns
- `test_two_personas.py` - Test distinct voices between Wayne Gretzky and Tony Parker
- `test_enhanced_personas.py` - Test enhanced persona template
- `test_speech_patterns.py` - Test speech pattern recognition

### Integration Tests  
- `test_image_integration.py` - Test multimodal image analysis capabilities
- `test_image_upload.py` - Test image upload functionality

### Debug Scripts
- `debug_persona.py` - Debug persona loading and specification access
- `debug_cross_communication.py` - Debug cross-communication toggle behavior

## Usage

Run from the API directory:
```bash
cd /Users/mike/GitHub/Launchpad-TinyTroupe/apps/api
python3 tests/persona-debugging/test_wayne_gretzky.py
```

## Results

All tests validate that:
- ✅ Personas speak with authentic speech patterns
- ✅ Cross-communication toggle works correctly  
- ✅ Agent session caching prevents duplicate instances
- ✅ Interaction parsing returns responses to frontend
- ✅ Each persona maintains distinct voice and perspectives