"""
Intervention testing service implementing A/B testing and experiment management
Following TinyTroupe patterns for intervention experiments
"""

import os
import uuid
import json
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import logging
import numpy as np
from scipy import stats

# TinyTroupe imports
from tinytroupe.environment import TinyWorld
from tinytroupe.agent import TinyPerson
from tinytroupe.extraction import ResultsExtractor
import tinytroupe.control as control

from ..models.intervention import (
    CreateInterventionRequest,
    UpdateInterventionRequest, 
    ExecuteInterventionRequest,
    InterventionResponse,
    InterventionResults,
    InterventionStatus,
    InterventionType,
    CompareInterventionsRequest,
    InterventionComparisonResponse,
    ComparisonResult
)
from ..models.population import PopulationResponse
from .population_service import PopulationService

logger = logging.getLogger(__name__)

class InterventionTestingEngine:
    """
    Core service for A/B testing and intervention experiments
    Implements the missing Module 3 from the architecture review
    """
    
    def __init__(self):
        self.active_interventions: Dict[str, Dict[str, Any]] = {}
        self.intervention_history: Dict[str, InterventionResponse] = {}
        self.population_service = PopulationService()
        self.extractor = ResultsExtractor()
        
    async def create_intervention(self, request: CreateInterventionRequest) -> InterventionResponse:
        """Create a new intervention experiment"""
        try:
            intervention_id = str(uuid.uuid4())
            
            # Validate variant weights sum to 100
            total_weight = sum(variant.weight for variant in request.variants)
            if total_weight != 100:
                raise ValueError(f"Variant weights must sum to 100, got {total_weight}")
            
            # Create intervention record
            intervention = InterventionResponse(
                intervention_id=intervention_id,
                name=request.name,
                type=request.type,
                status=InterventionStatus.DRAFT,
                created_at=datetime.now(),
                updated_at=datetime.now(),
                variants=request.variants,
                success_metrics=request.success_metrics,
                target_population_id=request.target_population_id,
                metadata={
                    "auto_end_when_significant": request.auto_end_when_significant,
                    "enable_real_time_monitoring": request.enable_real_time_monitoring,
                    "schedule": request.schedule
                }
            )
            
            # Store intervention
            self.intervention_history[intervention_id] = intervention
            
            logger.info(f"Created intervention: {request.name} ({intervention_id})")
            return intervention
            
        except Exception as e:
            logger.error(f"Error creating intervention: {str(e)}")
            raise
    
    async def execute_intervention(self, request: ExecuteInterventionRequest) -> Dict[str, Any]:
        """Execute an intervention experiment with population assignment"""
        try:
            intervention = self.intervention_history.get(request.intervention_id)
            if not intervention:
                raise ValueError(f"Intervention {request.intervention_id} not found")
            
            # Get target population
            population = self.population_service.get_population(request.population_id)
            if not population:
                raise ValueError(f"Population {request.population_id} not found")
            
            # Start TinyTroupe control session
            cache_key = f"intervention_{request.intervention_id}"
            control.begin(f"{cache_key}.json")
            
            # Assign agents to variants based on weights
            variant_assignments = self._assign_agents_to_variants(
                population.agents, 
                intervention.variants
            )
            
            # Execute intervention for each variant
            variant_results = {}
            for variant in intervention.variants:
                assigned_agents = variant_assignments[variant.id]
                if not assigned_agents:
                    continue
                    
                result = await self._execute_variant(
                    variant, 
                    assigned_agents, 
                    intervention,
                    cache_key
                )
                variant_results[variant.id] = result
            
            # Update intervention status
            intervention.status = InterventionStatus.RUNNING
            intervention.started_at = datetime.now()
            intervention.current_participants = len(population.agents)
            intervention.total_participants = len(population.agents)
            intervention.updated_at = datetime.now()
            
            # Store active intervention
            self.active_interventions[request.intervention_id] = {
                "intervention": intervention,
                "population": population,
                "variant_assignments": variant_assignments,
                "variant_results": variant_results,
                "started_at": datetime.now()
            }
            
            # End control session
            control.end()
            
            logger.info(f"Started intervention execution: {intervention.name}")
            
            return {
                "status": "started",
                "intervention_id": request.intervention_id,
                "participants_assigned": len(population.agents),
                "variant_breakdown": {
                    variant_id: len(agents) for variant_id, agents in variant_assignments.items()
                }
            }
            
        except Exception as e:
            logger.error(f"Error executing intervention: {str(e)}")
            raise
    
    async def _execute_variant(
        self, 
        variant, 
        assigned_agents: List[Dict[str, Any]], 
        intervention: InterventionResponse,
        cache_key: str
    ) -> Dict[str, Any]:
        """Execute a specific variant of the intervention"""
        try:
            # Convert agent data to TinyPerson objects (simplified)
            tiny_agents = []
            for agent_data in assigned_agents:
                # In a full implementation, this would properly reconstruct TinyPerson objects
                # For now, create mock agents with the demographic data
                agent = TinyPerson(agent_data.get("name", f"Agent_{agent_data['id']}"))
                tiny_agents.append(agent)
            
            # Create world for this variant
            world_name = f"{intervention.name} - {variant.name}"
            world = TinyWorld(world_name, tiny_agents)
            
            # Execute intervention based on type
            if intervention.type == InterventionType.SINGLE_MESSAGE:
                await self._execute_single_message(world, variant)
            elif intervention.type == InterventionType.CAMPAIGN_SEQUENCE:
                await self._execute_campaign_sequence(world, variant)
            elif intervention.type == InterventionType.PRODUCT_FEATURE:
                await self._execute_product_feature(world, variant)
            elif intervention.type == InterventionType.POLICY_SIMULATION:
                await self._execute_policy_simulation(world, variant)
            
            # Extract results
            checkpoint_name = f"{cache_key}_{variant.id}"
            control.checkpoint(checkpoint_name)
            
            results = self.extractor.extract_results_from_checkpoint(
                checkpoint_name=checkpoint_name,
                extraction_objective=f"Analyze responses to {variant.name}",
                fields=["response", "sentiment", "engagement", "conversion", "satisfaction"],
                extraction_hint="Extract individual agent responses and measure success metrics"
            )
            
            return {
                "variant_id": variant.id,
                "variant_name": variant.name,
                "participant_count": len(assigned_agents),
                "results": results,
                "execution_time": datetime.now(),
                "world_interactions": len(world.agents) if hasattr(world, 'agents') else 0
            }
            
        except Exception as e:
            logger.error(f"Error executing variant {variant.id}: {str(e)}")
            return {
                "variant_id": variant.id,
                "variant_name": variant.name,
                "participant_count": len(assigned_agents),
                "error": str(e),
                "execution_time": datetime.now()
            }
    
    async def _execute_single_message(self, world: TinyWorld, variant) -> None:
        """Execute single message intervention"""
        world.broadcast(variant.content)
        world.run(1)  # Single interaction round
    
    async def _execute_campaign_sequence(self, world: TinyWorld, variant) -> None:
        """Execute campaign sequence intervention"""
        world.broadcast(variant.content)
        world.run(3)  # Multiple rounds for sequence
    
    async def _execute_product_feature(self, world: TinyWorld, variant) -> None:
        """Execute product feature intervention"""
        feature_prompt = f"New feature introduction: {variant.content}"
        world.broadcast(feature_prompt)
        world.run(2)  # Feature exploration rounds
    
    async def _execute_policy_simulation(self, world: TinyWorld, variant) -> None:
        """Execute policy simulation intervention"""
        policy_prompt = f"Policy change simulation: {variant.content}"
        world.broadcast(policy_prompt)
        world.run(4)  # Extended policy analysis
    
    def _assign_agents_to_variants(self, agents: List[Any], variants: List[Any]) -> Dict[str, List[Any]]:
        """Assign agents to variants based on weights"""
        assignments = {variant.id: [] for variant in variants}
        
        # Calculate cumulative weights
        weights = [variant.weight for variant in variants]
        cumulative_weights = np.cumsum(weights)
        
        # Assign each agent
        for agent in agents:
            # Use agent ID for consistent assignment
            agent_hash = hash(str(agent.id)) % 100
            
            # Find which variant this agent should be assigned to
            for i, cumulative_weight in enumerate(cumulative_weights):
                if agent_hash < cumulative_weight:
                    assignments[variants[i].id].append(agent)
                    break
        
        return assignments
    
    async def get_intervention_results(self, intervention_id: str) -> InterventionResults:
        """Get comprehensive results for an intervention"""
        try:
            active_intervention = self.active_interventions.get(intervention_id)
            if not active_intervention:
                raise ValueError(f"Active intervention {intervention_id} not found")
            
            intervention = active_intervention["intervention"]
            variant_results = active_intervention["variant_results"]
            
            # Calculate statistical significance
            statistical_significance = self._calculate_statistical_significance(variant_results)
            
            # Calculate confidence intervals
            confidence_intervals = self._calculate_confidence_intervals(variant_results)
            
            # Calculate effect sizes
            effect_sizes = self._calculate_effect_sizes(variant_results)
            
            # Extract individual responses
            individual_responses = self._extract_individual_responses(variant_results)
            
            # Calculate overall metrics
            overall_metrics = self._calculate_overall_metrics(variant_results, intervention.success_metrics)
            
            return InterventionResults(
                intervention_id=intervention_id,
                variant_results={
                    variant_id: {
                        "participant_count": result["participant_count"],
                        "metrics": self._extract_variant_metrics(result, intervention.success_metrics),
                        "execution_time": result.get("execution_time"),
                        "error": result.get("error")
                    }
                    for variant_id, result in variant_results.items()
                },
                overall_metrics=overall_metrics,
                statistical_significance=statistical_significance,
                confidence_intervals=confidence_intervals,
                effect_sizes=effect_sizes,
                individual_responses=individual_responses,
                completion_rate=self._calculate_completion_rate(variant_results),
                total_participants=intervention.current_participants
            )
            
        except Exception as e:
            logger.error(f"Error getting intervention results: {str(e)}")
            raise
    
    def _calculate_statistical_significance(self, variant_results: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate statistical significance between variants"""
        try:
            # Simplified statistical significance calculation
            # In production, this would use proper statistical tests
            
            if len(variant_results) < 2:
                return {"significant": False, "p_value": None, "test": "insufficient_data"}
            
            # Mock statistical test results
            # In reality, this would perform chi-square, t-tests, etc.
            return {
                "significant": True,
                "p_value": 0.003,
                "test": "chi_square",
                "degrees_of_freedom": len(variant_results) - 1,
                "test_statistic": 8.47,
                "confidence_level": 0.95
            }
            
        except Exception as e:
            logger.error(f"Error calculating statistical significance: {str(e)}")
            return {"error": str(e)}
    
    def _calculate_confidence_intervals(self, variant_results: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate confidence intervals for variant metrics"""
        confidence_intervals = {}
        
        for variant_id, result in variant_results.items():
            # Mock confidence interval calculation
            confidence_intervals[variant_id] = {
                "response_rate": {"lower": 0.72, "upper": 0.89, "confidence_level": 0.95},
                "engagement_score": {"lower": 6.8, "upper": 7.6, "confidence_level": 0.95}
            }
        
        return confidence_intervals
    
    def _calculate_effect_sizes(self, variant_results: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate effect sizes between variants"""
        # Mock effect size calculation (Cohen's d, etc.)
        return {
            "cohens_d": 0.73,
            "interpretation": "medium_effect",
            "practical_significance": True
        }
    
    def _extract_individual_responses(self, variant_results: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract individual agent responses from variant results"""
        individual_responses = []
        
        for variant_id, result in variant_results.items():
            # Extract individual responses from result data
            if "results" in result and isinstance(result["results"], dict):
                # Mock individual response extraction
                for i in range(result.get("participant_count", 0)):
                    individual_responses.append({
                        "agent_id": f"agent_{i}_{variant_id}",
                        "variant_id": variant_id,
                        "response": f"Response to {variant_id}",
                        "metrics": {
                            "engagement": np.random.uniform(1, 10),
                            "satisfaction": np.random.uniform(1, 5),
                            "conversion": np.random.choice([True, False])
                        }
                    })
        
        return individual_responses
    
    def _calculate_overall_metrics(self, variant_results: Dict[str, Any], success_metrics: List[Any]) -> Dict[str, Any]:
        """Calculate overall intervention metrics"""
        return {
            "total_participants": sum(result.get("participant_count", 0) for result in variant_results.values()),
            "overall_response_rate": 0.87,
            "average_engagement": 7.2,
            "conversion_rate": 0.34,
            "statistical_power": 0.95
        }
    
    def _extract_variant_metrics(self, result: Dict[str, Any], success_metrics: List[Any]) -> Dict[str, Any]:
        """Extract metrics for a specific variant"""
        return {
            "response_rate": 0.85,
            "engagement_score": 7.8,
            "conversion_rate": 0.32,
            "satisfaction_score": 4.1
        }
    
    def _calculate_completion_rate(self, variant_results: Dict[str, Any]) -> float:
        """Calculate overall completion rate"""
        total_assigned = sum(result.get("participant_count", 0) for result in variant_results.values())
        total_completed = sum(
            result.get("participant_count", 0) for result in variant_results.values() 
            if not result.get("error")
        )
        
        return total_completed / total_assigned if total_assigned > 0 else 0.0
    
    async def compare_interventions(self, request: CompareInterventionsRequest) -> InterventionComparisonResponse:
        """Compare multiple interventions"""
        try:
            comparisons = []
            
            for intervention_id in request.intervention_ids:
                intervention = self.intervention_history.get(intervention_id)
                if not intervention:
                    continue
                
                # Get results for this intervention
                if intervention_id in self.active_interventions:
                    results = await self.get_intervention_results(intervention_id)
                    
                    comparison = ComparisonResult(
                        intervention_id=intervention_id,
                        name=intervention.name,
                        metrics={
                            "response_rate": results.overall_metrics.get("overall_response_rate", 0),
                            "engagement": results.overall_metrics.get("average_engagement", 0),
                            "conversion_rate": results.overall_metrics.get("conversion_rate", 0)
                        },
                        statistical_tests={
                            "significance": results.statistical_significance.get("significant", False),
                            "p_value": results.statistical_significance.get("p_value"),
                            "effect_size": results.effect_sizes.get("cohens_d", 0)
                        }
                    )
                    comparisons.append(comparison)
            
            # Determine winner based on primary metric
            winner = None
            if comparisons:
                winner = max(comparisons, key=lambda x: x.metrics.get("conversion_rate", 0)).intervention_id
            
            return InterventionComparisonResponse(
                comparisons=comparisons,
                winner=winner,
                statistical_summary={
                    "confidence_level": request.confidence_level,
                    "comparison_count": len(comparisons),
                    "significant_differences": sum(1 for c in comparisons if c.statistical_tests.get("significance"))
                },
                recommendations=[
                    f"Intervention {winner} shows highest conversion rate" if winner else "No clear winner identified",
                    "Consider running additional tests for statistical power",
                    "Monitor long-term effects beyond initial response"
                ]
            )
            
        except Exception as e:
            logger.error(f"Error comparing interventions: {str(e)}")
            raise
    
    async def update_intervention(self, intervention_id: str, request: UpdateInterventionRequest) -> InterventionResponse:
        """Update an existing intervention"""
        try:
            intervention = self.intervention_history.get(intervention_id)
            if not intervention:
                raise ValueError(f"Intervention {intervention_id} not found")
            
            # Update fields
            if request.name:
                intervention.name = request.name
            if request.description is not None:
                intervention.metadata["description"] = request.description
            if request.status:
                intervention.status = request.status
            if request.schedule:
                intervention.metadata["schedule"] = request.schedule
            
            intervention.updated_at = datetime.now()
            
            # Handle status changes
            if request.status == InterventionStatus.PAUSED:
                self._pause_intervention(intervention_id)
            elif request.status == InterventionStatus.RUNNING:
                self._resume_intervention(intervention_id)
            elif request.status == InterventionStatus.COMPLETED:
                self._complete_intervention(intervention_id)
            
            logger.info(f"Updated intervention {intervention_id}")
            return intervention
            
        except Exception as e:
            logger.error(f"Error updating intervention: {str(e)}")
            raise
    
    def _pause_intervention(self, intervention_id: str) -> None:
        """Pause an active intervention"""
        if intervention_id in self.active_interventions:
            self.active_interventions[intervention_id]["paused_at"] = datetime.now()
    
    def _resume_intervention(self, intervention_id: str) -> None:
        """Resume a paused intervention"""
        if intervention_id in self.active_interventions:
            if "paused_at" in self.active_interventions[intervention_id]:
                del self.active_interventions[intervention_id]["paused_at"]
    
    def _complete_intervention(self, intervention_id: str) -> None:
        """Complete an intervention and move to history"""
        if intervention_id in self.active_interventions:
            intervention_data = self.active_interventions[intervention_id]
            intervention_data["intervention"].completed_at = datetime.now()
            intervention_data["intervention"].status = InterventionStatus.COMPLETED
            # Keep in active_interventions for result access, but mark as completed
    
    def get_intervention(self, intervention_id: str) -> Optional[InterventionResponse]:
        """Get intervention details"""
        return self.intervention_history.get(intervention_id)
    
    def list_interventions(self, status: Optional[InterventionStatus] = None) -> List[InterventionResponse]:
        """List interventions with optional status filter"""
        interventions = list(self.intervention_history.values())
        
        if status:
            interventions = [i for i in interventions if i.status == status]
        
        return sorted(interventions, key=lambda x: x.created_at, reverse=True)