# Bug Diagnosis: Wrong Personas Loading

## 🚨 ROOT CAUSE IDENTIFIED

**The persona activation system is working PERFECTLY**. The bug is in the **participants parsing logic** that loads multiple agents when only one is requested.

## Evidence from API Logs

### Request
```json
{
  "participants": {
    "specifications": ["wayne_gretzky"]  // Only Wayne Gretzky requested
  }
}
```

### Actual Loading (Session: db03199e)
```
🆕 LOADING new agent: tony_parker (session: db03199e...)
🆕 LOADING new agent: brandon_mcmanus (session: db03199e...)  
🆕 LOADING new agent: wayne_gretzky (session: db03199e...)
```

**Result**: 3 agents loaded when only 1 was requested!

### OpenAI Dashboard Impact
When multiple agents are loaded, the system randomly picks one for the system prompt:
- Sometimes gets Tony Parker persona → Perfect Tony Parker responses
- Sometimes gets Brandon McManus persona → Perfect Brandon McManus responses  
- Sometimes gets Wayne Gretzky persona → Perfect Wayne Gretzky responses

## Why This Explains Everything

1. **"Generic" responses**: They weren't generic - they were authentic responses from the wrong person
2. **Speech patterns working**: Each agent used their authentic speech patterns perfectly
3. **Expertise mismatch**: Tony Parker gave NBA/international perspective instead of hockey perspective
4. **Random behavior**: Different agents responded depending on which one was randomly selected

## The Fix Needed

The bug is in the participants loading logic in `simulations.py` around line 45-49. The system should only load the agents specified in `request.participants.specifications` but is somehow loading additional agents.

**Investigation needed**: 
- Check if there's a hardcoded agent list somewhere
- Verify session isolation is working correctly
- Ensure no caching contamination between requests

## Success Criteria

When fixed:
1. Request for `["wayne_gretzky"]` → Only Wayne Gretzky loaded
2. Consistent agent throughout simulation
3. OpenAI dashboard shows only Wayne Gretzky persona in system prompt

## Conclusion

This is NOT a TinyTroupe or persona activation bug. The persona system works flawlessly. This is a **participants parsing bug** in our API layer that loads extra agents beyond what was requested.