# DSPy Integration Technical Specification
## Calibrating TinyTroupe Simulations with Programmatic Prompt Optimization

### Version 1.0 - December 2024

## Overview

This document specifies how DSPy (Declarative Self-improving Python) will be integrated with TinyTroupe to create calibrated, self-improving persona simulations that align with historical data and generalize across industries.

## Core Concept

DSPy enables us to:
1. **Define signatures** for what personas should evaluate (input → output)
2. **Optimize prompts automatically** based on historical performance metrics
3. **Continuously improve** as new data becomes available
4. **Maintain calibration** between LLM reasoning and real-world outcomes

## Architecture

```
Historical Data → DSPy Optimizer → Optimized Prompts → TinyTroupe Personas
                       ↑                                      ↓
                  Metric Functions ← Simulation Results ← Behaviors
```

## DSPy Signatures for TinyTroupe

### 1. Creative Evaluation Signature

```python
import dspy

class EvaluateCreative(dspy.Signature):
    """Evaluate how a persona responds to marketing creative."""
    
    # Inputs
    persona_profile = dspy.InputField(
        desc="Persona traits, preferences, and history as JSON"
    )
    creative_content = dspy.InputField(
        desc="Marketing message, visuals, offer details"
    )
    context = dspy.InputField(
        desc="Time, channel, frequency, competitive landscape"
    )
    
    # Outputs
    intent_delta = dspy.OutputField(
        desc="Change in purchase intent (-1 to +1)"
    )
    emotional_response = dspy.OutputField(
        desc="Emotional reaction: excited|interested|neutral|annoyed|angry"
    )
    rationale = dspy.OutputField(
        desc="Why the persona responds this way (2-3 sentences)"
    )
```

### 2. Channel Preference Signature

```python
class AssessChannelPreference(dspy.Signature):
    """Determine persona's channel preferences and fatigue."""
    
    persona_profile = dspy.InputField()
    recent_exposures = dspy.InputField(
        desc="List of recent channel touches with timestamps"
    )
    proposed_channel = dspy.InputField(
        desc="Channel being considered: email|sms|push|mail"
    )
    
    receptivity = dspy.OutputField(
        desc="Likelihood to engage (0-1)"
    )
    fatigue_level = dspy.OutputField(
        desc="Current fatigue: none|low|medium|high|saturated"
    )
    optimal_timing = dspy.OutputField(
        desc="Best time to reach via this channel"
    )
```

### 3. Purchase Decision Signature

```python
class SimulatePurchaseDecision(dspy.Signature):
    """Simulate final purchase decision after interventions."""
    
    persona_profile = dspy.InputField()
    intervention_history = dspy.InputField(
        desc="Sequence of marketing touches received"
    )
    product_details = dspy.InputField()
    competitive_options = dspy.InputField()
    
    purchase_decision = dspy.OutputField(
        desc="yes|no|delayed"
    )
    decision_factors = dspy.OutputField(
        desc="Top 3 factors influencing decision"
    )
    price_sensitivity = dspy.OutputField(
        desc="How much price influenced decision (0-1)"
    )
```

## DSPy Modules for TinyTroupe

### 1. Persona Response Module

```python
class PersonaResponseModule(dspy.Module):
    def __init__(self):
        super().__init__()
        self.evaluate_creative = dspy.ChainOfThought(EvaluateCreative)
        self.assess_channel = dspy.Predict(AssessChannelPreference)
        self.make_decision = dspy.ReAct(SimulatePurchaseDecision)
    
    def forward(self, persona, intervention, context):
        # Evaluate the creative
        creative_response = self.evaluate_creative(
            persona_profile=persona.to_json(),
            creative_content=intervention.content,
            context=context.to_json()
        )
        
        # Assess channel preference
        channel_pref = self.assess_channel(
            persona_profile=persona.to_json(),
            recent_exposures=persona.exposure_history,
            proposed_channel=intervention.channel
        )
        
        # Combine for final response
        return {
            'intent_delta': creative_response.intent_delta,
            'receptivity': channel_pref.receptivity,
            'rationale': creative_response.rationale
        }
```

### 2. Segment Behavior Module

```python
class SegmentBehaviorModule(dspy.Module):
    def __init__(self, segment_size=100):
        super().__init__()
        self.persona_modules = [
            PersonaResponseModule() for _ in range(segment_size)
        ]
    
    def forward(self, segment_profile, intervention):
        responses = []
        for i, module in enumerate(self.persona_modules):
            persona = self.generate_persona(segment_profile, seed=i)
            response = module(persona, intervention, self.context)
            responses.append(response)
        
        return self.aggregate_responses(responses)
```

## Optimization Metrics

### 1. Ranking Accuracy Metric

```python
def ranking_accuracy_metric(examples, predictions):
    """
    Compare predicted creative rankings with historical performance.
    Higher is better.
    """
    from scipy.stats import kendalltau
    
    historical_ranks = [ex.actual_performance_rank for ex in examples]
    predicted_ranks = [pred.predicted_rank for pred in predictions]
    
    tau, _ = kendalltau(historical_ranks, predicted_ranks)
    return (tau + 1) / 2  # Normalize to [0, 1]
```

### 2. Moment Matching Metric

```python
def moment_matching_metric(examples, predictions):
    """
    Compare statistical moments of simulated vs actual outcomes.
    """
    actual_moments = calculate_moments(examples.actual_outcomes)
    simulated_moments = calculate_moments(predictions.simulated_outcomes)
    
    errors = []
    for moment_name in ['mean', 'std', 'skew']:
        actual = actual_moments[moment_name]
        simulated = simulated_moments[moment_name]
        relative_error = abs(actual - simulated) / (abs(actual) + 1e-6)
        errors.append(relative_error)
    
    return 1 - np.mean(errors)  # Higher is better

def calculate_moments(outcomes):
    return {
        'mean': np.mean(outcomes),
        'std': np.std(outcomes),
        'skew': scipy.stats.skew(outcomes)
    }
```

### 3. Calibration Metric

```python
def calibration_metric(examples, predictions):
    """
    Measure calibration of probability predictions.
    """
    from sklearn.calibration import calibration_curve
    
    true_outcomes = [ex.did_convert for ex in examples]
    pred_probs = [pred.conversion_probability for pred in predictions]
    
    # Compute calibration error
    fraction_positive, mean_predicted = calibration_curve(
        true_outcomes, pred_probs, n_bins=10
    )
    
    calibration_error = np.mean(np.abs(fraction_positive - mean_predicted))
    return 1 - calibration_error  # Higher is better
```

### 4. Composite Metric

```python
def composite_metric(examples, predictions):
    """
    Combine multiple metrics for overall optimization.
    """
    weights = {
        'ranking': 0.3,
        'moments': 0.3,
        'calibration': 0.4
    }
    
    scores = {
        'ranking': ranking_accuracy_metric(examples, predictions),
        'moments': moment_matching_metric(examples, predictions),
        'calibration': calibration_metric(examples, predictions)
    }
    
    weighted_score = sum(
        weights[key] * scores[key] for key in weights
    )
    
    return weighted_score
```

## Optimization Process

### 1. Data Preparation

```python
def prepare_training_data(historical_campaigns):
    """
    Convert historical data to DSPy examples.
    """
    examples = []
    
    for campaign in historical_campaigns:
        for segment in campaign.segments:
            example = dspy.Example(
                persona_profile=segment.profile,
                intervention=campaign.intervention,
                context=campaign.context,
                actual_response_rate=segment.response_rate,
                actual_conversion_rate=segment.conversion_rate,
                actual_unsubscribe_rate=segment.unsubscribe_rate
            ).with_inputs('persona_profile', 'intervention', 'context')
            
            examples.append(example)
    
    return examples
```

### 2. Optimization Loop

```python
class TinyTroupeOptimizer:
    def __init__(self, historical_data):
        self.train_set = prepare_training_data(historical_data)
        self.val_set = self.train_set[-100:]  # Hold out validation
        self.train_set = self.train_set[:-100]
        
    def optimize_personas(self):
        """
        Optimize persona response modules using DSPy.
        """
        # Initialize module
        persona_module = PersonaResponseModule()
        
        # Configure optimizer
        optimizer = dspy.BootstrapFewShotWithRandomSearch(
            metric=composite_metric,
            max_bootstrapped_demos=4,
            num_candidate_programs=20,
            num_threads=8
        )
        
        # Compile optimized module
        optimized_module = optimizer.compile(
            persona_module,
            trainset=self.train_set,
            valset=self.val_set
        )
        
        return optimized_module
    
    def continuous_optimization(self, new_data_stream):
        """
        Continuously update optimization as new data arrives.
        """
        buffer = []
        
        for new_campaign_result in new_data_stream:
            buffer.append(new_campaign_result)
            
            if len(buffer) >= 100:  # Batch optimization
                new_examples = prepare_training_data(buffer)
                self.train_set.extend(new_examples)
                
                # Re-optimize with expanded dataset
                self.optimized_module = self.optimize_personas()
                buffer = []
                
                yield self.optimized_module
```

## Integration with TinyTroupe

### 1. Enhanced TinyPerson with DSPy

```python
from tinytroupe import TinyPerson as BaseTinyPerson

class CalibratedTinyPerson(BaseTinyPerson):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.response_module = None  # Will be set by optimizer
        
    def set_calibrated_module(self, dspy_module):
        """Inject DSPy-optimized module."""
        self.response_module = dspy_module
    
    def respond_to_intervention(self, intervention, context):
        """Use DSPy module for calibrated response."""
        if self.response_module:
            response = self.response_module(
                persona=self,
                intervention=intervention,
                context=context
            )
            
            # Map to TinyTroupe action
            return self._convert_to_action(response)
        else:
            # Fallback to base behavior
            return super().respond_to_intervention(intervention, context)
    
    def _convert_to_action(self, dspy_response):
        """Convert DSPy output to TinyTroupe action."""
        from tinytroupe import Action
        
        # Map intent delta to action
        if float(dspy_response['intent_delta']) > 0.5:
            action_type = 'engage'
        elif float(dspy_response['intent_delta']) < -0.3:
            action_type = 'unsubscribe'
        else:
            action_type = 'ignore'
        
        return Action(
            type=action_type,
            confidence=float(dspy_response['receptivity']),
            rationale=dspy_response['rationale']
        )
```

### 2. Factory with Calibration

```python
from tinytroupe.factory import TinyPersonFactory

class CalibratedPersonaFactory(TinyPersonFactory):
    def __init__(self, optimizer):
        super().__init__()
        self.optimizer = optimizer
        self.optimized_module = optimizer.optimized_module
    
    def create_persona(self, segment_profile):
        """Create persona with calibrated behavior."""
        persona = CalibratedTinyPerson(
            **self.generate_traits(segment_profile)
        )
        persona.set_calibrated_module(self.optimized_module)
        return persona
    
    def create_segment(self, segment_profile, size=100):
        """Create calibrated segment."""
        return [
            self.create_persona(segment_profile) 
            for _ in range(size)
        ]
```

## Deployment Pipeline

### 1. Initial Calibration

```python
def initial_calibration(historical_data):
    """
    Perform initial calibration on historical data.
    """
    # Load historical campaigns
    campaigns = load_historical_campaigns(historical_data)
    
    # Initialize optimizer
    optimizer = TinyTroupeOptimizer(campaigns)
    
    # Run optimization
    optimized_module = optimizer.optimize_personas()
    
    # Validate on holdout set
    validation_score = validate_module(
        optimized_module, 
        optimizer.val_set
    )
    
    if validation_score > 0.8:
        return optimized_module
    else:
        raise ValueError(f"Calibration failed: score {validation_score}")
```

### 2. Production Integration

```python
class CalibratedSimulationService:
    def __init__(self):
        self.optimizer = None
        self.factory = None
        self.calibration_schedule = "daily"
        
    def initialize(self, historical_data):
        """Initialize with historical calibration."""
        self.optimizer = TinyTroupeOptimizer(historical_data)
        optimized_module = self.optimizer.optimize_personas()
        self.factory = CalibratedPersonaFactory(self.optimizer)
        
    def run_simulation(self, intervention, target_segment):
        """Run calibrated simulation."""
        # Create calibrated personas
        personas = self.factory.create_segment(
            target_segment.profile,
            size=100
        )
        
        # Run simulation
        results = []
        for persona in personas:
            response = persona.respond_to_intervention(
                intervention,
                self.get_context()
            )
            results.append(response)
        
        return self.aggregate_results(results)
    
    def update_calibration(self, new_results):
        """Update calibration with new campaign results."""
        new_examples = prepare_training_data([new_results])
        self.optimizer.train_set.extend(new_examples)
        
        # Re-optimize
        optimized_module = self.optimizer.optimize_personas()
        self.factory.optimized_module = optimized_module
```

## Monitoring & Validation

### 1. Calibration Drift Detection

```python
class CalibrationMonitor:
    def __init__(self, threshold=0.1):
        self.threshold = threshold
        self.baseline_performance = None
        
    def detect_drift(self, predictions, actuals):
        """Detect if calibration has drifted."""
        current_error = self.calculate_error(predictions, actuals)
        
        if self.baseline_performance is None:
            self.baseline_performance = current_error
            return False
        
        drift = abs(current_error - self.baseline_performance)
        return drift > self.threshold
    
    def calculate_error(self, predictions, actuals):
        """Calculate prediction error."""
        mse = np.mean((predictions - actuals) ** 2)
        return np.sqrt(mse)
```

### 2. Performance Tracking

```python
def track_optimization_performance(optimizer, test_campaigns):
    """
    Track how optimization improves over time.
    """
    performance_history = []
    
    for epoch, optimized_module in enumerate(
        optimizer.continuous_optimization(test_campaigns)
    ):
        # Test on validation set
        val_score = composite_metric(
            optimizer.val_set,
            run_predictions(optimized_module, optimizer.val_set)
        )
        
        performance_history.append({
            'epoch': epoch,
            'validation_score': val_score,
            'training_examples': len(optimizer.train_set),
            'timestamp': datetime.now()
        })
        
        # Log performance
        logger.info(f"Epoch {epoch}: Validation score {val_score:.3f}")
    
    return performance_history
```

## Best Practices

### 1. Prompt Design
- Keep signatures focused and specific
- Use clear descriptions for inputs/outputs
- Avoid embedding numeric values in prompts

### 2. Optimization
- Start with small batches for faster iteration
- Use stratified sampling for diverse training examples
- Monitor for overfitting with validation metrics

### 3. Production
- Version control optimized modules
- A/B test new optimizations before full deployment
- Maintain fallback to previous versions

### 4. Data Requirements
- Minimum 1000 historical examples for initial calibration
- Continuous updates with at least 100 new examples
- Diverse coverage of segments and interventions

## Example End-to-End Flow

```python
# 1. Load historical data
historical_data = load_campaign_history(
    start_date="2023-01-01",
    end_date="2024-12-01"
)

# 2. Initialize optimizer
optimizer = TinyTroupeOptimizer(historical_data)

# 3. Optimize personas
optimized_module = optimizer.optimize_personas()
print(f"Optimization complete. Validation score: {optimizer.validation_score}")

# 4. Create calibrated factory
factory = CalibratedPersonaFactory(optimizer)

# 5. Run new simulation
new_intervention = {
    'channel': 'email',
    'content': 'Limited time offer...',
    'segment': 'high_value_customers'
}

personas = factory.create_segment(
    segment_profiles['high_value_customers'],
    size=100
)

responses = [
    persona.respond_to_intervention(new_intervention, context)
    for persona in personas
]

# 6. Analyze results
results = analyze_responses(responses)
print(f"Expected conversion rate: {results['conversion_rate']:.2%}")
print(f"Expected unsubscribe rate: {results['unsubscribe_rate']:.2%}")

# 7. Update calibration with actual results (after campaign runs)
actual_results = get_actual_campaign_results()
optimizer.update_calibration(actual_results)
```

This integration enables TinyTroupe simulations to continuously improve and stay calibrated with real-world data through DSPy's programmatic prompt optimization.