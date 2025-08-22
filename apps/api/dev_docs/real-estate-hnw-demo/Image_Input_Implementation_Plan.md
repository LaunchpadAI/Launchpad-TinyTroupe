# Image Input Capability for TinyTroupe Property Assessments

## Current Architecture Analysis

**★ Insight ─────────────────────────────────────**
TinyTroupe currently uses simple string-based content in its stimulus system, but the OpenAI API integration is already flexible enough to support multimodal messages. We need to extend the `StimulusConfig` model to support images and update the message creation to handle the OpenAI vision API format.
**─────────────────────────────────────────────────**

## Implementation Plan

### 1. Backend Changes

#### A. Update Models (`src/models/simulation.py`)
- Extend `StimulusConfig` to support images:
  ```python
  class StimulusConfig(BaseModel):
      type: str = Field(..., description="Type of stimulus")
      content: str = Field(..., description="Main stimulus content")
      images: Optional[List[str]] = Field(None, description="Base64 encoded images")
      context: Optional[Dict[str, Any]] = Field(None, description="Additional context")
  ```

#### B. Update OpenAI Utils (`packages/tinytroupe-original/tinytroupe/openai_utils.py`)
- Add image handling support to `send_message()` method
- Convert simple string messages to multimodal format when images are present
- Handle the vision API format: `[{"type": "text", "text": "..."}, {"type": "image_url", "image_url": "data:image/jpeg;base64,..."}]`

#### C. Update Simulation Service (`src/services/simulation_service.py`) 
- Modify stimulus handling to support images
- Create multimodal messages when broadcasting to agents
- Ensure image context is preserved in conversation flow

#### D. Add Image Processing Utilities
- Base64 encoding/decoding helpers
- Image validation (format, size limits)
- File upload handling in FastAPI endpoints

### 2. Frontend Changes

#### A. Property Focus Group UI Enhancement
- Add image upload component to property details form
- Support multiple property images (exterior, interior, amenities)
- Preview uploaded images before simulation
- Drag-and-drop image upload interface

#### B. File Upload Integration
```typescript
interface PropertyDetails {
  // ... existing fields
  images?: File[]; // Property photos
}

interface StimulusConfig {
  type: string;
  content: string;
  images?: string[]; // Base64 encoded images
}
```

#### C. Image Display in Results
- Show property images alongside conversation
- Reference images in agent responses
- Maintain image context throughout simulation

### 3. API Endpoints

#### A. Image Upload Endpoint
```python
@router.post("/upload-property-images")
async def upload_property_images(files: List[UploadFile]):
    # Validate image files
    # Convert to base64
    # Return image data for frontend
```

#### B. Enhanced Simulation Endpoint
- Accept images in simulation requests
- Validate image data and formats
- Pass images to TinyTroupe agents

### 4. Vision-Enabled Models

#### A. Model Selection
- Use `gpt-4o` or `gpt-4o-mini` (vision-capable models)
- Update default model in config for vision support
- Handle graceful fallback for non-vision models

#### B. Prompt Engineering
- Enhance property assessment prompts to reference images
- Guide agents to analyze visual elements
- Extract insights about property features from images

## Technical Implementation Details

### Image Processing Flow
1. **Frontend**: User uploads property images via drag-and-drop
2. **Validation**: Check file types (JPEG, PNG), size limits (< 20MB)
3. **Encoding**: Convert to base64 for API transmission
4. **Backend**: Receive images in simulation request
5. **TinyTroupe**: Create multimodal messages for OpenAI API
6. **Analysis**: Agents analyze both text and visual property information

### Message Format Transformation
```python
# Current format
{"role": "user", "content": "What do you think of this property?"}

# New multimodal format
{
    "role": "user", 
    "content": [
        {"type": "text", "text": "What do you think of this property?"},
        {"type": "image_url", "image_url": "data:image/jpeg;base64,/9j/4AAQ..."}
    ]
}
```

### Real Estate Use Cases
- **Exterior Analysis**: Curb appeal, architecture style, landscaping
- **Interior Assessment**: Layout, finishes, staging, condition
- **Amenity Evaluation**: Pool, kitchen, bathrooms, special features
- **Neighborhood Context**: Surrounding properties, location factors

## Benefits
- **Rich Context**: Agents can see what they're discussing
- **Better Insights**: Visual analysis enhances verbal descriptions
- **Realistic Assessments**: More accurate property evaluations
- **Enhanced UX**: Intuitive image-based property input

## Files to Modify
1. `apps/api/src/models/simulation.py` - Add image support to StimulusConfig
2. `packages/tinytroupe-original/tinytroupe/openai_utils.py` - Multimodal message handling
3. `apps/api/src/services/simulation_service.py` - Image-aware stimulus processing
4. `apps/web/src/app/property-focus-group/page.tsx` - Image upload UI
5. `apps/api/src/routers/simulations.py` - Enhanced endpoints

This implementation will enable property images to be analyzed by TinyTroupe agents, providing much richer and more realistic real estate focus group discussions!

## OpenAI Vision API Reference

Based on the provided OpenAI API example:

```python
import base64
from openai import OpenAI

client = OpenAI()

# Function to encode the image
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")

# Path to your image
image_path = "path_to_your_image.jpg"

# Getting the Base64 string
base64_image = encode_image(image_path)

response = client.responses.create(
    model="gpt-4.1",
    input=[
        {
            "role": "user",
            "content": [
                { "type": "input_text", "text": "what's in this image?" },
                {
                    "type": "input_image",
                    "image_url": f"data:image/jpeg;base64,{base64_image}",
                },
            ],
        }
    ],
)

print(response.output_text)
```

This format will be integrated into TinyTroupe's existing message system to enable multimodal property assessments.