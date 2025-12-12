#!/usr/bin/env python3
"""
Cohere API Test Script
This script will help debug which models are available with your API key
"""

import cohere
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

api_key = os.getenv("COHERE_API_KEY")

print("=" * 60)
print("🔍 COHERE API DEBUGGING TOOL")
print("=" * 60)
print()

# Check if API key exists
if not api_key or api_key == "your-cohere-api-key-here":
    print("❌ ERROR: No valid API key found in .env file!")
    print("Please add your Cohere API key to the .env file")
    exit(1)

print(f"✓ API Key found: {api_key[:10]}...{api_key[-4:]}")
print()

# Initialize Cohere client
try:
    co = cohere.Client(api_key)
    print("✓ Cohere client initialized successfully")
    print()
except Exception as e:
    print(f"❌ Failed to initialize Cohere client: {e}")
    exit(1)

# List available models
print("📋 Testing available chat models...")
print("-" * 60)

# List of models to test (based on Cohere documentation)
models_to_test = [
    'command-r-plus',
    'command-r-plus-08-2024',
    'command-r',
    'command-r-08-2024', 
    'command-r7b-12-2024',
    'command-nightly',
    'command-light',
    'command-light-nightly'
]

working_models = []
failed_models = []

for model_name in models_to_test:
    try:
        print(f"Testing: {model_name}...", end=" ")
        response = co.chat(
            model=model_name,
            message="Hello",
            max_tokens=10
        )
        print("✓ WORKS")
        working_models.append(model_name)
    except Exception as e:
        error_msg = str(e)
        if "404" in error_msg:
            print("✗ Not available (404)")
        elif "401" in error_msg:
            print("✗ Authentication error")
        elif "403" in error_msg:
            print("✗ Access denied")
        else:
            print(f"✗ Error: {error_msg[:50]}...")
        failed_models.append((model_name, str(e)))

print()
print("=" * 60)
print("📊 RESULTS")
print("=" * 60)
print()

if working_models:
    print(f"✅ WORKING MODELS ({len(working_models)}):")
    for model in working_models:
        print(f"   • {model}")
    print()
    print(f"💡 RECOMMENDATION: Use '{working_models[0]}' in your code")
    print()
    
    # Test actual functionality
    print("-" * 60)
    print(f"🧪 Testing actual functionality with '{working_models[0]}'...")
    print("-" * 60)
    try:
        test_message = "I'm feeling a bit anxious today"
        response = co.chat(
            model=working_models[0],
            message=f"A person said: '{test_message}'. Write back a single poetic line that reflects their emotional state.",
            max_tokens=100,
            temperature=0.8
        )
        print(f"Input: {test_message}")
        print(f"AI Response: {response.text.strip()}")
        print()
        print("✅ EVERYTHING WORKS! Use this model in cohere_utils.py")
    except Exception as e:
        print(f"❌ Error during test: {e}")
else:
    print("❌ NO WORKING MODELS FOUND!")
    print()
    print("Possible issues:")
    print("1. Invalid API key")
    print("2. API key doesn't have access to chat models")
    print("3. Cohere API might be having issues")
    print()
    print("Failed attempts:")
    for model, error in failed_models[:3]:
        print(f"   • {model}: {error[:80]}...")

print()
print("=" * 60)
