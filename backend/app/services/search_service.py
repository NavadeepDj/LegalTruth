"""Google Search grounding fallback service.

When the document doesn't answer the question, this service uses
Gemini with Google Search grounding to find external sources.
"""

import json
import logging
from google import genai
from google.genai import types
from app.config import settings
from app.models.schemas import WebSource

logger = logging.getLogger(__name__)

SEARCH_SYSTEM_PROMPT = """You are a legal information search assistant. The user's own document did not contain the answer to their question. You are searching public sources for relevant information.

## RULES
1. Prefer official government and regulatory sources.
2. Prefer authoritative institutional guidance.
3. NEVER present web information as though it came from the user's documents.
4. Explain how the external information may help the user proceed.
5. Identify important uncertainty or missing facts.
6. NEVER guarantee legal outcomes.

## RESPONSE FORMAT

Respond with valid JSON:

{
  "answer": "Summary of what external sources say about this question",
  "web_sources": [
    {
      "title": "Source title",
      "url": "Source URL",
      "snippet": "Relevant excerpt from the source",
      "source_type": "government" | "institutional" | "web"
    }
  ],
  "action_guidance": ["Recommended next steps"],
  "caveat": "Important limitations or uncertainties"
}
"""


def search_external_sources(question: str, document_context: str = "") -> dict:
    """Search Google for external legal information.

    Args:
        question: The user's original question.
        document_context: Brief context about what the document does/doesn't contain.

    Returns:
        Dict with answer, web_sources, action_guidance.
    """
    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    search_prompt = f"""The user asked this question about their legal document, but the document did not contain the answer:

Question: "{question}"

{f"Document context: {document_context}" if document_context else ""}

Search for relevant legal information from official and authoritative public sources. Focus on:
1. Official government/regulatory guidance
2. Authoritative institutional sources
3. Reputable legal information sources

Respond with the JSON format specified in your instructions."""

    models_to_try = [settings.GEMINI_MODEL, "gemini-flash-latest", "gemini-3.5-flash"]
    seen = set()
    candidate_models = [m for m in models_to_try if m and not (m in seen or seen.add(m))]

    last_error = None
    for model_name in candidate_models:
        try:
            logger.info(f"Attempting Google search grounding with model: {model_name}")
            response = client.models.generate_content(
                model=model_name,
                contents=search_prompt,
                config=types.GenerateContentConfig(
                    system_instruction=SEARCH_SYSTEM_PROMPT,
                    temperature=0.2,
                    tools=[types.Tool(google_search=types.GoogleSearch())],
                ),
            )

            # Parse JSON from response text
            cleaned = response.text.strip()
            if cleaned.startswith("```"):
                lines = cleaned.split("\n")
                lines = [l for l in lines[1:] if l.strip() != "```"]
                cleaned = "\n".join(lines)

            try:
                result = json.loads(cleaned)
            except json.JSONDecodeError:
                result = {"answer": cleaned, "web_sources": [], "action_guidance": []}

            web_sources = [
                WebSource(**src) for src in result.get("web_sources", [])
            ]

            # Also check grounding metadata for additional sources
            if response.candidates and response.candidates[0].grounding_metadata:
                grounding = response.candidates[0].grounding_metadata
                if hasattr(grounding, 'grounding_chunks') and grounding.grounding_chunks:
                    for chunk in grounding.grounding_chunks:
                        if hasattr(chunk, 'web') and chunk.web:
                            existing_urls = {s.url for s in web_sources}
                            url = getattr(chunk.web, 'uri', '') or ''
                            if url and url not in existing_urls:
                                web_sources.append(WebSource(
                                    title=getattr(chunk.web, 'title', '') or "External Source",
                                    url=url,
                                    snippet="",
                                    source_type="web",
                                ))

            return {
                "answer": result.get("answer", ""),
                "web_sources": web_sources,
                "action_guidance": result.get("action_guidance", []),
            }

        except Exception as e:
            logger.warning(f"Search grounding model {model_name} failed with {type(e).__name__}: {e}. Trying fallback...")
            last_error = e
            continue

    logger.error(f"Google Search grounding failed across models: {last_error}")
    return {
        "answer": "We were unable to search external sources due to high demand. Please try again shortly.",
        "web_sources": [],
        "action_guidance": ["Try searching for this topic on official government websites."],
    }
