"""
Research and testing service
"""

import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime

from tinytroupe.environment import TinyWorld
from tinytroupe.agent import TinyPerson
from tinytroupe.extraction import ResultsExtractor, ResultsReducer
from tinytroupe.steering import TinyStory
import tinytroupe.control as control

from ..models.research import (
    ProductEvaluationRequest,
    AdvertisementTestRequest,
    CustomerInterviewRequest,
    BrainstormingRequest,
    StorytellingRequest
)


class ResearchService:
    """Service for market research and testing operations"""
    
    def __init__(self):
        self.extractor = ResultsExtractor()
        self.reducer = ResultsReducer()
        self.active_sessions: Dict[str, Dict[str, Any]] = {}
    
    def evaluate_product(self, request: ProductEvaluationRequest, agents: List[TinyPerson]) -> Dict[str, Any]:
        """Conduct product evaluation with specified agents"""
        session_id = str(uuid.uuid4())
        
        # Create evaluation world
        world = TinyWorld(f"ProductEval_{session_id}")
        for agent in agents:
            world.add_agent(agent)
        
        # Store session
        self.active_sessions[session_id] = {
            "type": "product_evaluation",
            "world": world,
            "request": request,
            "started_at": datetime.now()
        }
        
        try:
            # Present product information
            product_info = f"""
            Product: {request.product_name}
            Description: {request.product_description}
            Evaluation Criteria: {', '.join(request.evaluation_criteria)}
            """
            
            if request.target_demographic:
                product_info += f"\nTarget Demographic: {request.target_demographic}"
            
            if request.comparison_products:
                product_info += f"\nComparison Products: {', '.join(request.comparison_products)}"
            
            world.broadcast(product_info)
            
            # Run evaluation rounds
            interactions = []
            for round_num in range(request.interaction_rounds):
                world.run(1)
                round_interactions = world.get_agent_interactions()
                interactions.extend(round_interactions)
            
            # Extract insights
            results = {}
            checkpoint_name = f"product_eval_{session_id}"
            control.checkpoint(checkpoint_name)
            
            if request.extract_insights:
                extraction_objective = f"Extract structured insights about {request.product_name} evaluation based on criteria: {', '.join(request.evaluation_criteria)}"
                insights = self.extractor.extract_results_from_checkpoint(
                    checkpoint_name=checkpoint_name,
                    extraction_objective=extraction_objective
                )
                results["insights"] = insights
            
            if request.include_individual_feedback:
                individual_feedback = {}
                for agent in agents:
                    feedback = agent.get_feedback_on_product(request.product_name)
                    individual_feedback[agent.name] = feedback
                results["individual_feedback"] = individual_feedback
            
            if request.include_group_consensus:
                consensus = self._extract_group_consensus(interactions, request.product_name)
                results["group_consensus"] = consensus
            
            results.update({
                "session_id": session_id,
                "product_name": request.product_name,
                "evaluation_criteria": request.evaluation_criteria,
                "interactions": interactions,
                "participants": [agent.name for agent in agents]
            })
            
            return results
            
        except Exception as e:
            raise Exception(f"Product evaluation failed: {str(e)}")
    
    def test_advertisement(self, request: AdvertisementTestRequest, agents: List[TinyPerson]) -> Dict[str, Any]:
        """Test advertisement with focus group"""
        session_id = str(uuid.uuid4())
        
        world = TinyWorld(f"AdTest_{session_id}")
        for agent in agents:
            world.add_agent(agent)
        
        # Present advertisement
        ad_presentation = f"""
        Advertisement Content: {request.advertisement_content}
        Target Audience: {request.target_audience}
        
        Please review this advertisement and provide your feedback.
        """
        
        world.broadcast(ad_presentation)
        
        # Run focus group discussion
        interactions = []
        for round_num in range(3):  # Standard 3 rounds for ad testing
            world.run(1)
            round_interactions = world.get_agent_interactions()
            interactions.extend(round_interactions)
        
        # Extract results
        checkpoint_name = f"ad_test_{session_id}"
        control.checkpoint(checkpoint_name)
        
        results = self.extractor.extract_results_from_checkpoint(
            checkpoint_name=checkpoint_name,
            extraction_objective=f"Extract advertisement feedback and effectiveness insights"
        )
        
        return {
            "session_id": session_id,
            "advertisement_content": request.advertisement_content,
            "target_audience": request.target_audience,
            "interactions": interactions,
            "results": results,
            "participants": [agent.name for agent in agents]
        }
    
    def conduct_customer_interview(self, request: CustomerInterviewRequest, agent: TinyPerson) -> Dict[str, Any]:
        """Conduct customer interview with single agent"""
        session_id = str(uuid.uuid4())
        
        # Prepare interview context
        interview_context = f"""
        Product/Service: {request.product_or_service}
        Customer Profile: {request.customer_profile}
        
        You are being interviewed about your experience with {request.product_or_service}.
        Please respond as someone who fits this profile: {request.customer_profile}
        """
        
        agent.listen_and_act(interview_context)
        
        # Conduct interview
        interview_responses = []
        for question in request.interview_questions:
            agent.listen_and_act(f"Interview Question: {question}")
            response = agent.get_last_response()
            interview_responses.append({
                "question": question,
                "response": response
            })
        
        return {
            "session_id": session_id,
            "product_or_service": request.product_or_service,
            "customer_profile": request.customer_profile,
            "interview_responses": interview_responses,
            "participant": agent.name
        }
    
    def run_brainstorming(self, request: BrainstormingRequest, agents: List[TinyPerson]) -> Dict[str, Any]:
        """Run collaborative brainstorming session"""
        session_id = str(uuid.uuid4())
        
        world = TinyWorld(f"Brainstorm_{session_id}")
        for agent in agents:
            world.add_agent(agent)
        
        # Set up brainstorming context
        brainstorm_prompt = f"""
        Brainstorming Topic: {request.topic}
        """
        if request.context:
            brainstorm_prompt += f"\nContext: {request.context}"
        
        brainstorm_prompt += "\nLet's brainstorm creative ideas and solutions. Feel free to build on each other's ideas."
        
        world.broadcast(brainstorm_prompt)
        
        # Run brainstorming rounds
        interactions = []
        for round_num in range(5):  # 5 rounds for good idea development
            world.run(1)
            round_interactions = world.get_agent_interactions()
            interactions.extend(round_interactions)
        
        # Extract ideas
        checkpoint_name = f"brainstorm_{session_id}"
        control.checkpoint(checkpoint_name)
        
        ideas = self.extractor.extract_results_from_checkpoint(
            checkpoint_name=checkpoint_name,
            extraction_objective=f"Extract creative ideas and solutions for: {request.topic}"
        )
        
        return {
            "session_id": session_id,
            "topic": request.topic,
            "context": request.context,
            "interactions": interactions,
            "ideas": ideas,
            "participants": [agent.name for agent in agents]
        }
    
    def create_collaborative_story(self, request: StorytellingRequest, agents: List[TinyPerson]) -> Dict[str, Any]:
        """Create collaborative story with agents"""
        session_id = str(uuid.uuid4())
        
        story = TinyStory()
        
        # Set story parameters
        story_prompt = f"""
        Story Theme: {request.theme}
        Genre: {request.genre}
        
        Let's create a collaborative story. Each participant should contribute to building the narrative.
        """
        
        # Have agents collaborate on story
        story_content = story.tell_story(
            agents=agents,
            theme=request.theme,
            genre=request.genre
        )
        
        return {
            "session_id": session_id,
            "theme": request.theme,
            "genre": request.genre,
            "story_content": story_content,
            "participants": [agent.name for agent in agents]
        }
    
    def _extract_group_consensus(self, interactions: List[Dict[str, Any]], topic: str) -> Dict[str, Any]:
        """Extract group consensus from interactions"""
        # Simple consensus extraction - can be enhanced with more sophisticated analysis
        positive_sentiment = 0
        negative_sentiment = 0
        neutral_sentiment = 0
        
        for interaction in interactions:
            content = interaction.get("content", "").lower()
            
            # Basic sentiment analysis
            if any(word in content for word in ["good", "great", "excellent", "love", "like", "positive"]):
                positive_sentiment += 1
            elif any(word in content for word in ["bad", "terrible", "hate", "dislike", "negative", "poor"]):
                negative_sentiment += 1
            else:
                neutral_sentiment += 1
        
        total_interactions = len(interactions)
        
        return {
            "topic": topic,
            "total_interactions": total_interactions,
            "sentiment_distribution": {
                "positive": positive_sentiment / total_interactions if total_interactions > 0 else 0,
                "negative": negative_sentiment / total_interactions if total_interactions > 0 else 0,
                "neutral": neutral_sentiment / total_interactions if total_interactions > 0 else 0
            },
            "consensus_level": "high" if max(positive_sentiment, negative_sentiment, neutral_sentiment) / total_interactions > 0.6 else "moderate"
        }