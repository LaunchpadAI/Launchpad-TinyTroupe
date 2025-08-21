"""
Simulation service for running TinyTroupe simulations
"""

import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime

import tinytroupe
from tinytroupe.environment import TinyWorld
from tinytroupe.extraction import ResultsExtractor, ResultsReducer
from tinytroupe.agent import TinyPerson
import tinytroupe.control as control

from ..models.simulation import SimulationRequest, SimulationRequestLegacy, SimulationResponse, ParticipantConfig


class SimulationService:
    """Service for managing TinyTroupe simulations"""
    
    def __init__(self):
        self.active_simulations: Dict[str, Dict[str, Any]] = {}
        self.extractor = ResultsExtractor()
        self.reducer = ResultsReducer()
        # Ensure cache directory exists
        import os
        os.makedirs("cache/sessions", exist_ok=True)
    
    def run_simulation(self, request: SimulationRequest, agents: List[TinyPerson]) -> SimulationResponse:
        """Run a complete simulation with the given parameters"""
        simulation_id = str(uuid.uuid4())
        session_cache_file = f"cache/sessions/sim_{simulation_id}.json"
        
        try:
            # Start session-scoped cache
            control.begin(cache_file=session_cache_file, cache=True)
            
            # Create world and add agents
            world = TinyWorld(f"Simulation_{simulation_id}")
            for agent in agents:
                world.add_agent(agent)
            
            # Store simulation state
            self.active_simulations[simulation_id] = {
                "world": world,
                "request": request,
                "status": "running",
                "started_at": datetime.now(),
                "interactions": []
            }
            
            # Present stimulus
            world.broadcast(request.stimulus.content)
            
            # Run interaction rounds
            interactions = []
            for round_num in range(request.interaction.max_rounds):
                world.run(1)
                
                # Capture interactions
                round_interactions = world.get_agent_interactions()
                interactions.extend(round_interactions)
                
                # Store in simulation state
                self.active_simulations[simulation_id]["interactions"].extend(round_interactions)
            
            # Extract results following TinyTroupe patterns
            extracted_results = None
            checkpoint_name = None
            
            if request.extraction.extract_results:
                try:
                    extracted_results = self._extract_results(
                        agents,
                        request.extraction.extraction_objective,
                        request.extraction.result_type
                    )
                    print(f"DEBUG: Results extraction completed")
                except Exception as e:
                    print(f"DEBUG: Results extraction failed: {str(e)}")
                    raise
            
            # Optional: Create a checkpoint for state preservation
            # (Not needed for extraction, but useful for resuming simulations)
            if hasattr(request.extraction, 'save_checkpoint') and request.extraction.save_checkpoint:
                checkpoint_name = f"sim_{simulation_id}_checkpoint"
                try:
                    control.checkpoint(checkpoint_name)
                    print(f"DEBUG: Checkpoint saved: {checkpoint_name}")
                except Exception as e:
                    print(f"DEBUG: Checkpoint creation failed: {str(e)}")
                    # Don't fail the simulation if checkpoint fails
                    checkpoint_name = None
            
            # Update simulation status
            self.active_simulations[simulation_id]["status"] = "completed"
            
            return SimulationResponse(
                simulation_id=simulation_id,
                status="completed",
                checkpoint_name=checkpoint_name,
                interactions=interactions,
                extracted_results=extracted_results
            )
            
        except Exception as e:
            self.active_simulations[simulation_id]["status"] = "failed"
            raise Exception(f"Simulation failed: {str(e)}")
        finally:
            # Always end the session to clean up
            try:
                control.end()
            except:
                pass
    
    def _extract_results(self, agents: List[TinyPerson], objective: str, result_type: str) -> Dict[str, Any]:
        """Extract structured results from simulation following TinyTroupe patterns"""
        try:
            # Extract results from agents following TinyTroupe notebook patterns
            # Use the first agent as the rapporteur (like in Product Brainstorming example)
            rapporteur = agents[0] if agents else None
            if not rapporteur:
                return {"error": "No agents available for results extraction"}
            
            print(f"DEBUG: Extracting results from agent: {rapporteur.name}")
            print(f"DEBUG: Extraction objective: {objective}")
            
            # First, ask the rapporteur to consolidate the discussion
            consolidation_prompt = (
                "Can you please consolidate the discussion and opinions that were shared? "
                "Provide detailed insights on each perspective, including key points and concerns."
            )
            rapporteur.listen_and_act(consolidation_prompt)
            
            # Extract results from the rapporteur agent (TinyTroupe pattern from examples)
            extraction_results = self.extractor.extract_results_from_agent(
                rapporteur,
                extraction_objective=objective,
                situation="A focus group or simulation session to gather opinions and insights."
            )
            
            print(f"DEBUG: Raw extraction results: {extraction_results}")
            
            # Process results with statistical analysis
            processed_results = self._process_extraction_results(extraction_results, result_type)
            
            print(f"DEBUG: Processed results: {processed_results}")
            
            return processed_results
                
        except Exception as e:
            print(f"DEBUG: Exception in _extract_results: {str(e)}")
            import traceback
            traceback.print_exc()
            return {"error": f"Failed to extract results: {str(e)}"}
    
    def _process_extraction_results(self, raw_results: Dict[str, Any], result_type: str) -> Dict[str, Any]:
        """Process extraction results with statistical analysis and formatting"""
        try:
            processed = {
                "raw_data": raw_results,
                "statistical_analysis": self._calculate_statistics(raw_results),
                "individual_responses": self._extract_individual_responses(raw_results),
                "aggregate_insights": self._extract_aggregate_insights(raw_results),
                "sentiment_distribution": self._analyze_sentiment(raw_results),
                "key_themes": self._extract_themes(raw_results)
            }
            
            # Format based on result type
            if result_type == "structured":
                return processed
            elif result_type == "dataframe":
                return self._convert_to_dataframe_format(processed)
            elif result_type == "json":
                # ResultsReducer doesn't have reduce_agent_responses, just return processed
                return processed
            else:
                return processed
                
        except Exception as e:
            return {"error": f"Failed to process results: {str(e)}", "raw_data": raw_results}
    
    def _calculate_statistics(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate statistical measures for simulation results"""
        try:
            stats = {
                "total_participants": 0,
                "total_responses": 0,
                "average_response_length": 0,
                "response_rate": 0,
                "completion_rate": 100  # Default to 100% for completed simulations
            }
            
            # Extract participant data
            if isinstance(results, dict) and "participants" in results:
                participants = results["participants"]
                if isinstance(participants, list):
                    stats["total_participants"] = len(participants)
                    
                    response_lengths = []
                    response_count = 0
                    
                    for participant in participants:
                        if isinstance(participant, dict) and "responses" in participant:
                            responses = participant["responses"]
                            if isinstance(responses, list):
                                response_count += len(responses)
                                for response in responses:
                                    if isinstance(response, str):
                                        response_lengths.append(len(response))
                    
                    stats["total_responses"] = response_count
                    if response_lengths:
                        stats["average_response_length"] = sum(response_lengths) / len(response_lengths)
                    if stats["total_participants"] > 0:
                        stats["response_rate"] = (response_count / stats["total_participants"]) * 100
            
            return stats
            
        except Exception as e:
            return {"error": f"Statistics calculation failed: {str(e)}"}
    
    def _extract_individual_responses(self, results: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract individual agent responses for drill-down analysis"""
        try:
            individual_responses = []
            
            if isinstance(results, dict) and "participants" in results:
                participants = results["participants"]
                if isinstance(participants, list):
                    for i, participant in enumerate(participants):
                        if isinstance(participant, dict):
                            individual_responses.append({
                                "participant_id": participant.get("id", f"participant_{i}"),
                                "name": participant.get("name", f"Participant {i+1}"),
                                "responses": participant.get("responses", []),
                                "sentiment": participant.get("sentiment", "neutral"),
                                "key_points": participant.get("key_points", []),
                                "engagement_score": self._calculate_engagement_score(participant),
                                "demographic_info": participant.get("demographics", {})
                            })
            
            return individual_responses
            
        except Exception as e:
            return [{"error": f"Individual response extraction failed: {str(e)}"}]
    
    def _extract_aggregate_insights(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """Extract aggregate insights and patterns"""
        try:
            insights = {
                "consensus_themes": [],
                "conflicting_opinions": [],
                "majority_sentiment": "neutral",
                "key_insights": [],
                "demographic_patterns": {}
            }
            
            # This would involve more sophisticated analysis
            # For now, return basic structure
            if isinstance(results, dict):
                insights["key_insights"] = results.get("key_insights", ["Simulation completed successfully"])
            
            return insights
            
        except Exception as e:
            return {"error": f"Aggregate analysis failed: {str(e)}"}
    
    def _analyze_sentiment(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze sentiment distribution across responses"""
        try:
            sentiment_counts = {"positive": 0, "negative": 0, "neutral": 0}
            total_responses = 0
            
            # Basic sentiment analysis - in real implementation would use NLP
            if isinstance(results, dict) and "participants" in results:
                participants = results["participants"]
                if isinstance(participants, list):
                    for participant in participants:
                        if isinstance(participant, dict):
                            sentiment = participant.get("sentiment", "neutral")
                            if sentiment in sentiment_counts:
                                sentiment_counts[sentiment] += 1
                            total_responses += 1
            
            # Calculate percentages
            sentiment_distribution = {}
            if total_responses > 0:
                for sentiment, count in sentiment_counts.items():
                    sentiment_distribution[sentiment] = {
                        "count": count,
                        "percentage": (count / total_responses) * 100
                    }
            
            return {
                "distribution": sentiment_distribution,
                "total_analyzed": total_responses,
                "dominant_sentiment": max(sentiment_counts, key=sentiment_counts.get) if total_responses > 0 else "neutral"
            }
            
        except Exception as e:
            return {"error": f"Sentiment analysis failed: {str(e)}"}
    
    def _extract_themes(self, results: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract key themes from responses"""
        try:
            themes = []
            
            # Basic theme extraction - in real implementation would use NLP
            common_themes = [
                {"theme": "Product Quality", "frequency": 0, "examples": []},
                {"theme": "Price Sensitivity", "frequency": 0, "examples": []},
                {"theme": "User Experience", "frequency": 0, "examples": []},
                {"theme": "Brand Perception", "frequency": 0, "examples": []}
            ]
            
            return common_themes
            
        except Exception as e:
            return [{"error": f"Theme extraction failed: {str(e)}"}]
    
    def _calculate_engagement_score(self, participant: Dict[str, Any]) -> float:
        """Calculate engagement score for a participant"""
        try:
            score = 0.0
            
            # Basic engagement scoring
            responses = participant.get("responses", [])
            if responses:
                score += min(len(responses) * 0.2, 1.0)  # Response count
                
                avg_length = sum(len(str(r)) for r in responses) / len(responses)
                score += min(avg_length / 100, 0.5)  # Response depth
            
            return min(score, 1.0)
            
        except:
            return 0.5  # Default engagement score
    
    def _convert_to_dataframe_format(self, processed_results: Dict[str, Any]) -> Dict[str, Any]:
        """Convert results to DataFrame-compatible format"""
        try:
            individual_data = []
            
            for response in processed_results.get("individual_responses", []):
                individual_data.append({
                    "participant_id": response.get("participant_id"),
                    "name": response.get("name"),
                    "sentiment": response.get("sentiment"),
                    "engagement_score": response.get("engagement_score"),
                    "response_count": len(response.get("responses", [])),
                    "key_points_count": len(response.get("key_points", []))
                })
            
            return {
                "tabular_data": individual_data,
                "columns": ["participant_id", "name", "sentiment", "engagement_score", "response_count", "key_points_count"],
                "summary_statistics": processed_results.get("statistical_analysis", {}),
                "export_ready": True
            }
            
        except Exception as e:
            return {"error": f"DataFrame conversion failed: {str(e)}"}
    
    def get_simulation_status(self, simulation_id: str) -> Optional[Dict[str, Any]]:
        """Get the status of a simulation"""
        simulation = self.active_simulations.get(simulation_id)
        if not simulation:
            return None
            
        return {
            "simulation_id": simulation_id,
            "status": simulation["status"],
            "started_at": simulation["started_at"].isoformat(),
            "interaction_count": len(simulation["interactions"])
        }
    
    def stop_simulation(self, simulation_id: str) -> bool:
        """Stop a running simulation"""
        if simulation_id in self.active_simulations:
            self.active_simulations[simulation_id]["status"] = "stopped"
            return True
        return False
    
    def run_legacy_simulation(self, request: SimulationRequestLegacy, agents: List[TinyPerson]) -> SimulationResponse:
        """Run simulation following TinyTroupe example patterns exactly"""
        simulation_id = str(uuid.uuid4())
        
        try:
            # Clear any existing agents to avoid conflicts
            control.reset()
            control.begin(cache_path="./tinytroupe-api-cache.json")
            
            # Create world following TinyTroupe example pattern
            # For focus groups: broadcast_if_no_target=True (agents talk to each other)
            # For surveys: broadcast_if_no_target=False (agents don't see each other's responses)
            broadcast_to_others = request.simulation_type == "focus_group"
            
            world = TinyWorld(f"Simulation_{simulation_id}", agents, broadcast_if_no_target=broadcast_to_others)
            
            # Store simulation state
            self.active_simulations[simulation_id] = {
                "world": world,
                "request": request,
                "status": "running",
                "started_at": datetime.now(),
                "interactions": []
            }
            
            # Present stimulus using TinyTroupe broadcast pattern
            world.broadcast(request.stimulus.content)
            
            # Add inner thought for more realistic responses (like TinyTroupe examples)
            if request.simulation_type == "focus_group":
                inner_thought = """
                I will engage authentically in this focus group discussion. I'll share my honest opinions 
                and react naturally to what others say, while staying true to my personality and background.
                """
            else:
                inner_thought = """
                I will be honest as I understand they are not here to judge me, but just to learn from me. 
                I'll consider my personal situation, preferences, and experiences when responding.
                """
            
            world.broadcast_thought(inner_thought)
            
            # Run simulation following TinyTroupe pattern - single run call
            world.run(request.interaction_config.rounds)
            
            # Extract interactions from agent memories
            interactions = []
            for i, agent in enumerate(agents):
                if hasattr(agent, 'episodic_memory') and agent.episodic_memory.retrieve_all():
                    memories = agent.episodic_memory.retrieve_all()
                    for j, memory in enumerate(memories):
                        interaction = {
                            "round": 1,  # TinyTroupe doesn't track rounds this way
                            "agent": agent.name,
                            "content": str(memory),
                            "timestamp": datetime.now().isoformat(),
                            "memory_index": j
                        }
                        interactions.append(interaction)
                        self.active_simulations[simulation_id]["interactions"].append(interaction)
            
            # Extract results if requested
            extracted_results = None
            checkpoint_name = None
            if request.extraction_config.extract_results:
                try:
                    extracted_results = self._extract_results(
                        agents,
                        request.extraction_config.extraction_objective,
                        request.extraction_config.result_type
                    )
                    print(f"DEBUG: Results extraction completed")
                except Exception as e:
                    print(f"DEBUG: Results extraction failed: {str(e)}")
                    raise
            
            # Update simulation status
            self.active_simulations[simulation_id]["status"] = "completed"
            
            return SimulationResponse(
                simulation_id=simulation_id,
                status="completed",
                checkpoint_name=checkpoint_name if extracted_results else None,
                interactions=interactions,
                extracted_results=extracted_results,
                participants=[agent.name for agent in agents],
                results={"interactions": interactions, "extracted_results": extracted_results}
            )
            
        except Exception as e:
            self.active_simulations[simulation_id]["status"] = "failed"
            raise Exception(f"Simulation failed: {str(e)}")