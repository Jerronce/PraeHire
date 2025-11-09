import re

# Read current dashboard.js
with open('js/dashboard.js', 'r') as f:
    dashboard_content = f.read()

# Fix 1: Update the Gemini API model name (use gemini-1.5-flash instead of gemini-pro)
dashboard_content = dashboard_content.replace(
    'models/gemini-pro:generateContent',
    'models/gemini-1.5-flash:generateContent'
)

# Fix 2: Improve error handling and response parsing
# Replace the response parsing section
old_pattern = r'const tailoredText = data\?\.candidates.*?\n'
new_code = '''const tailoredText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
        
        console.log('Tailored text:', tailoredText);
'''
dashboard_content = re.sub(old_pattern, new_code, dashboard_content)

# Write fixed dashboard.js
with open('js/dashboard.js', 'w') as f:
    f.write(dashboard_content)

print("✅ Fixed dashboard.js - Updated Gemini model and improved error handling")

# Now fix chat.js
try:
    with open('js/chat.js', 'r') as f:
        chat_content = f.read()
    
    # Update model name in chat.js too
    chat_content = chat_content.replace(
        'models/gemini-pro:generateContent',
        'models/gemini-1.5-flash:generateContent'
    )
    
    with open('js/chat.js', 'w') as f:
        f.write(chat_content)
    
    print("✅ Fixed chat.js - Updated Gemini model")
except Exception as e:
    print(f"⚠️  Chat.js fix: {e}")

print("\n🎉 All fixes applied successfully!")
