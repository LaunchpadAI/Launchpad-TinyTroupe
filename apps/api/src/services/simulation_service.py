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

from ..models.simulation import SimulationRequest, SimulationResponse


class SimulationService:
    """Service for managing TinyTroupe simulations"""
    
    def __init__(self):
        self.active_simulations: Dict[str, Dict[str, Any]] = {}
        self.extractor = ResultsExtractor()
        self.reducer = ResultsReducer()
        # Ensure cache directory exists
        import os
        os.makedirs("cache/sessions", exist_ok=True)
    
    
    def _convert_actions_to_interactions(self, actions_over_time: List[Dict], conversation_content: str) -> List[Dict[str, Any]]:
        """Extract clean interactions from TinyTroupe's chronological action data"""
        interactions = []
        
        # Use actions_over_time for accurate chronological order if available
        if actions_over_time:
            print(f"DEBUG: Using TinyTroupe's chronological action data ({len(actions_over_time)} actions)")
            interactions = self._parse_actions_chronologically(actions_over_time)
        else:
            # Fallback to parsing formatted output (less accurate for conversation flow)
            print(f"DEBUG: Fallback to parsing formatted conversation content")
            print(f"DEBUG: Conversation content length: {len(conversation_content) if conversation_content else 0}")
            
            if conversation_content:
                interactions = self._parse_tinytroupe_formatted_output(conversation_content)
        
        return interactions
    
    def _parse_actions_chronologically(self, actions_over_time: List[Dict]) -> List[Dict[str, Any]]:
        """Parse TinyTroupe's chronological action data to preserve conversation flow"""
        interactions = []
        
        print(f"DEBUG: Processing {len(actions_over_time)} chronological actions")
        
        # TinyTroupe structure: [{agent_name: [{action: {type: 'TALK', content: '...'}, ...}, ...]}, ...]
        # We need to extract all TALK actions in chronological order across all agents and rounds
        
        for round_number, round_data in enumerate(actions_over_time, 1):
            # round_data is a dict like {'Tony Parker_xxx': [...], 'Kenny Pickett_xxx': [...]}
            if isinstance(round_data, dict):
                # Collect all TALK actions from all agents in this round
                round_talks = []
                
                for agent_name, agent_actions in round_data.items():
                    if isinstance(agent_actions, list):
                        for action_data in agent_actions:
                            if isinstance(action_data, dict) and 'action' in action_data:
                                action = action_data['action']
                                if isinstance(action, dict) and action.get('type') == 'TALK':
                                    # Clean agent name (remove unique suffix)
                                    import re
                                    clean_agent_name = re.sub(r'_[a-f0-9]{8}$', '', agent_name)
                                    
                                    content = action.get('content', '').strip()
                                    if len(content) > 10:  # Only meaningful content
                                        round_talks.append({
                                            "round": round_number,
                                            "agent": clean_agent_name,
                                            "content": content,
                                            "timestamp": datetime.now().isoformat(),
                                            "type": "agent_contribution",
                                            "action_type": "TALK"
                                        })
                
                # Add all talks from this round in agent order (preserves TinyTroupe's natural flow)
                interactions.extend(round_talks)
        
        print(f"DEBUG: Extracted {len(interactions)} chronological interactions from actions")
        return interactions
    
    def _is_talk_action(self, action: Dict) -> bool:
        """Check if action is a TALK action"""
        if not isinstance(action, dict):
            return False
        
        # Check for TinyTroupe action structure
        action_type = action.get('type', '').upper()
        action_name = action.get('action', {}).get('type', '').upper() if isinstance(action.get('action'), dict) else ''
        
        return action_type == 'TALK' or action_name == 'TALK'
    
    def _extract_interaction_from_action(self, action: Dict, round_number: int) -> Dict[str, Any]:
        """Extract interaction data from a TinyTroupe action"""
        try:
            # Extract agent name (clean of unique suffixes)
            agent_name = action.get('agent', action.get('source', 'Unknown'))
            # Remove unique suffix pattern (e.g., "_a1b2c3d4")
            import re
            clean_agent_name = re.sub(r'_[a-f0-9]{8}$', '', agent_name)
            
            # Extract action content
            content = ''
            if 'action' in action and isinstance(action['action'], dict):
                # Structured action format
                content = action['action'].get('content', action['action'].get('text', ''))
            else:
                # Direct content format
                content = action.get('content', action.get('text', ''))
            
            if not content or len(content.strip()) < 10:
                return None
            
            return {
                "round": round_number,
                "agent": clean_agent_name,
                "content": content.strip(),
                "timestamp": action.get('timestamp', datetime.now().isoformat()),
                "type": "agent_contribution",
                "action_type": "TALK"
            }
            
        except Exception as e:
            print(f"DEBUG: Error extracting interaction from action: {str(e)}")
            return None
    
    def _parse_tinytroupe_formatted_output(self, conversation_content: str) -> List[Dict[str, Any]]:
        """Parse TinyTroupe's Rich-formatted pretty_current_interactions output"""
        import re
        interactions = []
        
        if not conversation_content:
            return interactions
        
        # Remove ANSI escape codes from Rich formatting
        ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')
        clean_content = ansi_escape.sub('', conversation_content)
        
        # Remove Rich styling markup but preserve action tags like [TALK], [DONE], [THINK]
        # Remove tags like [bold green3], [underline], [/] but keep [TALK], [DONE], etc.
        style_markup = re.compile(r'\[(?!(?:TALK|DONE|THINK|LISTEN)\])[^]]*\]')
        clean_content = style_markup.sub('', clean_content)
        
        # Debug: Show more context around "acts" lines to understand content structure
        lines = clean_content.split('\n')
        acts_line_indices = [i for i, line in enumerate(lines) if 'acts' in line.lower()][:5]
        
        for i in acts_line_indices:
            context_start = max(0, i-2)
            context_end = min(len(lines), i+5)
            context_lines = lines[context_start:context_end]
            print(f"DEBUG: Context around acts line {i}: {context_lines}")
        
        # TinyTroupe's _pretty_action creates patterns like:
        # "Agent Name acts: [TALK] \n                          > content line 1\n                          > content line 2\n..."
        # Capture all lines that start with whitespace and '>' after [TALK]
        
        talk_action_pattern = r'([A-Za-z\s]+?)(?:_[a-f0-9]{8})?\s+acts:\s*\[TALK\]\s*\n((?:\s*>\s*[^\n]*\n?)+)'
        talk_matches = re.findall(talk_action_pattern, clean_content, re.MULTILINE | re.DOTALL)
        
        print(f"DEBUG: Found {len(talk_matches)} TALK actions in formatted output")
        
        for i, (agent_name, content) in enumerate(talk_matches, 1):
            # Clean up agent name and content
            clean_agent_name = agent_name.strip()
            
            # Process multi-line indented content: remove '>' markers and join lines
            content_lines = []
            for line in content.split('\n'):
                line = line.strip()
                if line.startswith('>'):
                    content_lines.append(line[1:].strip())
                elif line:  # Non-empty line without '>'
                    content_lines.append(line)
            
            clean_content = ' '.join(content_lines).strip()
            
            if len(clean_content) > 10:  # Only meaningful content
                print(f"DEBUG: Extracted TALK from {clean_agent_name}: {clean_content[:50]}...")
                interactions.append({
                    "round": i,  # NOTE: This is sequential, not true conversation rounds (fallback only)
                    "agent": clean_agent_name,
                    "content": clean_content,
                    "timestamp": datetime.now().isoformat(),
                    "type": "agent_contribution",
                    "action_type": "TALK"
                })
        
        print(f"DEBUG: Total TinyTroupe-formatted interactions extracted: {len(interactions)}")
        return interactions
    
    def _parse_conversation_fallback(self, conversation_content: str) -> List[Dict[str, Any]]:
        """Fallback parser for when action data is not available"""
        import re
        
        if not conversation_content:
            return []
            
        # Simple extraction of agent TALK actions from pretty output
        # Look for patterns like "Agent acts: [TALK] content"
        talk_pattern = r'([^\n]+) acts: \[TALK\]\s*\n\s*>\s*([^>]*?)(?=\n[A-Z]|\n\n|\Z)'
        matches = re.findall(talk_pattern, conversation_content, re.MULTILINE | re.DOTALL)
        
        interactions = []
        for i, (agent_line, content) in enumerate(matches, 1):
            # Extract clean agent name
            agent_match = re.search(r'([A-Za-z\s]+?)(?:_[a-f0-9]{8})?$', agent_line.strip())
            if agent_match:
                clean_agent_name = agent_match.group(1).strip()
                
                # Clean up content
                clean_content = re.sub(r'\s*>\s*', ' ', content)
                clean_content = ' '.join(clean_content.split())  # Normalize whitespace
                
                if len(clean_content) > 10:  # Only meaningful content
                    interactions.append({
                        "round": i,
                        "agent": clean_agent_name,
                        "content": clean_content,
                        "timestamp": datetime.now().isoformat(),
                        "type": "agent_contribution",
                        "action_type": "TALK"
                    })
        
        return interactions
    
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
            
            # Handle Document.text property setter issues without modifying TinyTroupe
            # We'll temporarily disable semantic memory to avoid the read-only Document.text property issue
            original_semantic_memory = None
            original_disable_semantic = getattr(rapporteur, '_disable_semantic_memory', False)
            
            try:
                # If agent has semantic memory, temporarily disable it to avoid Document.text errors
                if hasattr(rapporteur, 'semantic_memory') and rapporteur.semantic_memory is not None:
                    original_semantic_memory = rapporteur.semantic_memory
                    rapporteur.semantic_memory = None
                    # Also set the disable flag if it exists
                    if hasattr(rapporteur, '_disable_semantic_memory'):
                        rapporteur._disable_semantic_memory = True
                
                # First, ask the rapporteur to consolidate the discussion
                consolidation_prompt = (
                    "Can you please consolidate the discussion and opinions that were shared? "
                    "Provide detailed insights on each perspective, including key points and concerns."
                )
                rapporteur.listen_and_act(consolidation_prompt)
                
            except Exception as doc_error:
                # If we still get Document errors, catch them and continue with extraction
                print(f"DEBUG: Document consolidation failed, continuing with extraction: {str(doc_error)}")
                # Don't re-raise - we can still try extraction without consolidation
                
            finally:
                # Restore original semantic memory state
                if original_semantic_memory is not None:
                    rapporteur.semantic_memory = original_semantic_memory
                if hasattr(rapporteur, '_disable_semantic_memory'):
                    rapporteur._disable_semantic_memory = original_disable_semantic
            
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
    
    def run_simulation(self, request: SimulationRequest, agents: List[TinyPerson]) -> SimulationResponse:
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
            
            # Run simulation following TinyTroupe focus group pattern
            # Single run call with user-specified rounds and capture actions
            actions_over_time = world.run(request.interaction_config.rounds, return_actions=True)
            
            # Get the full conversation content for UI display
            conversation_content = world.pretty_current_interactions(simplified=True, skip_system=True)
            
            # Convert actions to interactions format for API compatibility
            interactions = self._convert_actions_to_interactions(actions_over_time, conversation_content)
            
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