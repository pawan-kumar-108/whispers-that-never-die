import cohere
import os
from dotenv import load_dotenv
load_dotenv()

co = cohere.Client(os.getenv("COHERE_API_KEY"))
def generate_poetic_reflection(user_input=""):
    if not user_input:
        return "Tell me a little more about how you're feeling."

    message = (
        f"A person said: '{user_input}'. "
        f"Write back a single poetic line that reflects, deepens, or gently rephrases their emotional state. "
        f"Be soft, thoughtful, human, and kind."
    )

    try:
        # Updated to use chat() instead of deprecated generate()
        # Using 'command-r-plus-08-2024' - verified working model
        response = co.chat(
            model='command-r-plus-08-2024',
            message=message,
            max_tokens=100,
            temperature=0.8
        )
        return response.text.strip()
    except Exception as e:
        print("❌ Error inside generate_poetic_reflection():", e)
        return "Your feelings are valid. 💙"
